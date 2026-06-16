import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { OngoingProjects } from "@/components/OngoingProjects";
import { Testimonials } from "@/components/Testimonials";
import { Noise } from "@/components/Noise";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <div className="relative overflow-hidden bg-neutral-950">
        {/* Continuous Grain and Depth backdrop for all dark sections */}
        <Noise />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
        
        <div className="relative z-10">
          <About />
          <Projects />
          <OngoingProjects />
          <Testimonials />
        </div>
      </div>
    </div>
  );
}
