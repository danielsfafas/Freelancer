import { useState, useEffect } from 'react';
import { FolderKanban, Calendar, MessageSquare, TrendingUp, Clock, Users } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../lib/apiBase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    appointments: 0,
    pending_appointments: 0,
    contacts: 0,
    unread_contacts: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, appointmentsRes] = await Promise.all([
          axios.get(`${API_URL}/api/stats`, { headers }),
          axios.get(`${API_URL}/api/appointments`, { headers }),
        ]);

        setStats(statsRes.data);
        setRecentAppointments(appointmentsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Proyectos', value: stats.projects, icon: FolderKanban, color: 'text-blue-400' },
    { label: 'Citas Totales', value: stats.appointments, icon: Calendar, color: 'text-green-400' },
    { label: 'Citas Pendientes', value: stats.pending_appointments, icon: Clock, color: 'text-yellow-400' },
    { label: 'Mensajes', value: stats.contacts, icon: MessageSquare, color: 'text-purple-400' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
      completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`px-2 py-1 text-xs font-mono border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-[#A3A3A3]">Resumen general de tu portafolio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#141414] border border-[#262626] p-6 group hover:border-[#FF2A00] transition-colors"
              data-testid={`stat-card-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#525252]">
                  {stat.label}
                </span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Appointments */}
      <div className="bg-[#141414] border border-[#262626]">
        <div className="p-6 border-b border-[#262626] flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF2A00]" />
            Citas Recientes
          </h2>
          <a 
            href="/admin/appointments" 
            className="text-sm text-[#A3A3A3] hover:text-[#FF2A00] transition-colors"
          >
            Ver todas →
          </a>
        </div>
        
        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-[#A3A3A3]">
            No hay citas agendadas
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {recentAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 hover:bg-[#1C1C1C] transition-colors"
                data-testid={`appointment-row-${appointment.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-sm font-bold">
                      {appointment.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.name}</p>
                      <p className="text-sm text-[#A3A3A3]">{appointment.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[#A3A3A3]">
                      {appointment.preferred_date} · {appointment.preferred_time}
                    </p>
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/admin/projects"
          className="bg-[#141414] border border-[#262626] p-6 hover:border-[#FF2A00] transition-colors group"
        >
          <FolderKanban className="w-8 h-8 text-[#FF2A00] mb-4" />
          <h3 className="font-bold mb-1 group-hover:text-[#FF2A00] transition-colors">
            Gestionar Proyectos
          </h3>
          <p className="text-sm text-[#A3A3A3]">Añade o edita proyectos del portafolio</p>
        </a>
        
        <a
          href="/admin/appointments"
          className="bg-[#141414] border border-[#262626] p-6 hover:border-[#FF2A00] transition-colors group"
        >
          <Calendar className="w-8 h-8 text-[#FF2A00] mb-4" />
          <h3 className="font-bold mb-1 group-hover:text-[#FF2A00] transition-colors">
            Ver Citas
          </h3>
          <p className="text-sm text-[#A3A3A3]">Gestiona las citas agendadas</p>
        </a>
        
        <a
          href="/admin/messages"
          className="bg-[#141414] border border-[#262626] p-6 hover:border-[#FF2A00] transition-colors group"
        >
          <MessageSquare className="w-8 h-8 text-[#FF2A00] mb-4" />
          <h3 className="font-bold mb-1 group-hover:text-[#FF2A00] transition-colors">
            Mensajes
            {stats.unread_contacts > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-[#FF2A00] text-white">
                {stats.unread_contacts}
              </span>
            )}
          </h3>
          <p className="text-sm text-[#A3A3A3]">Lee los mensajes de contacto</p>
        </a>
      </div>
    </div>
  );
}
