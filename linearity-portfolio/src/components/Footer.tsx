import { Code2, Briefcase, Globe, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#040609] pt-20 pb-10 z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30">
                <span className="font-black text-sm gradient-text">YM</span>
              </div>
              <span className="font-bold text-lg">Youssef McCarthy</span>
            </div>
            <p className="text-text-muted text-sm max-w-md mb-6 leading-relaxed">
              Digital Analytics & AI Strategist based in Massachusetts. Building autonomous workflows, optimizing conversion rates, and engineering enterprise data solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Capabilities</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-muted">
              <li><a href="#" className="hover:text-accent-cyan transition-colors">GA4 Migration</a></li>
              <li><a href="#" className="hover:text-accent-cyan transition-colors">Adobe Target</a></li>
              <li><a href="#" className="hover:text-accent-cyan transition-colors">Agentic Workflows</a></li>
              <li><a href="#" className="hover:text-accent-cyan transition-colors">Server-Side Tagging</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Connect</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-muted">
              <li>
                <a href="mailto:youssefmccarthy@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" /> youssefmccarthy@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} Youssef M. McCarthy. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
