import { useState, useEffect } from 'react';
import { Save, User, Globe, Home, Building2, Database, Users } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const iconOptions = [
  { value: 'globe', label: 'Web', icon: Globe },
  { value: 'home', label: 'Domótica', icon: Home },
  { value: 'building', label: 'Empresas', icon: Building2 },
  { value: 'database', label: 'Datos', icon: Database },
  { value: 'users', label: 'Consultoría', icon: Users },
];

export default function AdminSettings() {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    skills: [],
    social: { github: '', linkedin: '' },
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, servicesRes] = await Promise.all([
          axios.get(`${API_URL}/api/profile`),
          axios.get(`${API_URL}/api/services`),
        ]);
        setProfile(profileRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setProfile((prev) => ({
        ...prev,
        social: { ...prev.social, [socialKey]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/profile`, profile, { headers });
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const saveServices = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/services`, services, { headers });
      toast.success('Servicios actualizados');
    } catch (error) {
      toast.error('Error al guardar los servicios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-settings">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Configuración</h1>
        <p className="text-[#A3A3A3]">Administra tu información personal y servicios</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[#141414] border border-[#262626] p-1 rounded-none">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-[#FF2A00] data-[state=active]:text-white rounded-none px-6"
          >
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="services"
            className="data-[state=active]:bg-[#FF2A00] data-[state=active]:text-white rounded-none px-6"
          >
            Servicios
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#FF2A00]" />
              <h2 className="font-bold">Información Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Nombre Completo
                </label>
                <Input
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                  data-testid="settings-input-name"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Título Profesional
                </label>
                <Input
                  name="title"
                  value={profile.title}
                  onChange={handleProfileChange}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Teléfono
                </label>
                <Input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Ubicación
                </label>
                <Input
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  GitHub URL
                </label>
                <Input
                  name="social.github"
                  value={profile.social?.github || ''}
                  onChange={handleProfileChange}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Biografía
                </label>
                <Textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  rows={4}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Habilidades
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Añadir habilidad..."
                    className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    className="bg-[#262626] hover:bg-[#333] text-white rounded-none"
                  >
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[#262626] text-white"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-[#FF2A00]">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
              data-testid="settings-save-profile"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </Button>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {services.map((service, index) => (
            <div
              key={service.id || index}
              className="bg-[#141414] border border-[#262626] p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                    Título
                  </label>
                  <Input
                    value={service.title}
                    onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                    className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                    Descripción
                  </label>
                  <Input
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={saveServices}
            disabled={saving}
            className="bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
            data-testid="settings-save-services"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Servicios'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
