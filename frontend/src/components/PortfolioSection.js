import { useEffect, useState } from 'react';
import { ExternalLink, Github, Play } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'web', label: 'Web / Apps' },
  { id: 'iot', label: 'Arduino / IoT' },
  { id: 'enterprise', label: 'C# / Java' },
];

export default function PortfolioSection() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchProjects();
  }, []);

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((project) => project.category === activeFilter);

  return (
    <section 
      id="portfolio" 
      className="section-padding bg-[#141414]"
      data-testid="portfolio-section"
    >
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="label-uppercase mb-4 block">Portafolio</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">
              Proyectos <span className="text-[#FF2A00]">destacados</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`tech-tag cursor-pointer ${
                  activeFilter === cat.id ? 'active border-[#FF2A00] text-white' : ''
                }`}
                data-testid={`portfolio-filter-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-[#A3A3A3]">
            No hay proyectos en esta categoría
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <article
                key={project.id}
                className="group bg-[#0A0A0A] border border-[#262626] overflow-hidden card-hover animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                data-testid={`portfolio-project-${index}`}
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.image_url || 'https://images.unsplash.com/photo-1720135885007-454165745e21'}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0A0A0A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center bg-[#FF2A00] hover:bg-[#CC2200] transition-colors"
                        aria-label="Ver demo"
                      >
                        <Play className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-[#FF2A00] transition-colors"
                        aria-label="Ver código"
                      >
                        <Github className="w-5 h-5 text-white" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#FF2A00] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[#A3A3A3] text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono text-[#525252] px-2 py-1 bg-[#141414]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies?.length > 4 && (
                      <span className="text-xs font-mono text-[#525252] px-2 py-1 bg-[#141414]">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
