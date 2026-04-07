import { useState, useEffect } from 'react';
import { Mail, Clock, Trash2, Check, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/contacts`, { headers });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openMessage = (message) => {
    setSelectedMessage(message);
    setModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-messages">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Mensajes</h1>
        <p className="text-[#A3A3A3]">Mensajes recibidos a través del formulario de contacto</p>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-[#141414] border border-[#262626] p-12 text-center">
          <MessageSquare className="w-12 h-12 text-[#525252] mx-auto mb-4" />
          <p className="text-[#A3A3A3]">No hay mensajes aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => openMessage(message)}
              className={`bg-[#141414] border border-[#262626] p-5 cursor-pointer hover:border-[#333] transition-colors ${
                !message.read ? 'border-l-2 border-l-[#FF2A00]' : ''
              }`}
              data-testid={`message-card-${message.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-sm font-bold">
                      {message.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{message.name}</h3>
                      <p className="text-sm text-[#A3A3A3] truncate">{message.email}</p>
                    </div>
                    {!message.read && (
                      <span className="px-2 py-1 text-xs font-mono bg-[#FF2A00]/10 text-[#FF2A00] border border-[#FF2A00]/20">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#A3A3A3] line-clamp-2">
                    {message.message}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-[#525252]">
                    <Clock className="w-3 h-3" />
                    {formatDate(message.created_at)}
                  </div>
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
            <DialogTitle>Mensaje de Contacto</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Sender Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#262626] flex items-center justify-center text-lg font-bold">
                  {selectedMessage.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{selectedMessage.name}</h3>
                  <a 
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sm text-[#A3A3A3] hover:text-[#FF2A00] transition-colors"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-[#525252]">
                <Clock className="w-4 h-4" />
                Recibido el {formatDate(selectedMessage.created_at)}
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Mensaje
                </label>
                <div className="p-4 bg-[#0A0A0A] border border-[#262626] text-sm text-[#A3A3A3] whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex-1"
                >
                  <Button
                    className="w-full bg-[#FF2A00] hover:bg-[#CC2200] text-white rounded-none"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Responder por Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
