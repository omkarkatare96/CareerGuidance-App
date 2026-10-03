"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Search,
  Layers,
  Wrench,
  BookOpen,
  Rocket,
  CheckCircle2,
  XCircle,
  Play,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import BlurText from "@/components/BlurText"

export interface Resource {
  type: "youtube" | "course" | "Video" | "Article" | "PDF" | string
  title: string
  url?: string
  provider?: string
  estimatedTime?: string
}

export interface Phase {
  id: string
  title: string
  subtitle?: string
  icon?: any
  color?: string
  dotColor?: string
  focus: string[]
  avoid?: string[]
  resources?: Resource[]
}

export interface RoadmapData {
  phases: Phase[]
}

interface RoadmapProps {
  roadmapData?: RoadmapData
}

export function CareerRoadmap({ roadmapData }: RoadmapProps) {
  const [expandedPhase, setExpandedPhase] = useState<string>("phase_1")

  const phasesToRender = roadmapData?.phases || []

  if (!roadmapData) {
    return null
  }

  // Icon mapping helper
  const getIcon = (phaseTitle: string) => {
    const lower = phaseTitle.toLowerCase()
    if (lower.includes("foundation") || lower.includes("base")) return Layers
    if (lower.includes("skill") || lower.includes("build")) return Wrench
    if (lower.includes("prep") || lower.includes("learn")) return BookOpen
    if (lower.includes("execution") || lower.includes("launch") || lower.includes("deploy")) return Rocket
    return Search
  }

  const getColors = (index: number) => {
    const colors = [
      { color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
      { color: "bg-accent/10 text-accent border-accent/20", dot: "bg-accent" },
      { color: "bg-chart-3/10 text-foreground border-chart-3/20", dot: "bg-chart-3" },
      { color: "bg-chart-4/10 text-foreground border-chart-4/20", dot: "bg-chart-4" },
      { color: "bg-chart-5/10 text-foreground border-chart-5/20", dot: "bg-chart-5" },
    ]
    return colors[index % colors.length]
  }

  return (
    <section id="roadmap" className="py-24 px-4">
      <div className="mx-auto max-w-5xl flex flex-col gap-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm w-fit">
              <Rocket className="h-4 w-4" />
              <span>Your Career Roadmap</span>
            </div>
            <div className="font-serif text-3xl md:text-4xl text-foreground text-balance">
              <BlurText text="A clear path, one step at a time" delay={50} animateBy="words" direction="top" className="inline-block" />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              {"Your journey doesn't need to be perfect. It needs to be consistent. Here's a phase-by-phase guide to help you move forward with confidence."}
            </p>
          </div>

          <div className="relative w-full max-w-xs aspect-square mx-auto lg:mx-0 lg:ml-auto">
            <Image
              src="/roadmap-illustration.jpg"
              alt="A winding road leading upward through a serene landscape with milestones"
              fill
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="flex flex-col gap-4">
            {phasesToRender.map((phase, index) => {
              const phaseId = phase.id || `phase-${index}`
              const isExpanded = expandedPhase === phaseId
              const PhaseIcon = getIcon(phase.title)
              const { color, dot } = getColors(index)

              return (
                <div key={phaseId} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 md:left-6 top-6 w-4 h-4 rounded-full ${dot} border-4 border-background z-10 hidden md:block`} />

                  <div className="md:ml-16">
                    <button
                      type="button"
                      onClick={() => setExpandedPhase(isExpanded ? "" : phaseId)}
                      className={`w-full glass-card rounded-2xl p-6 text-left transition-all hover:shadow-md ${isExpanded ? "shadow-lg shadow-primary/5" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                            <PhaseIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-serif text-lg text-foreground">
                              {phase.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">{phase.subtitle || `Phase ${index + 1}`}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-6 flex flex-col gap-6" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                          {/* What to focus on */}
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              What to focus on
                            </h4>
                            <ul className="flex flex-col gap-2">
                              {phase.focus?.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                  <BlurText text={item} delay={10} animateBy="words" direction="top" />
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* What to avoid */}
                          {phase.avoid && phase.avoid.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-destructive" />
                                What to avoid
                              </h4>
                              <ul className="flex flex-col gap-2">
                                {phase.avoid.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0 mt-1.5" />
                                    <BlurText text={item} delay={10} animateBy="words" direction="top" />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Resources */}
                          {phase.resources && phase.resources.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-accent" />
                                Learning Resources
                              </h4>
                              <div className="flex flex-col gap-2">
                                {phase.resources.map((resource: Resource, i: number) => {
                                  const isYoutube =
                                    resource.type === "youtube" ||
                                    resource.type === "Video" ||
                                    resource.type === "YouTube"
                                  const icon = isYoutube ? "🎬" : "📘"
                                  const href = resource.url || "#"
                                  return (
                                    <a
                                      key={i}
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/60 border border-border hover:bg-primary/5 hover:border-primary/20 transition-colors group"
                                    >
                                      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                            {resource.title}
                                          </span>
                                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          {resource.provider && (
                                            <span className="text-xs text-muted-foreground font-medium">
                                              {resource.provider}
                                            </span>
                                          )}
                                          {resource.provider && resource.estimatedTime && (
                                            <span className="text-xs text-muted-foreground">·</span>
                                          )}
                                          {resource.estimatedTime && (
                                            <span className="text-xs text-muted-foreground">
                                              {resource.estimatedTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </a>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Progress bar */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Phase progress</span>
                              <span>Not started</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full ${dot} w-0 transition-all`} />
                            </div>
                          </div>

                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
