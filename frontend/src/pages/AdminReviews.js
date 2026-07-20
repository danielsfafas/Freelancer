import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, Upload, Loader2, Quote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';
import { resolveProjectMediaUrl } from '../lib/projectMedia';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const emptyReview = {
  name: '',
  company: '',
  role: '',
  content: '',
  image_url: '',
  rating: 5,
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState(emptyReview);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/testimonials`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('No se pudieron cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openCreateModal = () => {
    setEditingReview(null);
    setFormData(emptyReview);
    setModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('new') === '1' && !loading) {
      openCreateModal();
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [loading, searchParams, setSearchParams]);

  const openEditModal = (review) => {
    setEditingReview(review);
    setFormData({
      ...emptyReview,
      ...review,
      image_url: review.image_url || '',
      rating: review.rating || 5,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      toast.success('Foto subida');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo subir la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      role: formData.role.trim(),
      content: formData.content.trim(),
      image_url: formData.image_url || null,
      rating: Math.min(5, Math.max(1, Number(formData.rating) || 5)),
    };

    try {
      if (editingReview) {
        await axios.put(`${API_URL}/api/testimonials/${editingReview.id}`, payload, { headers });
        toast.success('Reseña actualizada');
      } else {
        await axios.post(`${API_URL}/api/testimonials`, payload, { headers });
        toast.success('Reseña creada');
      }
      setModalOpen(false);
      fetchReviews();
    } catch (error) {
      toast.error('Error al guardar la reseña');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;

    try {
      await axios.delete(`${API_URL}/api/testimonials/${reviewId}`, { headers });
      toast.success('Reseña eliminada');
      fetchReviews();
    } catch (error) {
      toast.error('Error al eliminar la reseña');
    }
  };

  const imagePreview = resolveProjectMediaUrl(formData.image_url);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-reviews">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Reseñas</h1>
          <p className="text-[#A3A3A3]">Administra los testimonios que se muestran en el sitio</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#FF2A00] hover:bg-[#CC2200] text-white"
          data-testid="admin-review-create"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva reseña
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-[#141414] border border-[#262626] p-12 text-center">
          <Quote className="w-12 h-12 text-[#525252] mx-auto mb-4" />
          <p className="text-[#A3A3A3] mb-6">No hay reseñas aún</p>
          <Button
            onClick={openCreateModal}
            className="bg-[#FF2A00] hover:bg-[#CC2200] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar testimonio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((review) => {
            const avatar =
              resolveProjectMediaUrl(review.image_url) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name || 'C')}&background=141414&color=fff`;

            return (
              <article
                key={review.id}
                className="bg-[#141414] border border-[#262626] p-5"
                data-testid={`review-card-${review.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#262626] shrink-0">
                      <img src={avatar} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{review.name}</h3>
                      <p className="text-sm text-[#A3A3A3] truncate">
                        {review.role} · {review.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(review)}
                      className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#1C1C1C] transition-colors"
                      aria-label="Editar reseña"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-[#A3A3A3] hover:text-[#FF2A00] hover:bg-[#1C1C1C] transition-colors"
                      aria-label="Eliminar reseña"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (review.rating || 0) ? 'text-[#FF2A00] fill-[#FF2A00]' : 'text-[#262626]'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-[#A3A3A3] line-clamp-3">"{review.content}"</p>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#141414] border-[#262626] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReview ? 'Editar Reseña' : 'Nueva Reseña'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="label-uppercase mb-2 block">Nombre</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-[#0A0A0A] border-[#262626]"
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-uppercase mb-2 block">Cargo</label>
                <Input
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="bg-[#0A0A0A] border-[#262626]"
                  placeholder="CEO, CTO..."
                />
              </div>
              <div>
                <label className="label-uppercase mb-2 block">Empresa</label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="bg-[#0A0A0A] border-[#262626]"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>

            <div>
              <label className="label-uppercase mb-2 block">Reseña</label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={4}
                className="bg-[#0A0A0A] border-[#262626]"
                placeholder="Lo que dijo el cliente..."
              />
            </div>

            <div>
              <label className="label-uppercase mb-2 block">Calificación</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: value }))}
                    className="p-1 transition-colors"
                    aria-label={`${value} estrellas`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        value <= formData.rating
                          ? 'text-[#FF2A00] fill-[#FF2A00]'
                          : 'text-[#262626]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-[#A3A3A3] ml-2">{formData.rating}/5</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label-uppercase mb-2 block">Foto del cliente</label>
              <div className="aspect-square max-w-[140px] bg-[#0A0A0A] border border-[#262626] overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-[#525252] p-4">
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs">Sin foto</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#262626] bg-transparent hover:bg-[#1C1C1C]"
                  disabled={uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Subir foto
                </Button>
                {formData.image_url ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#262626] bg-transparent hover:bg-[#1C1C1C] text-[#A3A3A3]"
                    onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                  >
                    Quitar foto
                  </Button>
                ) : null}
              </div>
              <Input
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="bg-[#0A0A0A] border-[#262626]"
                placeholder="O pega una URL de imagen"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-[#262626] bg-transparent hover:bg-[#1C1C1C]"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || uploadingImage}
                className="bg-[#FF2A00] hover:bg-[#CC2200] text-white"
              >
                {saving ? 'Guardando...' : editingReview ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
