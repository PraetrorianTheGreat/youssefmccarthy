import { motion } from 'framer-motion';
import { Bot, BarChart3, TestTube2, Target } from 'lucide-react';

const features = [
  {
    title: 'Agentic AI Workflows',
    description: 'Multi-model orchestration using Claude, Gemini, and GPT to automate complex data pipelines and generative analysis.',
    icon: <Bot className="w-8 h-8 text-accent-cyan" />,
    color: 'border-accent-cyan/30',
    bg: 'bg-accent-cyan/5',
    span: 'col-span-1 md:col-span-2'
  },
  {
    title: 'Advanced Tag Management',
    description: 'Enterprise architecture for Google Tag Manager, Adobe Launch, and server-side tracking implementations.',
    icon: <Target className="w-8 h-8 text-accent-purple" />,
    color: 'border-accent-purple/30',
    bg: 'bg-accent-purple/5',
    span: 'col-span-1 md:col-span-1'
  },
  {
    title: 'Experimentation & CRO',
    description: 'A/B & multivariate testing frameworks using Adobe Target and Optimizely to drive measurable revenue growth.',
    icon: <TestTube2 className="w-8 h-8 text-accent-pink" />,
    color: 'border-accent-pink/30',
    bg: 'bg-accent-pink/5',
    span: 'col-span-1 md:col-span-1'
  },
  {
    title: 'GA4 & Adobe Analytics',
    description: 'Full-stack migration, data layer design, and custom dashboarding in PowerBI, Looker, and Tableau.',
    icon: <BarChart3 className="w-8 h-8 text-white" />,
    color: 'border-white/30',
    bg: 'bg-white/5',
    span: 'col-span-1 md:col-span-2'
  }
];

export function FeatureGrid() {
  return (
    <section id="expertise" className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Core <span className="gradient-text">Competencies</span>
          </h2>
          <p className="text-text-muted text-lg">
            Engineering the data foundation that powers high-growth marketing engines and intelligent automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass-panel p-8 flex flex-col justify-between group hover:bg-white/[0.03] transition-colors relative overflow-hidden border ${feature.color} ${feature.span}`}
            >
              {/* Subtle background glow */}
              <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 ${feature.bg}`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
