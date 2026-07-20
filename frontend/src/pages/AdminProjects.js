import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Image, X, Upload, Loader2, Youtube } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import {
  resolveProjectMediaUrl,
  youtubeEmbedUrl,
  youtubeThumbUrl,
} from '../lib/projectMedia';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const categories = [
  { value: 'web', label: 'Web / Apps' },
  { value: 'iot', label: 'Arduino / IoT' },
  { value: 'enterprise', label: 'C# / Java' },
];

const emptyProject = {
  title: '',
  description: '',
  technologies: [],
  category: 'web',
  image_url: '',
  video_url: '',
  demo_url: '',
  github_url: '',
  featured: false,
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`);
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData(emptyProject);
    setTechInput('');
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      ...emptyProject,
      ...project,
      image_url: project.image_url || '',
      video_url: project.video_url || '',
      technologies: project.technologies || [],
    });
    setTechInput('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addTech = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const removeTech = (tech) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const { data } = await axios.post(`${API_URL}/api/upload`, body, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, image_url: data.url }));
      toast.success('Imagen subida');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      demo_url: formData.demo_url || null,
      github_url: formData.github_url || null,
    };

    try {
      if (editingProject) {
        await axios.put(`${API_URL}/api/projects/${editingProject.id}`, payload, { headers });
        toast.success('Proyecto actualizado');
      } else {
        await axios.post(`${API_URL}/api/projects`, payload, { headers });
        toast.success('Proyecto creado');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error al guardar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await axios.delete(`${API_URL}/api/projects/${projectId}`, { headers });
      toast.success('Proyecto eliminado');
      fetchProjects();
    } catch (error) {
      toast.error('Error al eliminar el proyecto');
    }
  };

  const imagePreview = resolveProjectMediaUrl(formData.image_url);
  const videoEmbed = youtubeEmbedUrl(formData.video_url);
  const videoThumb = youtubeThumbUrl(formData.video_url);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-projects">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Proyectos</h1>
          <p className="text-[#A3A3A3]">Gestiona los proyectos de tu portafolio</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
          data-testid="create-project-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#141414] border border-[#262626] p-12 text-center">
          <Image className="w-12 h-12 text-[#525252] mx-auto mb-4" />
          <p className="text-[#A3A3A3] mb-4">No hay proyectos aún</p>
          <Button
            onClick={openCreateModal}
            className="bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
          >
            Crear Primer Proyecto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const cardImage =
              resolveProjectMediaUrl(project.image_url) ||
              youtubeThumbUrl(project.video_url);
            return (
              <div
                key={project.id}
                className="bg-[#141414] border border-[#262626] overflow-hidden group"
                data-testid={`project-card-${project.id}`}
              >
                <div className="aspect-video bg-[#0A0A0A] relative">
                  {cardImage ? (
                    <img
                      src={cardImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-[#262626]" />
                    </div>
                  )}
                  {project.video_url ? (
                    <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-mono bg-black/70 text-white flex items-center gap-1">
                      <Youtube className="w-3 h-3" /> Video
                    </span>
                  ) : null}
                  {project.featured && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-xs font-mono bg-[#FF2A00] text-white">
                      Destacado
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold mb-2 truncate">{project.title}</h3>
                  <p className="text-sm text-[#A3A3A3] mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies?.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono text-[#525252] px-2 py-0.5 bg-[#0A0A0A]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(project)}
                      className="flex-1 border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] rounded-none"
                      data-testid={`edit-project-${project.id}`}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="border-[#262626] hover:border-red-500 hover:text-red-500 rounded-none"
                      data-testid={`delete-project-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#141414] border-[#262626] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="project-form">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                Título *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Nombre del proyecto"
                className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                data-testid="project-input-title"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                Descripción *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe el proyecto..."
                rows={4}
                className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none resize-none"
                data-testid="project-input-description"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                Categoría
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-[#262626]">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-[#262626]">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 border border-[#262626] p-4 bg-[#0A0A0A]">
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] block">
                Imagen del proyecto
              </label>
              <div className="aspect-video bg-[#141414] border border-[#262626] overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-[#525252]">
                    <Image className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-xs">Sin imagen</p>
                  </div>
                )}
              </div>
              <Input
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="URL o sube un archivo"
                className="bg-[#141414] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                data-testid="project-input-image"
              />
              <div className="flex flex-wrap gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <Button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="bg-[#262626] hover:bg-[#333] text-white rounded-none"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Subir imagen
                </Button>
                {formData.image_url ? (
                  <Button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                    className="bg-transparent border border-[#262626] hover:border-[#FF2A00] text-[#A3A3A3] hover:text-[#FF2A00] rounded-none"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Quitar
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 border border-[#262626] p-4 bg-[#0A0A0A]">
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] flex items-center gap-2">
                <Youtube className="w-4 h-4 text-[#FF2A00]" />
                Video de YouTube
              </label>
              <Input
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                className="bg-[#141414] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                data-testid="project-input-video"
              />
              <div className="aspect-video bg-[#141414] border border-[#262626] overflow-hidden flex items-center justify-center">
                {videoEmbed ? (
                  <iframe
                    title="Vista previa YouTube"
                    src={videoEmbed}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoThumb ? (
                  <img src={videoThumb} alt="Miniatura YouTube" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-[#525252] px-4">
                    <Youtube className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-xs">Pega un enlace de YouTube para ver la vista previa</p>
                  </div>
                )}
              </div>
              {formData.video_url && !videoEmbed ? (
                <p className="text-xs text-amber-500">URL de YouTube no válida</p>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                Tecnologías
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  placeholder="Añadir tecnología..."
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                  data-testid="project-input-tech"
                />
                <Button
                  type="button"
                  onClick={addTech}
                  className="bg-[#262626] hover:bg-[#333] text-white rounded-none"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-[#262626] text-white"
                  >
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-[#FF2A00]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  URL de Demo
                </label>
                <Input
                  name="demo_url"
                  value={formData.demo_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  URL de GitHub
                </label>
                <Input
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded-none border-[#262626] bg-[#0A0A0A] text-[#FF2A00] focus:ring-[#FF2A00]"
              />
              <label htmlFor="featured" className="text-sm">
                Marcar como proyecto destacado
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1 border-[#262626] hover:border-[#FF2A00] rounded-none"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || uploadingImage}
                className="flex-1 bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
                data-testid="project-submit-button"
              >
                {saving ? 'Guardando...' : editingProject ? 'Actualizar' : 'Crear Proyecto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
