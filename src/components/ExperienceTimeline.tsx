"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Building2, CalendarDays, MapPin } from "lucide-react";
import { getExperiences } from "@/app/actions/admin";
import { Experience } from "@/lib/experience";

const formatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });

function dateLabel(value: string | null) {
  return value ? formatter.format(new Date(`${value}T00:00:00`)) : "Present";
}

function CompanyMark({ experience }: { experience: Experience }) {
  if (experience.company_logo) {
    // Company logos are dashboard-provided URLs, so they cannot use Next's fixed image host allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={experience.company_logo} alt={`${experience.company} logo`} className="h-full w-full object-contain" />;
  }

  return <span className="text-lg font-black tracking-tighter text-white">{experience.company.slice(0, 2).toUpperCase()}</span>;
}

export function ExperienceTimeline({ limit }: { limit?: number }) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getExperiences()
      .then((data) => setExperiences(data as Experience[]))
      .catch((error) => console.error("Error fetching experience:", error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="space-y-5 animate-pulse">{[0, 1].map((item) => <div key={item} className="h-52 rounded-[28px] border border-white/5 bg-white/[0.03]" />)}</div>;
  }

  const displayedExperiences = limit ? experiences.slice(0, limit) : experiences;

  if (!displayedExperiences.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
        <BriefcaseBusiness className="mx-auto mb-4 text-neutral-600" size={28} />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">Experience will appear here soon.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-8 left-[29px] top-8 hidden w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent sm:block" />
      <div className="space-y-5">
        {displayedExperiences.map((experience, index) => (
          <motion.article
            key={experience.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="group relative rounded-[28px] border border-white/8 bg-white/[0.035] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.055] sm:ml-14 sm:p-7"
          >
            <div className="relative mb-5 flex items-start justify-between gap-4 sm:absolute sm:-left-[86px] sm:top-7 sm:mb-0 sm:block">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-700 to-neutral-950 shadow-xl shadow-black/30">
                <CompanyMark experience={experience} />
              </div>
              {experience.is_current && <span className="mt-2 block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)] sm:mx-auto" />}
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">{experience.employment_type}</span>
                  {experience.is_current && <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">Current role</span>}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{experience.role}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium text-neutral-200"><Building2 size={14} />{experience.company}</span>
                  {experience.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{experience.location}</span>}
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-300 sm:justify-end"><CalendarDays size={14} />{dateLabel(experience.start_date)} — {dateLabel(experience.is_current ? null : experience.end_date)}</p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-neutral-400">{experience.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/7 pt-5">
              {experience.skills.map((skill) => <span key={skill} className="rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-xs font-medium text-neutral-300">{skill}</span>)}
              {experience.company_url && (
                <a href={experience.company_url} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 text-xs font-bold text-white transition-colors hover:text-neutral-400">
                  Visit company <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
