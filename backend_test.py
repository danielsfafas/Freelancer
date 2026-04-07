#!/usr/bin/env python3
"""
Backend API Testing for Daniel Ortega Portfolio Website
Tests all endpoints including authentication, projects, appointments, contacts, etc.
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class PortfolioAPITester:
    def __init__(self, base_url="https://fullstack-portfolio-57.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.log_result(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        print("\n🔍 Testing Health Check...")
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test login with correct credentials
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@danielortega.com", "password": "Admin123!"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            
            # Test get current user
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            
            return True
        else:
            print("   Failed to get token from login response")
            return False

    def test_projects_crud(self):
        """Test projects CRUD operations"""
        print("\n🔍 Testing Projects CRUD...")
        
        # Get all projects
        success, projects = self.run_test(
            "Get All Projects",
            "GET",
            "projects",
            200
        )
        
        if not success:
            return False
            
        # Test filtering by category
        self.run_test(
            "Get Projects by Category",
            "GET",
            "projects?category=web",
            200
        )
        
        # Create a new project
        test_project = {
            "title": f"Test Project {datetime.now().strftime('%H%M%S')}",
            "description": "This is a test project created by automated testing",
            "technologies": ["Python", "FastAPI", "MongoDB"],
            "category": "web",
            "image_url": "https://example.com/test.jpg",
            "demo_url": "https://demo.example.com",
            "github_url": "https://github.com/test/project",
            "featured": True
        }
        
        success, created_project = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=test_project
        )
        
        if success and 'id' in created_project:
            project_id = created_project['id']
            
            # Get specific project
            self.run_test(
                "Get Specific Project",
                "GET",
                f"projects/{project_id}",
                200
            )
            
            # Update project
            update_data = {
                "title": "Updated Test Project",
                "featured": False
            }
            
            self.run_test(
                "Update Project",
                "PUT",
                f"projects/{project_id}",
                200,
                data=update_data
            )
            
            # Delete project
            self.run_test(
                "Delete Project",
                "DELETE",
                f"projects/{project_id}",
                200
            )
            
            return True
        else:
            print("   Failed to create project for further testing")
            return False

    def test_appointments_crud(self):
        """Test appointments CRUD operations"""
        print("\n🔍 Testing Appointments CRUD...")
        
        # Create appointment (public endpoint)
        test_appointment = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": "test@example.com",
            "phone": "+52 555 123 4567",
            "service_type": "web",
            "preferred_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
            "preferred_time": "10:00",
            "description": "Test appointment for automated testing"
        }
        
        success, created_appointment = self.run_test(
            "Create Appointment (Public)",
            "POST",
            "appointments",
            200,
            data=test_appointment
        )
        
        if success:
            # Get all appointments (admin only)
            success, appointments = self.run_test(
                "Get All Appointments (Admin)",
                "GET",
                "appointments",
                200
            )
            
            if success and appointments:
                # Find our test appointment
                test_appt = None
                for appt in appointments:
                    if appt.get('email') == 'test@example.com':
                        test_appt = appt
                        break
                
                if test_appt:
                    appointment_id = test_appt['id']
                    
                    # Update appointment status
                    update_data = {
                        "status": "confirmed",
                        "notes": "Test appointment confirmed"
                    }
                    
                    self.run_test(
                        "Update Appointment Status",
                        "PUT",
                        f"appointments/{appointment_id}",
                        200,
                        data=update_data
                    )
                    
                    # Delete appointment
                    self.run_test(
                        "Delete Appointment",
                        "DELETE",
                        f"appointments/{appointment_id}",
                        200
                    )
                    
                    return True
                else:
                    print("   Could not find created appointment")
                    return False
            else:
                print("   Failed to get appointments list")
                return False
        else:
            print("   Failed to create appointment")
            return False

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n🔍 Testing Contact Form...")
        
        test_contact = {
            "name": f"Test Contact {datetime.now().strftime('%H%M%S')}",
            "email": "contact@example.com",
            "message": "This is a test message from automated testing"
        }
        
        success, response = self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data=test_contact
        )
        
        if success:
            # Get contacts (admin only)
            self.run_test(
                "Get All Contacts (Admin)",
                "GET",
                "contacts",
                200
            )
            return True
        
        return success

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Test testimonials
        self.run_test(
            "Get Testimonials",
            "GET",
            "testimonials",
            200
        )
        
        # Test services
        self.run_test(
            "Get Services",
            "GET",
            "services",
            200
        )
        
        # Test profile
        self.run_test(
            "Get Profile",
            "GET",
            "profile",
            200
        )

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        # Test stats
        success, stats = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "stats",
            200
        )
        
        if success:
            required_fields = ['projects', 'appointments', 'pending_appointments', 'contacts', 'unread_contacts']
            for field in required_fields:
                if field not in stats:
                    self.log_result(f"Stats field '{field}' present", False, f"Missing field: {field}")
                else:
                    self.log_result(f"Stats field '{field}' present", True)

    def test_logout(self):
        """Test logout functionality"""
        print("\n🔍 Testing Logout...")
        
        success, response = self.run_test(
            "Admin Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            # Clear token
            self.token = None
            
            # Try to access protected endpoint (should fail)
            success, response = self.run_test(
                "Access Protected Endpoint After Logout",
                "GET",
                "stats",
                401
            )
            
            return success
        
        return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Backend API Tests for Daniel Ortega Portfolio")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_public_endpoints,
            self.test_authentication,
            self.test_admin_endpoints,
            self.test_projects_crud,
            self.test_appointments_crud,
            self.test_contact_form,
            self.test_logout
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {e}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = PortfolioAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())