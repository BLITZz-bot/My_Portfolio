export function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-xl font-bold tracking-tighter mb-2">
            PORTFOLIO<span className="text-neutral-500">.</span>
          </h2>
          <p className="text-neutral-500 text-sm max-w-xs">
            A showcase of modern web development and animation. Built with Next.js and Framer Motion.
          </p>
        </div>
        
        <div className="flex gap-12">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Links</h3>
            <a href="#" className="text-sm hover:text-white transition-colors">Home</a>
            <a href="#about" className="text-sm hover:text-white transition-colors">About</a>
            <a href="#projects" className="text-sm hover:text-white transition-colors">Projects</a>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Social</h3>
            <a href="#" className="text-sm hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-sm hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-sm hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-900 flex justify-between items-center">
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
        <p className="text-xs text-neutral-600 italic">
          Designed for the future.
        </p>
      </div>
    </footer>
  );
}
