"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Zap,
  Shield,
  Target,
  Users,
  Activity,
  Sparkles,
  Compass,
  Award,
  Briefcase,
  Flame,
  BookOpen,
  Layers,
  Check,
  ListChecks,
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
  PolarGrid,
  RadarChart,
  Radar,
  Tooltip,
} from "recharts"
import BlurText from "@/components/BlurText"
import { CareerRoadmap, RoadmapData } from "@/components/career-roadmap"
import { SprintPlanner } from "@/components/sprint-planner"
import { toast } from "sonner"

const questions = [
  {
    id: "pressure_fear",
    text: "When facing a high-stakes component failure or public mistake, what is your immediate visceral reaction?",
    icon: Activity,
    options: [
      { label: "Fear of public visibility / embarrassment", value: "public_visibility" },
      { label: "Anxiety about technical complexity / fixing it", value: "technical_complexity" },
      { label: "Dread of letting down the team / responsibility", value: "responsibility_failure" },
    ],
  },
  {
    id: "life_preference",
    text: "Which lifestyle reality would you honestly choose for the next 10 years?",
    icon: Target,
    options: [
      { label: "High Income + High Stress + No Work-Life Balance", value: "high_income_high_stress" },
      { label: "Average Income + Peaceful 9-5 + Low Stress", value: "stable_peaceful" },
      { label: "Unstable Income + Complete Freedom + Travel", value: "flexible_unstable" },
    ],
  },
  {
    id: "team_role",
    text: "In a chaotic group project, who do you actually become?",
    icon: Users,
    options: [
      { label: "The Leader (Commanding everyone)", value: "leader" },
      { label: "The Strategist (Planning privately)", value: "strategist" },
      { label: "The Executor (Just tell me what to do)", value: "executor" },
    ],
  },
  {
    id: "failure_response",
    text: "What hurts you the most about failing?",
    icon: AlertTriangle,
    options: [
      { label: "People judging me / Social Image", value: "social_judgement" },
      { label: "Disappointing myself / My standards", value: "self_disappointment" },
      { label: "The lost opportunity / Wasted time", value: "lost_opportunity" },
    ],
  },
  {
    id: "energy_drain",
    text: "What exhausts you the fastest?",
    icon: Zap,
    options: [
      { label: "Constant people interaction / Meetings", value: "people_interaction" },
      { label: "Deep, isolated technical thinking", value: "deep_technical_thinking" },
      { label: "Repetitive, boring routine tasks", value: "repetitive_routine" },
    ],
  },
  {
    id: "risk_tolerance",
    text: "Which 'Risk' scares you less?",
    icon: Shield,
    options: [
      { label: "High Competition (Fighting for top spot)", value: "high_competition" },
      { label: "Long-term Study (No money for years)", value: "long_term_study" },
      { label: "Unstable Income (Feast or Famine)", value: "unstable_income" },
    ],
  },
]

