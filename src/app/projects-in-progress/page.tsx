import { ProjectCatalog } from "@/features/projects/components/ProjectCatalog";
import { getOngoingProjects } from "@/app/actions/admin";

export default function OngoingProjectsPage() {
  return (
    <ProjectCatalog
      backHref="/#ongoing-projects"
      scrollRestoreTarget="ongoing-projects"
      titleLeading="CURRENTLY"
      titleTrailing="INITIATIVES."
      description="A comprehensive showcase of projects that I am currently working on, researching, or actively developing."
      countLabel="INITIATIVES TOTAL"
      emptyTitle="Initiatives vault is empty."
      emptySub="No active initiatives have been published yet."
      fetchProjects={getOngoingProjects}
    />
  );
}
