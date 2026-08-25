"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { getExperiences } from "@/app/actions/admin";
import { Experience } from "@/lib/experience";

const formatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });
const dossierThemes = [
  { line: "bg-cyan-300", soft: "from-cyan-400/15", chip: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100", watermark: "text-cyan-200/[0.035]" },
  { line: "bg-violet-300", soft: "from-violet-400/15", chip: "border-violet-300/20 bg-violet-300/10 text-violet-100", watermark: "text-violet-200/[0.035]" },
  { line: "bg-amber-300", soft: "from-amber-400/15", chip: "border-amber-300/20 bg-amber-300/10 text-amber-100", watermark: "text-amber-200/[0.035]" },
  { line: "bg-rose-300", soft: "from-rose-400/15", chip: "border-rose-300/20 bg-rose-300/10 text-rose-100", watermark: "text-rose-200/[0.035]" },
  { line: "bg-emerald-300", soft: "from-emerald-400/15", chip: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100", watermark: "text-emerald-200/[0.035]" },
  { line: "bg-fuchsia-300", soft: "from-fuchsia-400/15", chip: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100", watermark: "text-fuchsia-200/[0.035]" },
];

function getDossierTheme(id: string) {
  const hash = [...id].reduce((value, character) => ((value << 5) - value + character.charCodeAt(0)) | 0, 0);
  return dossierThemes[Math.abs(hash) % dossierThemes.length];
}

function dateLabel(value: string | null) {
  return value ? formatter.format(new Date(`${value}T00:00:00`)) : "Present";
}

function CompanyMark({ experience }: { experience: Experience }) {
  if (experience.company_logo) {
    // Dashboard-provided image URLs cannot use a fixed Next image-host allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={experience.company_logo} alt={`${experience.company} logo`} className="h-full w-full object-contain" />;
  }
  return <span className="text-xl font-black tracking-tighter text-white">{experience.company.slice(0, 2).toUpperCase()}</span>;
}

function RoleTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const splitAt = Math.max(1, Math.ceil(words.length * 0.6));
  const leading = words.slice(0, splitAt).join(" ");
  const trailing = words.slice(splitAt).join(" ");

  return (
    <h2 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
      <span className="text-white">{leading}</span>
      {trailing && <span className="text-neutral-500"> {trailing}</span>}
    </h2>
  );
}

export function ExperienceTimeline() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExperienceIds, setExpandedExperienceIds] = useState<Set<string>>(new Set());

  const toggleExperience = (id: string) => {
    setExpandedExperienceIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    getExperiences()
      .then((data) => setExperiences(data as Experience[]))
      .catch((error) => console.error("Error fetching experience:", error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">{[0, 1].map((item) => <div key={item} className="h-64 rounded-[28px] border border-white/5 bg-white/[0.03]" />)}</div>;
  }

  if (!experiences.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
        <BriefcaseBusiness className="mx-auto mb-4 text-neutral-600" size={28} />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-400">Experience will appear here soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience, index) => {
        const isExpanded = expandedExperienceIds.has(experience.id);
        const accent = getDossierTheme(experience.id);
        const statusStyle = experience.is_current
          ? "border-violet-300/25 bg-violet-300/10 text-violet-100"
          : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";

        return (
          <motion.article
            key={experience.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            className="group relative grid overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900/45 transition-all duration-500 hover:border-white/20 hover:bg-neutral-900/70 md:grid-cols-[250px_1fr]"
          >
            <div className={`absolute left-0 top-0 h-full w-1 ${accent.line}`} />
            <aside className="relative overflow-hidden border-b border-white/8 p-6 md:border-b-0 md:border-r md:p-8">
              <div className={`absolute inset-0 bg-gradient-to-br ${accent.soft} via-transparent to-transparent opacity-70`} />
              <div className="relative flex h-full flex-col justify-between gap-7">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 shadow-xl shadow-black/25">
                      <CompanyMark experience={experience} />
                    </div>
                    <span className="font-mono text-xs font-bold tracking-[0.2em] text-white/30">0{index + 1}</span>
                  </div>
                  <p className="text-lg font-bold tracking-tight text-white">{experience.company}</p>
                  {experience.location && <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500"><MapPin size={13} />{experience.location}</p>}
                </div>
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500">Engagement</p>
                  <span className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] ${statusStyle}`}>{experience.is_current ? "Current" : "Completed"}</span>
                </div>
              </div>
            </aside>

            <div className="relative p-6 sm:p-8">
              <span className={`pointer-events-none absolute -bottom-16 right-4 select-none font-mono text-[190px] font-black leading-none ${accent.watermark}`}>0{index + 1}</span>
              <div className="mb-7 flex flex-col gap-5 border-b border-white/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">{experience.employment_type}</span>
                  </div>
                  <RoleTitle title={experience.role} />
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">Period</p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-200 sm:justify-end"><CalendarDays size={14} />{dateLabel(experience.start_date)} — {dateLabel(experience.is_current ? null : experience.end_date)}</p>
                </div>
              </div>

              {(experience.description || experience.skills.length > 0 || experience.company_url) && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleExperience(experience.id)}
                    aria-expanded={isExpanded}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs font-bold text-neutral-200 transition-all hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                  >
                    {isExpanded ? "Hide role details" : "View role details"}
                    <ChevronDown size={15} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 border-t border-white/8 pt-6">
                          {experience.description && <p className="max-w-4xl whitespace-pre-line text-[15px] leading-7 text-neutral-400">{experience.description}</p>}
                          {(experience.skills.length > 0 || experience.company_url) && (
                            <div className="mt-6 flex flex-wrap items-center gap-2">
                              {experience.skills.map((skill) => <span key={skill} className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-white/20 hover:text-white">{skill}</span>)}
                              {experience.company_url && <a href={experience.company_url} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white transition-all hover:border-white hover:bg-white hover:text-black">Visit company <ArrowUpRight size={14} /></a>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
