import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <About />
      <Projects />
      <Testimonials />
    </div>
  );
}
