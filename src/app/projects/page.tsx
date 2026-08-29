import { ProjectCatalog } from "@/features/projects/components/ProjectCatalog";
import { getProjects } from "@/app/actions/admin";
import { projects as staticProjects } from "@/lib/projects";

export default function ProjectsPage() {
  return (
    <ProjectCatalog
      backHref="/#projects"
      scrollRestoreTarget="projects"
      titleLeading="All"
      titleTrailing="Works."
      description="A comprehensive showcase of my journey in design and development."
      countLabel="PROJECTS TOTAL"
      emptyTitle="Project vault is empty."
      emptySub="No projects have been published yet."
      fetchProjects={getProjects}
      fallbackProjects={staticProjects}
    />
  );
}
