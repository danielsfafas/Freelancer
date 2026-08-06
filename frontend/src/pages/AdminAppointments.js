import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, Check, X, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '../lib/apiBase';

const statusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { value: 'confirmed', label: 'Confirmada', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
  { value: 'completed', label: 'Completada', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { value: 'cancelled', label: 'Cancelada', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
];

const serviceLabels = {
  web: 'Desarrollo Web',
  domotica: 'Domótica / IoT',
  enterprise: 'Sistemas Empresariales',
  database: 'Bases de Datos',
  consulting: 'Consultoría General',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/appointments`, { headers });
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setStatus(appointment.status);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/appointments/${selectedAppointment.id}`,
        { status, notes },
        { headers }
      );
      toast.success('Cita actualizada');
      setModalOpen(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Error al actualizar la cita');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cita?')) return;

    try {
      await axios.delete(`${API_URL}/api/appointments/${appointmentId}`, { headers });
      toast.success('Cita eliminada');
      fetchAppointments();
    } catch (error) {
      toast.error('Error al eliminar la cita');
    }
  };

  const getStatusBadge = (statusValue) => {
    const option = statusOptions.find((s) => s.value === statusValue) || statusOptions[0];
    return (
      <span className={`px-2 py-1 text-xs font-mono border ${option.color}`}>
        {option.label}
      </span>
    );
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-appointments">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Citas</h1>
          <p className="text-[#A3A3A3]">Gestiona las citas de consultoría agendadas</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-[#141414] border-[#262626] text-white rounded-none">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#262626]">
            <SelectItem value="all" className="text-white hover:bg-[#262626]">
              Todas
            </SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#262626]">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-[#141414] border border-[#262626] p-12 text-center">
          <Calendar className="w-12 h-12 text-[#525252] mx-auto mb-4" />
          <p className="text-[#A3A3A3]">No hay citas {filterStatus !== 'all' ? 'con este estado' : 'agendadas'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-[#141414] border border-[#262626] p-6 hover:border-[#333] transition-colors"
              data-testid={`appointment-card-${appointment.id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-sm font-bold">
                      {appointment.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{appointment.name}</h3>
                      <p className="text-sm text-[#A3A3A3]">{serviceLabels[appointment.service_type] || appointment.service_type}</p>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <Calendar className="w-4 h-4 text-[#FF2A00]" />
                      {appointment.preferred_date}
                    </div>
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <Clock className="w-4 h-4 text-[#FF2A00]" />
                      {appointment.preferred_time} hrs
                    </div>
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <Mail className="w-4 h-4 text-[#FF2A00]" />
                      {appointment.email}
                    </div>
                  </div>

                  {appointment.description && (
                    <p className="mt-3 text-sm text-[#525252] border-l-2 border-[#262626] pl-3">
                      {appointment.description.substring(0, 150)}
                      {appointment.description.length > 150 && '...'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(appointment)}
                    className="border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] rounded-none"
                    data-testid={`edit-appointment-${appointment.id}`}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(appointment.id)}
                    className="border-[#262626] hover:border-red-500 hover:text-red-500 rounded-none"
                    data-testid={`delete-appointment-${appointment.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#141414] border-[#262626] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#FF2A00]" />
                  <span>{selectedAppointment.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#FF2A00]" />
                  <a href={`mailto:${selectedAppointment.email}`} className="hover:text-[#FF2A00] transition-colors">
                    {selectedAppointment.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#FF2A00]" />
                  <a href={`tel:${selectedAppointment.phone}`} className="hover:text-[#FF2A00] transition-colors">
                    {selectedAppointment.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#FF2A00]" />
                  <span>{selectedAppointment.preferred_date} a las {selectedAppointment.preferred_time} hrs</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Descripción del Proyecto
                </label>
                <div className="p-4 bg-[#0A0A0A] border border-[#262626] text-sm text-[#A3A3A3]">
                  {selectedAppointment.description || 'Sin descripción'}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Estado
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626]">
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-white hover:bg-[#262626]">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Notas Internas
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade notas sobre esta cita..."
                  rows={3}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] rounded-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border-[#262626] hover:border-[#FF2A00] rounded-none"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
                  data-testid="appointment-save-button"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
