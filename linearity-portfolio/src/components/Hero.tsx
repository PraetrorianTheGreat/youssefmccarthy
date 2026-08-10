import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, LineChart, Network } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Floating elements mimicking Linearity's dynamic canvas */}
        <div className="absolute top-20 right-10 md:right-20 lg:right-40 opacity-20 pointer-events-none">
           <LineChart className="w-64 h-64 text-accent-purple" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-accent-purple/30 text-sm font-medium text-accent-purple"
          >
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
            Open to Enterprise Roles
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            Enterprise AI & <br className="hidden md:block" />
            <span className="gradient-text">Analytics Engine.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            14+ years engineering autonomous workflows, scaling GA4 architectures, and driving Conversion Rate Optimization for industry leaders.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a 
              href="#projects" 
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-white text-black hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              View Case Studies <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#expertise" 
              className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold glass-panel hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Network className="w-5 h-5" /> Tech Stack
            </a>
          </motion.div>

        </div>

        {/* Interactive Dashboard Mockup element */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 mx-auto max-w-5xl rounded-2xl glass-panel p-2 shadow-2xl shadow-accent-purple/10 border-accent-purple/20 overflow-hidden relative"
        >
          {/* Header bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="mx-auto px-4 py-1 rounded-md bg-black/50 text-xs text-text-muted font-mono flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-accent-cyan" />
              Youssef_McCarthy_Agentic_Dashboard.workspace
            </div>
          </div>
          
          {/* Dashboard Canvas Content */}
          <div className="h-[400px] md:h-[500px] w-full bg-background/50 rounded-b-xl relative overflow-hidden flex">
            {/* Sidebar */}
            <div className="w-16 md:w-64 border-r border-white/5 p-4 flex flex-col gap-4">
              <div className="h-8 w-full bg-white/5 rounded-md animate-pulse-slow" />
              <div className="h-8 w-full bg-white/5 rounded-md animate-pulse-slow" style={{ animationDelay: '0.2s' }} />
              <div className="h-8 w-full bg-white/5 rounded-md animate-pulse-slow" style={{ animationDelay: '0.4s' }} />
            </div>
            {/* Main Area */}
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel border-accent-cyan/20 p-6 flex flex-col justify-end">
                <div className="w-full h-32 flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className="flex-1 bg-gradient-to-t from-accent-purple/20 to-accent-cyan rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
              <div className="glass-panel border-accent-pink/20 p-6 flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-white/10 rounded-md" />
                <div className="flex-1 rounded-lg border border-white/5 bg-black/30 p-4 font-mono text-xs text-accent-pink/80">
                  {`> initializing ai workflow...`}
                  <br/>
                  {`> building data pipelines...`}
                  <br/>
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 2 }}
                    className="text-accent-cyan"
                  >
                    {`> optimization complete. ROI +2400%`}
                  </motion.span>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent-purple/5 blur-[100px] pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
