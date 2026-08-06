import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import axios from 'axios';
import { resolveProjectMediaUrl } from '../lib/projectMedia';
import { API_URL } from '../lib/apiBase';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/testimonials`);
        setTestimonials(response.data || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section 
      id="testimonials" 
      className="section-padding bg-[#0A0A0A]"
      data-testid="testimonials-section"
    >
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="label-uppercase mb-4 block">Testimonios</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-6">
            Lo que dicen mis <span className="text-[#FF2A00]">clientes</span>
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            La satisfacción de mis clientes es mi mayor motivación
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => {
            const avatar =
              resolveProjectMediaUrl(testimonial.image_url) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name || 'C')}&background=141414&color=fff`;

            return (
              <article
                key={testimonial.id}
                className="group p-8 lg:p-10 bg-[#141414] border border-[#262626] card-hover animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                data-testid={`testimonial-card-${index}`}
              >
                {/* Quote Icon */}
                <div className="w-10 h-10 flex items-center justify-center border border-[#262626] group-hover:border-[#FF2A00] transition-colors mb-6">
                  <Quote className="w-5 h-5 text-[#FF2A00]" />
                </div>

                {/* Content */}
                <p className="text-[#A3A3A3] text-base leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating ? 'text-[#FF2A00] fill-[#FF2A00]' : 'text-[#262626]'
                      }`}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#262626]">
                    <img
                      src={avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-[#A3A3A3]">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