export function CareerDiscovery() {
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [customInput, setCustomInput] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [selectedStream, setSelectedStream] = useState<string | null>(null)

  const handleCreateRoadmap = async () => {
    if (!aiResult || !selectedStream) return
    setLoadingRoadmap(true)
    try {
      const streamNames = aiResult.suitable_career_streams?.map((s: any) =>
        typeof s === "object" && s !== null ? s.name : s
      )
      const roleNames = aiResult.ideal_career_roles?.map((r: any) =>
        typeof r === "object" && r !== null ? r.role : r
      )
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${BACKEND}/generate-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discover_result: aiResult,
          selected_stream: selectedStream,
          goals: `I want to pursue a career in ${selectedStream}. Other potential streams: ${streamNames?.join(", ")}. Potential roles: ${roleNames?.join(", ")}.`
        })
      })
      if (!response.ok) throw new Error("Failed to generate roadmap")
      const data = await response.json()
      setRoadmapData(data)

      // Save to Firestore (silently skip if not logged in)
      try {
        const user = auth.currentUser
        if (user && data.phases) {
          await addDoc(collection(db, "users", user.uid, "roadmaps"), {
            stream: selectedStream,
            phases: data.phases,
            source: "discover",
            generatedAt: serverTimestamp(),
          })
        }
      } catch (saveErr) {
        console.warn("Roadmap save skipped:", saveErr)
      }

      setTimeout(() => {
        document.getElementById("generated-roadmap")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      toast.error("Failed to generate roadmap")
      console.error(error)
    } finally {
      setLoadingRoadmap(false)
    }
  }

  const progress = ((currentQ + 1) / questions.length) * 100

  function selectAnswer(answerValue: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentQ]: answerValue,
    }))
  }

  async function nextQuestion() {
    let finalAnswerForStep = answers[currentQ]

    if (customInput && customInput.trim() !== "") {
      finalAnswerForStep = customInput.trim()
      setAnswers((prev) => ({
        ...prev,
        [currentQ]: customInput.trim(),
      }))
      setCustomInput("")
    }

    if (!finalAnswerForStep) {
      console.log("No answer selected for question:", currentQ)
      return
    }

    const updatedAnswers = {
      ...answers,
      [currentQ]: finalAnswerForStep,
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1)
    } else {
      console.log("Submitting answers:", updatedAnswers)
      submitDiscover(updatedAnswers)
    }
  }

  async function submitDiscover(finalAnswers: Record<number, string>) {
    setLoading(true)
    setError(null)

    try {
      if (!finalAnswers) {
        console.error("No answers provided")
        return
      }

      const formattedDiscoverData: Record<string, any> = {
        pressure_fear: "",
        life_preference: "",
        team_role: "",
        failure_response: "",
        energy_drain: "",
        risk_tolerance: "",
        custom_inputs: {}
      }

      questions.forEach((q, index) => {
        const ans = finalAnswers[index]
        const selectedOpt = q.options.find((opt) => opt.value === ans)
        const answerText = selectedOpt ? `${selectedOpt.label} (${ans})` : (ans || "")
        formattedDiscoverData[q.id] = answerText
        if (!selectedOpt && ans) {
          formattedDiscoverData.custom_inputs[q.id] = ans
        }
      })

      console.log("Submitting Discover profiling data:", formattedDiscoverData)

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${BACKEND}/generate-discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedDiscoverData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server Error:", errorText)
        let errorMsg = "Server error"
        try {
          const errorJson = JSON.parse(errorText)
          errorMsg = errorJson.detail || errorText
        } catch (e) {
          errorMsg = errorText
        }
        throw new Error(errorMsg)
      }

      const result = await response.json()
      console.log("AI DISCOVER RESULT:", result)
      setAiResult(result)

      // Instantly initialize the Career Roadmap Panel from the AI output
      if (result.career_roadmap?.learning_path && result.career_roadmap.learning_path.length > 0) {
        setRoadmapData({ phases: result.career_roadmap.learning_path })
        const initialStream =
          result.career_roadmap.recommended_direction ||
          (typeof result.suitable_career_streams?.[0] === "object"
            ? result.suitable_career_streams[0]?.name
            : result.suitable_career_streams?.[0]) ||
          "Recommended Direction"
        setSelectedStream(initialStream)
      } else if (result.suitable_career_streams?.[0]) {
        const firstStream = result.suitable_career_streams[0]
        setSelectedStream(typeof firstStream === "object" ? firstStream.name : firstStream)
      }

      // Safe Firestore save (isolated so Firestore security rules or network do not block displaying results)
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid
          await setDoc(doc(db, "users", userId, "discover", "latest"), {
            result,
            timestamp: serverTimestamp(),
            answers: finalAnswers,
          })
        }
      } catch (saveErr) {
        console.warn("Firestore discover save skipped (non-critical):", saveErr)
      }

      setShowResults(true)

    } catch (err: any) {
      console.error("Discovery Analysis Error:", err)
      const errorMessage = err?.message || "Failed to analyze responses. Please check if backend is running."
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function prevQuestion() {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1)
    }
  }

  if (!started) {
    return (
      <section id="discovery" className="py-24 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mx-auto animate-pulse">
            <Brain className="h-5 w-5" />
            <span>Behavioral Profiling Engine</span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl text-foreground">
            Discover Who You <span className="text-primary">Really</span> Are
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No generic questions. We analyze your deep psychology, pressure response, and hidden traits to find your true career fit.
          </p>

          <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105" onClick={() => setStarted(true)}>
            Start Profiling
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    )
  }

  if (showResults && aiResult) {
    // Normalize stream and role data (support both string[] and object[] shapes)
    const streamsData: { name: string; avgSalaryRange?: string; reasoning?: string; match_score?: number }[] =
      (aiResult.suitable_career_streams ?? []).map((s: any) =>
        typeof s === "object" && s !== null
          ? s
          : { name: s, reasoning: "Directly matches your cognitive and behavioral response pattern.", match_score: 90 }
      )
    const rolesData: { role: string; avgStartingSalary?: string; reasoning?: string }[] =
      (aiResult.ideal_career_roles ?? aiResult.suitable_career_roles ?? []).map((r: any) =>
        typeof r === "object" && r !== null ? r : { role: r }
      )
    const personalityAxes: { axis: string; score: number }[] =
      aiResult.personality_axes ?? []

    const radarExplanation: Record<string, string> = aiResult.radar_trait_explanation ?? {}
    const interests: string[] = Array.isArray(aiResult.interests) ? aiResult.interests : []
    const behavioralPatterns: string[] = Array.isArray(aiResult.behavioral_patterns) ? aiResult.behavioral_patterns : []
    const strengths: string[] = Array.isArray(aiResult.strengths) ? aiResult.strengths : []
    const workPreferences: string[] = Array.isArray(aiResult.work_preferences) ? aiResult.work_preferences : []
    const motivation: string = aiResult.motivation || ""
    const careerTendencies: string[] = Array.isArray(aiResult.career_tendencies) ? aiResult.career_tendencies : []

    const roadmapObj = aiResult.career_roadmap ?? {}
    const recommendedDirection = roadmapObj.recommended_direction || selectedStream || streamsData[0]?.name || "Recommended Path"
    const directionSummary = roadmapObj.direction_summary || ""
    const technicalSkills: string[] = Array.isArray(roadmapObj.required_skills?.technical) ? roadmapObj.required_skills.technical : []
    const softSkills: string[] = Array.isArray(roadmapObj.required_skills?.soft_skills) ? roadmapObj.required_skills.soft_skills : []
    const nextSteps: string[] = Array.isArray(roadmapObj.next_steps) ? roadmapObj.next_steps : []

    return (
      <section id="discovery" className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="mx-auto max-w-6xl flex flex-col gap-12">
          
          {/* ── Main Header ── */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>Complete Psychological Profile & Career Blueprint</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground font-bold tracking-tight">
              Your Personalized Career Blueprint
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Synthesized directly from your psychological responses to pressure, risk tolerance, and work preferences.
            </p>
          </div>

          {/* ── Top Core Insights ── */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-8 border-l-4 border-l-primary flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold">Core Personality Insight</h3>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90">
                <BlurText
                  text={aiResult.core_personality_insight || "Deep behavioral profile generated from your answers."}
                  delay={40}
                  animateBy="words"
                  direction="top"
                  className="text-lg leading-relaxed text-foreground/90"
                />
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 border-l-4 border-l-amber-500 bg-amber-500/5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold">Honest Reality Check</h3>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90 italic font-medium">
                <BlurText
                  text={`"${aiResult.honest_reality_check || "Your nature defines where you flourish and where you burn out."}"`}
                  delay={40}
                  animateBy="words"
                  direction="top"
                  className="text-lg leading-relaxed text-foreground/90 italic"
                />
              </p>
            </div>
          </div>

          {/* ── Personality Profile Radar Chart & Trait Explanations ── */}
          {personalityAxes.length > 0 && (
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-8">
              <div className="text-center space-y-2">
                <h3 className="font-serif text-2xl font-bold">Personality Profile Radar</h3>
                <p className="text-sm text-muted-foreground">
                  Your psychological scoring across 6 essential career axes (0–100)
                </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 flex justify-center">
                  <ResponsiveContainer width="100%" height={340}>
                    <RadarChart cx="50%" cy="50%" outerRadius={115} data={personalityAxes}>
                      <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 600 }}
                      />
                      <Radar
                        name="You"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}/100`, "Score"]}
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-6 grid sm:grid-cols-2 gap-3">
                  {personalityAxes.map((trait) => (
                    <div
                      key={trait.axis}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">{trait.axis}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {trait.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {radarExplanation[trait.axis] || `Demonstrates high alignment with ${trait.axis.toLowerCase()} roles.`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Psychology-Based Profile Analysis ── */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-serif text-3xl font-bold flex items-center gap-3">
                <Brain className="w-7 h-7 text-primary" />
                Psychology-Based Profile Analysis
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Deep behavioral breakdown extracted directly from your answers on fear, teamwork, motivation, and failure recovery.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interests & Passions */}
              {interests.length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-lg">Intellectual Interests</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {interests.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavioral Patterns Under Pressure */}
              {behavioralPatterns.length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-lg">Behavioral Patterns</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {behavioralPatterns.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Innate Strengths */}
              {strengths.length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-lg">Innate Strengths</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Work Preferences */}
              {workPreferences.length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-lg">Work Preferences</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {workPreferences.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Core Motivation */}
              {motivation && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <Flame className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-lg">Core Motivation</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {motivation}
                  </p>
                </div>
              )}

              {/* Career Tendencies */}
              {careerTendencies.length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-lg">Career Tendencies</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {careerTendencies.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── Career Recommendations with Detailed Reasoning ── */}
          <div className="space-y-8">
            <div className="border-b border-border pb-4">
              <h3 className="font-serif text-3xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7 text-emerald-600" />
                Tailored Career Recommendations
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Concrete career paths recommended specifically for your psychological profile, with explicit matching reasons.
              </p>
            </div>

            {/* Suitable Career Streams with Reasoning */}
            <div className="grid md:grid-cols-2 gap-6">
              {streamsData.map((stream, i) => {
                const isSelected = selectedStream === stream.name
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedStream(stream.name)}
                    className={`rounded-3xl p-7 border-2 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between gap-6 relative group ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5 shadow-lg ring-2 ring-emerald-500/20 scale-[1.01]"
                        : "border-border bg-card hover:border-emerald-500/40 hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 font-mono">
                            Recommended Stream {i + 1}
                          </span>
                          <h4 className="font-serif text-2xl font-bold text-foreground mt-1">
                            {stream.name}
                          </h4>
                        </div>
                        {stream.match_score && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                            {stream.match_score}% Match
                          </span>
                        )}
                      </div>

                      {stream.avgSalaryRange && (
                        <div className="inline-block px-3 py-1 rounded-xl bg-muted/60 text-xs font-medium text-muted-foreground">
                          Estimated Avg Salary: <strong className="text-foreground">{stream.avgSalaryRange}</strong>
                        </div>
                      )}

                      {/* Explicit Reasoning Block */}
                      {stream.reasoning && (
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-sm space-y-1.5">
                          <span className="font-semibold text-xs text-foreground/90 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            Why This Matches Your Answers:
                          </span>
                          <p className="text-foreground/80 leading-relaxed text-sm">
                            {stream.reasoning}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs font-medium">
                      <span className={isSelected ? "text-emerald-600 font-bold flex items-center gap-1.5" : "text-muted-foreground"}>
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active in Roadmap Panel
                          </>
                        ) : (
                          "Click to view roadmap for this stream"
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ideal Career Roles with Role-Specific Reasoning */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
              <div>
                <h4 className="font-serif text-2xl font-bold flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-500" />
                  Ideal Job Titles & Fresher Roles
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Specific starting roles that align with your team dynamic and energy sustainability
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rolesData.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-semibold text-base text-blue-900 dark:text-blue-200">
                        {item.role}
                      </h5>
                      {item.avgStartingSalary && (
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-300 mt-1">
                          Fresher Starting: {item.avgStartingSalary}
                        </p>
                      )}
                    </div>
                    {item.reasoning && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-blue-500/10">
                        {item.reasoning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid & Skill Gaps Side-by-Side */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-3xl p-8 border border-red-500/20 bg-red-500/5 shadow-sm space-y-4">
                <h4 className="font-serif text-xl font-bold flex items-center gap-2 text-red-600">
                  <Shield className="w-5 h-5" />
                  Careers to Avoid (Burnout Risks)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Paths that clash directly with your energy drain and risk tolerance
                </p>
                <ul className="space-y-3 pt-2">
                  {aiResult.career_types_to_avoid?.map((career: string, i: number) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>{career}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-3xl p-8 border border-amber-500/20 bg-amber-500/5 shadow-sm space-y-4">
                <h4 className="font-serif text-xl font-bold flex items-center gap-2 text-amber-600">
                  <Zap className="w-5 h-5" />
                  Critical Skill Gaps to Bridge
                </h4>
                <p className="text-xs text-muted-foreground">
                  Skills you need to actively develop to succeed in your target stream
                </p>
                <ul className="space-y-3 pt-2">
                  {aiResult.skill_gaps?.map((gap: string, i: number) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
                      <span className="text-amber-500 font-bold">⚠</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Career Roadmap Panel ── */}
          <div id="career-roadmap-panel" className="space-y-8 pt-4">
            <div className="border-b border-border pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Actionable Roadmap Engine</span>
              </div>
              <h3 className="font-serif text-3xl font-bold">
                Career Roadmap Panel
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your structured learning trajectory, core skill prerequisites, and immediate execution steps.
              </p>
            </div>

            {/* Spotlight Direction Card */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/30 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                    Top Recommended Direction
                  </span>
                  <h4 className="font-serif text-3xl font-bold text-foreground mt-1">
                    {recommendedDirection}
                  </h4>
                </div>
                {selectedStream && selectedStream !== recommendedDirection && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateRoadmap}
                    disabled={loadingRoadmap}
                    className="rounded-full text-xs font-semibold"
                  >
                    {loadingRoadmap ? (
                      <>Generating for {selectedStream} <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin" /></>
                    ) : (
                      <>Switch Roadmap to &ldquo;{selectedStream}&rdquo; <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                    )}
                  </Button>
                )}
              </div>

              {directionSummary && (
                <p className="text-base text-foreground/85 leading-relaxed">
                  {directionSummary}
                </p>
              )}

              {/* Required Skills Matrix */}
              {(technicalSkills.length > 0 || softSkills.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
                  {technicalSkills.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        Required Technical & Domain Skills
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {technicalSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-card border border-primary/20 text-xs font-semibold text-foreground shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {softSkills.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        Required Behavioral & Soft Skills
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {softSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground/90 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Immediate Next Steps Checklist */}
            {nextSteps.length > 0 && (
              <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold">Immediate Next Steps (Next 7–30 Days)</h4>
                    <p className="text-xs text-muted-foreground">Actionable quick-wins to kickstart your momentum</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {nextSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground/90 leading-snug">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Step-by-Step Learning Path */}
            {roadmapData && (
              <div id="generated-roadmap" className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                <CareerRoadmap roadmapData={roadmapData} />

                {/* 90-Day Sprint Planner */}
                <div className="mx-auto max-w-5xl pb-12">
                  <SprintPlanner
                    selectedStream={selectedStream ?? recommendedDirection}
                    phase1Focus={roadmapData.phases?.[0]?.focus ?? []}
                    personalityProfile={aiResult?.core_personality_insight ?? ""}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    )
  }

  const q = questions[currentQ]
  const QuestionIcon = q.icon

  return (
    <section id="discovery" className="py-24 px-4 min-h-screen flex flex-col items-center justify-center bg-accent/5">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between text-muted-foreground mb-8">
          <span className="font-mono text-sm">QS {currentQ + 1} / {questions.length}</span>
          <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Take your time</span>
          </div>
        </div>

        <Progress value={progress} className="h-1 mb-12 bg-gray-200" />

        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto text-primary">
              <QuestionIcon className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-tight">
              {q.text}
            </h2>
          </div>

          <div className="grid gap-4">
            {q.options.map((option) => (
              <button
                key={option.value}
                onClick={() => selectAnswer(option.value)}
                disabled={loading}
                className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300
                   ${loading ? 'opacity-50 cursor-not-allowed border-transparent bg-gray-100' :
                    answers[currentQ] === option.value
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                      : 'border-transparent bg-white shadow-sm hover:border-primary/30 hover:shadow-md'
                  }
                 `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg text-foreground/90">{option.label}</span>
                  {answers[currentQ] === option.value && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4">
            <div className="relative">
              <Input
                placeholder="Or type your honest answer here..."
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value)
                  if (e.target.value) {
                    setAnswers((prev) => ({ ...prev, [currentQ]: "" }))
                  }
                }}
                disabled={loading}
                className="h-14 px-6 rounded-2xl border-transparent bg-white shadow-sm focus-visible:ring-primary/20 text-lg"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 rounded-xl bg-red-50 text-red-600 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mt-12 flex justify-between items-center">
          <Button variant="ghost" onClick={prevQuestion} disabled={currentQ === 0 || loading}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <Button
            size="lg"
            onClick={nextQuestion}
            disabled={(!answers[currentQ] && !customInput) || loading}
            className="rounded-full px-8"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <>{currentQ === questions.length - 1 ? "Get Analysis" : "Next Question"} <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
