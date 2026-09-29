from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import shutil

ROOT_DIR = Path(__file__).parent

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Password Hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Token Management
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth Helper
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "user")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic Models
class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: List[str]
    category: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    featured: bool = False

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    featured: Optional[bool] = None

class AppointmentCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service_type: str
    preferred_date: str
    preferred_time: str
    description: str

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class TestimonialCreate(BaseModel):
    name: str
    company: str
    role: str
    content: str
    image_url: Optional[str] = None
    rating: int = 5

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    rating: Optional[int] = None

class ServiceUpdate(BaseModel):
    title: str
    description: str
    icon: str

# Auth Endpoints
@api_router.post("/auth/login")
async def login(request: LoginRequest, response: Response):
    email = request.email.lower().strip()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "admin"),
        "token": access_token
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

# Projects Endpoints
@api_router.get("/projects")
async def get_projects(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    
    projects = await db.projects.find(query, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.post("/projects")
async def create_project(project: ProjectCreate, user: dict = Depends(get_current_user)):
    project_dict = project.model_dump()
    project_dict["id"] = str(uuid.uuid4())
    project_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    project_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.projects.insert_one(project_dict)
    project_dict.pop("_id", None)
    return project_dict

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, project: ProjectUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in project.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return updated

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# Appointments Endpoints
@api_router.get("/appointments")
async def get_appointments(user: dict = Depends(get_current_user)):
    appointments = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return appointments

@api_router.post("/appointments")
async def create_appointment(appointment: AppointmentCreate):
    appointment_dict = appointment.model_dump()
    appointment_dict["id"] = str(uuid.uuid4())
    appointment_dict["status"] = "pending"
    appointment_dict["notes"] = ""
    appointment_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.appointments.insert_one(appointment_dict)
    return {"message": "Appointment scheduled successfully", "id": appointment_dict["id"]}

@api_router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, appointment: AppointmentUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in appointment.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.appointments.update_one({"id": appointment_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    updated = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    return updated

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, user: dict = Depends(get_current_user)):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}

# Contact Endpoint
@api_router.post("/contact")
async def create_contact(contact: ContactCreate):
    contact_dict = contact.model_dump()
    contact_dict["id"] = str(uuid.uuid4())
    contact_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    contact_dict["read"] = False
    
    await db.contacts.insert_one(contact_dict)
    return {"message": "Message sent successfully"}

@api_router.get("/contacts")
async def get_contacts(user: dict = Depends(get_current_user)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

# Testimonials Endpoints
@api_router.get("/testimonials")
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(20)
    return testimonials

@api_router.post("/testimonials")
async def create_testimonial(testimonial: TestimonialCreate, user: dict = Depends(get_current_user)):
    testimonial_dict = testimonial.model_dump()
    testimonial_dict["id"] = str(uuid.uuid4())
    testimonial_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.testimonials.insert_one(testimonial_dict)
    testimonial_dict.pop("_id", None)
    return testimonial_dict

@api_router.put("/testimonials/{testimonial_id}")
async def update_testimonial(testimonial_id: str, testimonial: TestimonialUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in testimonial.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = await db.testimonials.update_one({"id": testimonial_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    updated = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    return updated

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, user: dict = Depends(get_current_user)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}

# Services Endpoints
@api_router.get("/services")
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(20)
    if not services:
        # Return default services
        return [
            {"id": "1", "title": "Desarrollo Web", "description": "Aplicaciones web modernas con Angular y React", "icon": "globe"},
            {"id": "2", "title": "Domótica", "description": "Soluciones IoT con Arduino", "icon": "home"},
            {"id": "3", "title": "Sistemas Empresariales", "description": "Software robusto con C# y Java", "icon": "building"},
            {"id": "4", "title": "Bases de Datos", "description": "SQL Server, MySQL, PostgreSQL, MongoDB", "icon": "database"},
            {"id": "5", "title": "Consultoría", "description": "Asesoramiento técnico especializado", "icon": "users"}
        ]
    return services

@api_router.put("/services")
async def update_services(services: List[ServiceUpdate], user: dict = Depends(get_current_user)):
    await db.services.delete_many({})
    services_list = []
    for i, service in enumerate(services):
        service_dict = service.model_dump()
        service_dict["id"] = str(i + 1)
        services_list.append(service_dict)
    
    if services_list:
        await db.services.insert_many(services_list)
    return services_list

# Profile Endpoint
@api_router.get("/profile")
async def get_profile():
    profile = await db.profile.find_one({}, {"_id": 0})
    if not profile:
        return {
            "name": "Daniel Ortega",
            "title": "Desarrollador Full Stack & IoT",
            "bio": "Especialista en desarrollo de software con más de 15 años de experiencia en tecnologías web, sistemas empresariales y domótica.",
            "email": "danielortegalozano@gmail.com",
            "phone": "+528112141456",
            "location": "Tepeapulco, Hidalgo",
            "skills": ["Angular", "React", "C#", "Java", "Arduino", "SQL Server", "MongoDB"],
            "social": {
                "github": "https://github.com/danielortega",
                "linkedin": "https://linkedin.com/in/danielortega"
            },
            "logo_url": None,
        }
    return profile

@api_router.put("/profile")
async def update_profile(profile: dict, user: dict = Depends(get_current_user)):
    await db.profile.delete_many({})
    await db.profile.insert_one(profile)
    # insert_one mutates the dict in place with _id: ObjectId, which is not JSON-serializable
    profile.pop("_id", None)
    return profile

# File Upload Endpoint
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    file_extension = Path(file.filename).suffix
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    backend_url = os.environ.get("FRONTEND_URL", "").rstrip("/")
    # Servido por StaticFiles en /uploads (nginx también proxea /uploads/)
    file_url = f"{backend_url}/uploads/{file_name}" if backend_url else f"/uploads/{file_name}"
    
    return {"url": file_url, "filename": file_name}

# Stats Endpoint (Admin Dashboard)
@api_router.get("/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    projects_count = await db.projects.count_documents({})
    appointments_count = await db.appointments.count_documents({})
    pending_appointments = await db.appointments.count_documents({"status": "pending"})
    contacts_count = await db.contacts.count_documents({})
    unread_contacts = await db.contacts.count_documents({"read": False})
    
    return {
        "projects": projects_count,
        "appointments": appointments_count,
        "pending_appointments": pending_appointments,
        "contacts": contacts_count,
        "unread_contacts": unread_contacts
    }

# Health Check
@api_router.get("/")
async def root():
    return {"message": "Daniel Ortega Portfolio API", "status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Seed admin and sample data
@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("id", unique=True)
    await db.appointments.create_index("id", unique=True)
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@danielortega.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Daniel Ortega",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")
    
    # Write test credentials
    memory_dir = Path("/app/memory")
    memory_dir.mkdir(exist_ok=True)
    with open(memory_dir / "test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n")
        f.write(f"## Admin User\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: admin\n\n")
        f.write(f"## Auth Endpoints\n")
        f.write(f"- POST /api/auth/login\n")
        f.write(f"- POST /api/auth/logout\n")
        f.write(f"- GET /api/auth/me\n")
    
    # Seed portfolio projects (clientes reales Dany Solutions)
    portfolio_seed = [
            {
                "id": "proj-podologia",
                "title": "PodoclinicAM",
                "description": "Sitio web y sistema de citas para clínica de podología: agenda en línea, panel administrativo y recordatorios.",
                "technologies": ["React", "FastAPI", "MongoDB", "WhatsApp"],
                "category": "web",
                "image_url": "/portfolio-logos/podologia.png",
                "demo_url": "https://podologia.danysolutions.online/",
                "github_url": None,
                "featured": True,
            },
            {
                "id": "proj-rehabilita",
                "title": "Rehabilitá",
                "description": "Plataforma web para clínica de fisioterapia con agenda de citas, servicios, productos y gestión administrativa.",
                "technologies": ["React", "FastAPI", "MongoDB", "WhatsApp"],
                "category": "web",
                "image_url": "/portfolio-logos/rehabilita.png",
                "demo_url": "https://rehabilita.danysolutions.online/",
                "github_url": None,
                "featured": True,
            },
            {
                "id": "proj-moralesbox",
                "title": "Morales Box",
                "description": "Sitio web para gimnasio de boxeo: paquetes, productos, eventos y registro de usuarios.",
                "technologies": ["React", "FastAPI", "MongoDB", "Stripe"],
                "category": "web",
                "image_url": "/portfolio-logos/moralesbox.png",
                "demo_url": "https://moralesbox.danysolutions.online/",
                "github_url": None,
                "featured": True,
            },
            {
                "id": "proj-lozmar",
                "title": "Lozmar",
                "description": "Sistema web empresarial a medida para operación y gestión del negocio.",
                "technologies": ["React", "Node.js", "PostgreSQL"],
                "category": "enterprise",
                "image_url": "/portfolio-logos/lozmar.svg",
                "demo_url": "https://lozmar.danysolutions.online/",
                "github_url": None,
                "featured": True,
            },
            {
                "id": "proj-pancitapio",
                "title": "Pancita Pio",
                "description": "Sistema de restaurante para taquería de carnitas: menú, comandas, caja, cocina e pedidos por WhatsApp con IA.",
                "technologies": ["React", "Node.js", "PostgreSQL", "WhatsApp", "IA"],
                "category": "web",
                "image_url": "/portfolio-logos/pancitapio.png",
                "demo_url": "https://pancitapio.danysolutions.online/",
                "github_url": None,
                "featured": True,
            },
            {
                "id": "proj-ambar",
                "title": "Carnitas Ambar",
                "description": "Plataforma de restaurante para carnitas: pedidos por mesa, WhatsApp, cocina, caja e impresión térmica.",
                "technologies": ["React", "Node.js", "PostgreSQL", "WhatsApp", "IA"],
                "category": "web",
                "image_url": "/portfolio-logos/ambar.png",
                "demo_url": "https://ambar.danysolutions.online/",
                "github_url": None,
                "featured": True,
            },
        ]
    # Solo inserta proyectos que no existan. Nunca sobrescribe ediciones del admin en redeploy.
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0
    for project in portfolio_seed:
        existing = await db.projects.find_one({"id": project["id"]}, {"_id": 1})
        if existing:
            continue
        await db.projects.insert_one({**project, "created_at": now, "updated_at": now})
        inserted += 1
    logger.info("Portfolio seed: %s nuevos, %s ya existían (sin modificar)", inserted, len(portfolio_seed) - inserted)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
