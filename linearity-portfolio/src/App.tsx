import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { CaseStudies } from './components/CaseStudies';
import { Metrics } from './components/Metrics';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent-purple selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-purple/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-cyan/10 blur-[120px]" />
      </div>

      <Navbar />
      
      <main className="relative z-10">
        <Hero />
        <FeatureGrid />
        <CaseStudies />
        <Metrics />
      </main>

      <Footer />
    </div>
  );
}

export default App;
