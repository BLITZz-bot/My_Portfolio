export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  gallery: string[];
  description: string;
  technologies: string[];
  link: string;
  github: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Reimagined",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600"
    ],
    description: "A high-performance e-commerce platform built with Next.js and Stripe integration. Features include real-time inventory management, secure checkout, and a custom-built product search engine.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe", "Supabase"],
    link: "#",
    github: "#",
  },
  {
    id: "2",
    title: "AI Analytics Dashboard",
    category: "UI/UX Design",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bbda4833effb?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bbda4833effb?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1504868584819-f8e90526354a?auto=format&fit=crop&q=80&w=1600"
    ],
    description: "A comprehensive analytics dashboard that uses machine learning to predict market trends. Designed with a focus on data visualization and accessibility.",
    technologies: ["React", "D3.js", "Python", "TensorFlow", "Figma"],
    link: "#",
    github: "#",
  },
  {
    id: "3",
    title: "Crypto Wallet Mobile",
    category: "Mobile App",
    thumbnail: "https://images.unsplash.com/photo-1621417646633-2f3cd0a913c2?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1621417646633-2f3cd0a913c2?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1512428815194-96690467b7e6?auto=format&fit=crop&q=80&w=1600"
    ],
    description: "A secure and intuitive mobile wallet for managing cryptocurrency assets. Includes biometric authentication, transaction history, and real-time exchange rates.",
    technologies: ["React Native", "Web3.js", "Firebase", "Node.js"],
    link: "#",
    github: "#",
  },
  {
    id: "4",
    title: "Minimalist Blog",
    category: "Next.js",
    thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&q=80&w=1600"
    ],
    description: "A fast, SEO-optimized minimalist blog template. Supports Markdown, dynamic routing, and dark mode out of the box.",
    technologies: ["Next.js", "Contentlayer", "Tailwind CSS", "MDX"],
    link: "#",
    github: "#",
  },
  // Adding more dummy projects for the "View All" experience
  {
    id: "5",
    title: "Portfolio v1",
    category: "Personal Project",
    thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1600"
    ],
    description: "My first portfolio build focusing on clean typography and grid layouts.",
    technologies: ["HTML", "CSS", "JS"],
    link: "#",
    github: "#",
  },
  {
    id: "6",
    title: "Task Management App",
    category: "SaaS",
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1600",
    gallery: [
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=1600"
    ],
    description: "A collaborative task management tool for remote teams.",
    technologies: ["React", "Node.js", "PostgreSQL"],
    link: "#",
    github: "#",
  }
];
