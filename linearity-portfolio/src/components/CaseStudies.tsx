import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  {
    id: 1,
    title: 'Healthcare Digital Transformation',
    category: 'Healthcare',
    metrics: '+45% Patient Acquisition',
    image: '/images/dashboard-abstract.jpg',
    tags: ['GA4', 'Adobe Target', 'HIPAA Compliance'],
  },
  {
    id: 2,
    title: 'Omnichannel B2B Engine',
    category: 'Omnichannel',
    metrics: '2,400x ROI Multiplier',
    image: '/images/analytics_teaser.png',
    tags: ['Agentic AI', 'Looker Studio', 'BigQuery'],
  },
  {
    id: 3,
    title: 'SaaS Monetization Audit',
    category: 'Monetization',
    metrics: '+22% LTV',
    image: '/images/collaboration_teaser.png',
    tags: ['CRO', 'A/B Testing', 'Optimizely'],
  },
  {
    id: 4,
    title: 'Telehealth UX Overhaul',
    category: 'Healthcare',
    metrics: '-18% Bounce Rate',
    image: '/images/experience_teaser.png',
    tags: ['Hotjar', 'UX Research', 'Figma'],
  }
];

const filters = ['All', 'Healthcare', 'Omnichannel', 'Monetization'];

export function CaseStudies() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <section id="projects" className="py-24 relative z-10 bg-white/[0.01] border-y border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Featured <span className="gradient-text">Case Studies</span>
            </h2>
            <p className="text-text-muted text-lg">
              Explore real-world implementations of data architecture, AI workflows, and CRO strategies.
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f 
                    ? 'bg-accent-purple text-white border-transparent' 
                    : 'bg-white/5 text-text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-accent-purple/50 transition-colors"
              >
                {/* Image Placeholder / Asset */}
                <div className="h-64 w-full bg-black/40 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] to-transparent z-10" />
                  <span className="text-white/20 font-mono text-xs z-0 absolute top-4 right-4">{project.image}</span>
                  
                  {/* Mock Visualizer */}
                  <div className="w-3/4 h-3/4 rounded-xl border border-white/10 bg-white/5 relative z-0 flex flex-col gap-2 p-4">
                     <div className="h-4 w-1/3 bg-white/10 rounded-sm" />
                     <div className="flex-1 flex items-end gap-1">
                        {[40, 70, 50, 90, 60].map((h, i) => (
                          <div key={i} className="w-full bg-accent-purple/40 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 relative z-20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider mb-2 block">
                        {project.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                    </div>
                    <div className="bg-accent-purple/20 border border-accent-purple/50 text-accent-purple text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {project.metrics}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-xs text-text-muted border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
      </div>
    </section>
  );
}
