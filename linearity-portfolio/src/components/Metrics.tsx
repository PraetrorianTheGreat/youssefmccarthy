import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const impactMetrics = [
  { value: '14+', label: 'Years Experience' },
  { value: '2,400x', label: 'Peak ROI Multiplier' },
  { value: '100%', label: 'Data-Driven UX' },
  { value: '5+', label: 'Enterprise Migrations' },
];

const services = [
  {
    tier: 'Analytics Architecture',
    desc: 'Scalable data models for enterprise.',
    features: ['GA4 & Adobe Analytics Migration', 'Server-Side Tagging (sGTM)', 'Custom Data Layer Design', 'Looker Studio / PowerBI Dashboards']
  },
  {
    tier: 'CRO & Experimentation',
    desc: 'High-velocity testing programs.',
    features: ['A/B & Multivariate Testing', 'Adobe Target & Optimizely', 'UX/UI Heuristic Evaluation', 'Funnels & Bounce Rate Optimization'],
    highlight: true
  },
  {
    tier: 'AI & Automation',
    desc: 'Agentic workflows and LLM orchestration.',
    features: ['Multi-Model Orchestration', 'Automated Reporting Pipelines', 'Predictive LTV Modeling', 'Custom GenAI Tooling']
  }
];

export function Metrics() {
  return (
    <section id="metrics" className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Top Metrics Strip */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-24 pb-12 border-b border-white/5">
          {impactMetrics.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-black gradient-text mb-2">{m.value}</div>
              <div className="text-text-muted font-medium tracking-wide uppercase text-sm">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Services / "Pricing" Tiers */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Services & <span className="gradient-text">Impact</span>
          </h2>
          <p className="text-text-muted text-lg">
            Architectural frameworks designed for enterprise scaling, analytics governance, and rapid go-to-market execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.tier}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass-panel p-8 rounded-3xl relative overflow-hidden border ${
                service.highlight ? 'border-accent-purple/50 bg-white/5 shadow-2xl shadow-accent-purple/10 scale-105 z-10' : 'border-white/10'
              }`}
            >
              {service.highlight && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-purple to-accent-cyan" />
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{service.tier}</h3>
              <p className="text-text-muted mb-8 pb-8 border-b border-white/10">{service.desc}</p>
              
              <ul className="flex flex-col gap-4 mb-8">
                {service.features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${service.highlight ? 'text-accent-cyan' : 'text-white/40'}`} />
                    <span className="text-sm text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="mailto:youssef@example.com" 
                className={`w-full py-3 rounded-xl font-bold text-center block transition-colors ${
                  service.highlight 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                Discuss Requirements
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
