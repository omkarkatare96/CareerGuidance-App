"use client"

import { useState } from "react"
import {
  Code,
  Stethoscope,
  Scale,
  Briefcase,
  PenTool,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Brain,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import BlurText from "@/components/BlurText"
import { CareerRoadmap, RoadmapData } from "@/components/career-roadmap"
import { auth, db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

// Stream Interfaces
interface StreamQuestion {
  id: string
  text: string
  options: {
    label: string
    value: string
  }[]
}

interface StreamData {
  id: string
  title: string
  icon: any
  description: string
  questions: StreamQuestion[]
}

// Stream Definitions & Questions
const STREAMS: StreamData[] = [
  {
    id: "Engineering & Technology",
    title: "Engineering & Technology",
    icon: Code,
    description: "Software, hardware, AI, robotics, data science",
    questions: [
      {
        id: "q1",
        text: "When stuck on a difficult math/coding problem, how do you feel?",
        options: [
          { label: "Excited to solve it", value: "excited_problem_solving" },
          { label: "Mentally tired but satisfied", value: "mentally_tired_but_satisfied" },
          { label: "Frustrated and bored", value: "frustrated_and_bored" },
        ],
      },
      {
        id: "q2",
        text: "If your code/project fails 10 times, what do you do?",
        options: [
          { label: "Calmly debug again", value: "debug_calmly_again" },
          { label: "Search for a quick fix", value: "search_quick_solution" },
          { label: "Give up, it's irritating", value: "give_up_irritated" },
        ],
      },
      {
        id: "q3",
        text: "How do you feel about learning new tools every 6 months?",
        options: [
          { label: "Love it, tech changes fast!", value: "enjoy_learning_new_tech" },
          { label: "I'll learn only if required", value: "learn_only_if_required" },
          { label: "I hate frequent changes", value: "avoid_frequent_changes" },
        ],
      },
      {
        id: "q4",
        text: "Why do you want to choose Engineering?",
        options: [
          { label: "I love building & solving things", value: "love_problem_solving" },
          { label: "It pays a good salary", value: "good_salary_scope" },
          { label: "My parents/friends suggested it", value: "family_or_society_pressure" },
        ],
      },
    ],
  },
  {
    id: "Medical & Healthcare",
    title: "Medical & Healthcare",
    icon: Stethoscope,
    description: "Medicine, nursing, pharmacy, biotech, research",
    questions: [
      {
        id: "q1",
        text: "Are you ready to study for 5-8+ years before a stable income?",
        options: [
          { label: "Yes, I'm dedicated", value: "ready_for_long_study" },
          { label: "Maybe, if I stay motivated", value: "maybe_if_motivated" },
          { label: "No, I want early earnings", value: "want_early_income" },
        ],
      },
      {
        id: "q2",
        text: "How do you react to blood, pain, or critical patient situations?",
        options: [
          { label: "I stay calm and focused", value: "stay_calm" },
          { label: "Uncomfortable but I can manage", value: "uncomfortable_but_manage" },
          { label: "I get emotionally disturbed", value: "emotionally_disturbed" },
        ],
      },
      {
        id: "q3",
        text: "Can you handle high-pressure emergency situations?",
        options: [
          { label: "I stay professional", value: "stay_professional" },
          { label: "I get emotionally affected", value: "emotionally_affected" },
          { label: "I take it personally", value: "take_it_personally" },
        ],
      },
      {
        id: "q4",
        text: "Meaning of success in medicine for you?",
        options: [
          { label: "Saving lives & helping people", value: "want_to_help_people" },
          { label: "Respect, status, and stability", value: "respect_and_stability" },
          { label: "Family pressure to be a doctor", value: "family_pressure" },
        ],
      },
    ],
  },
  {
    id: "Law & Public Policy",
    title: "Law & Public Policy",
    icon: Scale,
    description: "Legal practice, judiciary, civil services, governance",
    questions: [
      {
        id: "q1",
        text: "Do you enjoy public speaking and debating?",
        options: [
          { label: "Yes, I'm very confident", value: "confident_speaker" },
          { label: "Sometimes confident", value: "sometimes_confident" },
          { label: "No, I get nervous", value: "not_confident" },
        ],
      },
      {
        id: "q2",
        text: "Can you read 500+ pages of dense text (case files/laws) weekly?",
        options: [
          { label: "Yes, I enjoy deep reading", value: "enjoy_deep_reading" },
          { label: "Only when required", value: "read_when_required" },
          { label: "No, I avoid long reading", value: "avoid_long_reading" },
        ],
      },
      {
        id: "q3",
        text: "How do you handle losing an argument?",
        options: [
          { label: "Analyze and prepare stronger", value: "prepare_stronger" },
          { label: "Get upset but move on", value: "upset_but_move_on" },
          { label: "Get discouraged easily", value: "discouraged_easily" },
        ],
      },
      {
        id: "q4",
        text: "What draws you to Law?",
        options: [
          { label: "Fighting for justice/truth", value: "love_debate_and_justice" },
          { label: "Power, status, and debating", value: "status_and_power" },
          { label: "External influence (movies/family)", value: "external_influence" },
        ],
      },
    ],
  },
  {
    id: "Business & Finance",
    title: "Business & Finance",
    icon: Briefcase,
    description: "Management, entrepreneurship, banking, investment",
    questions: [
      {
        id: "q1",
        text: "How do you feel about financial risk?",
        options: [
          { label: "I accept risk for growth", value: "accept_risk" },
          { label: "I get slightly worried", value: "slightly_worried" },
          { label: "I need a safe, stable salary", value: "need_stable_salary" },
        ],
      },
      {
        id: "q2",
        text: "Are you good with numbers and money management?",
        options: [
          { label: "Confident and intuitive", value: "confident_with_money" },
          { label: "I learn slowly", value: "learn_slowly" },
          { label: "Nervous about calculations", value: "nervous_about_money" },
        ],
      },
      {
        id: "q3",
        text: "How do you view competition?",
        options: [
          { label: "I enjoy winning against others", value: "enjoy_competition" },
          { label: "I accept it as part of work", value: "accept_competition" },
          { label: "I avoid competitive environments", value: "avoid_competition" },
        ],
      },
      {
        id: "q4",
        text: "Primary motivation for Business?",
        options: [
          { label: "Building something new", value: "want_to_build_something" },
          { label: "Accumulating wealth", value: "money_growth" },
          { label: "Looking cool / Influencer trend", value: "trend_or_influence" },
        ],
      },
    ],
  },
  {
    id: "Design & Creative Arts",
    title: "Design & Creative Arts",
    icon: PenTool,
    description: "Graphic design, UX/UI, animation, fashion, film",
    questions: [
      {
        id: "q1",
        text: "How do you react to harsh criticism of your work?",
        options: [
          { label: "Use it to improve & retry", value: "improve_and_retry" },
          { label: "Feel bad but retry", value: "feel_bad_but_retry" },
          { label: "Feel demotivated & stop", value: "feel_demotivated" },
        ],
      },
      {
        id: "q2",
        text: "Creative fields can have unstable income initially. Thoughts?",
        options: [
          { label: "I accept the struggle", value: "accept_unstable_income" },
          { label: "Slightly worried", value: "slight_worry" },
          { label: "Not acceptable", value: "not_acceptable" },
        ],
      },
      {
        id: "q3",
        text: "Do you prefer a fixed 9-5 routine or creative freedom?",
        options: [
          { label: "Creative freedom (even if chaotic)", value: "creative_freedom" },
          { label: "Balanced work", value: "balanced_work" },
          { label: "Fixed routine and order", value: "fixed_routine" },
        ],
      },
      {
        id: "q4",
        text: "Why choose Creative Arts?",
        options: [
          { label: "Pure passion for creating", value: "passion_for_creativity" },
          { label: "Want a flexible lifestyle", value: "flexible_lifestyle" },
          { label: "To escape academic studying", value: "escape_academics" },
        ],
      },
    ],
  },
  {
    id: "Education & Research",
    title: "Education & Research",
    icon: GraduationCap,
    description: "Teaching, academia, scientific research, PhD",
    questions: [
      {
        id: "q1",
        text: "How do you feel about studying a single topic deeply for years?",
        options: [
          { label: "I enjoy deep study", value: "enjoy_deep_study" },
          { label: "Manageable", value: "manageable" },
          { label: "Boring", value: "boring" },
        ],
      },
      {
        id: "q2",
        text: "Research requires patience with slow results. You are?",
        options: [
          { label: "Patient and consistent", value: "patient_and_consistent" },
          { label: "I feel progress is slow", value: "feel_slow_progress" },
          { label: "Frustrated quickly", value: "frustrated_quickly" },
        ],
      },
      {
        id: "q3",
        text: "Do you enjoy explaining complex concepts to others?",
        options: [
          { label: "Love teaching/explaining", value: "enjoy_explaining" },
          { label: "Neutral feeling", value: "neutral_feeling" },
          { label: "It's tiring repetition", value: "tiring_repetition" },
        ],
      },
      {
        id: "q4",
        text: "Why Education/Research?",
        options: [
          { label: "Love for knowledge & discovery", value: "love_for_knowledge" },
          { label: "Job stability (Professor)", value: "job_stability" },
          { label: "It's a safe option", value: "safe_option" },
        ],
      },
    ],
  },
]

interface AnalysisResult {
  alignment_score: number
  fit_level: string
  core_analysis: string
  strengths: string[]
  risk_factors: string[]
  improvement_advice: string[]
  final_verdict: string
}

export function KnowMyGoal() {
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)

  const handleStreamSelect = (stream: StreamData) => {
    setSelectedStream(stream)
    setStep(0)
    setAnswers({})
    setResult(null)
    setRoadmapData(null)
  }

  const handleCreateRoadmap = async () => {
    if (!result || !selectedStream) return
    setLoadingRoadmap(true)
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${BACKEND}/generate-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discover_result: result,
          selected_stream: selectedStream.title,
          goals: `I want to pursue ${selectedStream.title} path.`
        })
      })
      if (!response.ok) throw new Error("Failed to generate roadmap")
      const data: RoadmapData = await response.json()
      setRoadmapData(data)

      // Save to Firestore (silently skip if not logged in)
      try {
        const user = auth.currentUser
        if (user && data.phases) {
          await addDoc(collection(db, "users", user.uid, "roadmaps"), {
            stream: selectedStream.title,
            phases: data.phases,
            source: "goals",
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

  const handleAnswer = (value: string) => {
    if (!selectedStream) return

    const currentQ = selectedStream.questions[step]
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)

    if (step < selectedStream.questions.length - 1) {
      setStep(step + 1)
    } else {
      submitAnalysis(newAnswers)
    }
  }

  const submitAnalysis = async (finalAnswers: Record<string, string>) => {
    if (!selectedStream) return
    setAnalyzing(true)

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${BACKEND}/generate-stream-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selected_stream: selectedStream.id,
          answers: finalAnswers,
        }),
      })

      if (!response.ok) throw new Error("Failed to analyze")

      const data = await response.json()
      setResult(data)
    } catch (error) {
      toast.error("Analysis failed. Please try again.")
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setSelectedStream(null)
    setStep(0)
    setAnswers({})
    setResult(null)
    setRoadmapData(null)
  }

  // View 1: Stream Selection
  if (!selectedStream) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-background to-accent/5">
        <div className="mx-auto max-w-5xl flex flex-col gap-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit mx-auto">
              <TrendingUp className="h-4 w-4" />
              <span>Reality Check Engine</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              Choose Your Target Stream
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Thinking about a career path? Let&apos;s evaluate if you truly belong there or if you might regret it later.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STREAMS.map((stream) => (
              <button
                key={stream.id}
                onClick={() => handleStreamSelect(stream)}
                className="group relative overflow-hidden rounded-3xl p-8 text-left bg-card hover:bg-accent/5 border border-border/50 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 block h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col gap-4 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stream.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {stream.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stream.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // View 2: Analysis/Results
  if (analyzing || result) {
    return (
      <section className="py-24 px-4 min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-3xl w-full">
          {analyzing ? (
            <div className="flex flex-col items-center gap-6 text-center animate-pulse">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-spin">
                <RefreshCw className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif text-foreground">Analyzing your psychology...</h3>
              <p className="text-muted-foreground">Checking alignment with {selectedStream.title}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 animate-fade-in-up">
              {/* Header Score */}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-lg text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${result?.fit_level === 'Strong Fit' ? 'bg-green-500' :
                    result?.fit_level === 'Conditional Fit' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />

                <h2 className="text-muted-foreground uppercase tracking-widest text-xs font-bold mb-2">Compatibility Score</h2>
                <div className="text-6xl font-serif font-bold text-foreground mb-4">
                  {result?.alignment_score}<span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${result?.fit_level === 'Strong Fit' ? 'bg-green-100 text-green-700' :
                    result?.fit_level === 'Conditional Fit' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {result?.fit_level}
                </div>
              </div>

              {/* Core Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                    <h3 className="font-serif text-xl">Core Analysis</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <BlurText text={result?.core_analysis || ""} delay={30} animateBy="words" direction="top" className="text-muted-foreground leading-relaxed" />
                  </p>
                </div>

                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <h3 className="font-serif text-xl">Your Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {result?.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/80">
                        <span className="text-green-500">•</span> <BlurText text={s} delay={20} animateBy="words" direction="top" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verdict & Risks */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <h3 className="font-serif text-xl">Risk Factors</h3>
                  </div>
                  <ul className="space-y-2">
                    {result?.risk_factors.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/80">
                        <span className="text-red-500">•</span> <BlurText text={r} delay={20} animateBy="words" direction="top" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                    <h3 className="font-serif text-xl">Improvement Advice</h3>
                  </div>
                  <ul className="space-y-2">
                    {result?.improvement_advice.map((advice, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/80">
                        <span className="text-blue-500">•</span> <BlurText text={advice} delay={20} animateBy="words" direction="top" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Final Verdict */}
              <div className="bg-primary/5 rounded-3xl p-8 text-center border border-primary/10">
                <h3 className="font-serif text-2xl mb-3">Final Verdict</h3>
                <p className="text-lg text-foreground font-medium max-w-2xl mx-auto">
                  &quot;<BlurText text={result?.final_verdict || ""} delay={50} animateBy="words" direction="top" className="inline" />&quot;
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={reset}>Check Another Stream</Button>
                <Button onClick={handleCreateRoadmap} disabled={loadingRoadmap}>
                  {loadingRoadmap ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Roadmap...</>
                  ) : (
                    <>Create Roadmap <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>

              {/* Generated Roadmap Section */}
              {roadmapData && (
                <div id="generated-roadmap" className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                  <CareerRoadmap roadmapData={roadmapData} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    )
  }

  // View 3: Quiz/Questions
  return (
    <section className="py-24 px-4 min-h-screen flex flex-col items-center justify-center bg-accent/5">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between text-muted-foreground text-sm">
          <span>Question {step + 1} of {selectedStream.questions.length}</span>
          <span>{selectedStream.title}</span>
        </div>

        <Progress value={((step + 1) / selectedStream.questions.length) * 100} className="mb-8 h-2" />

        <div className="bg-card rounded-3xl p-10 border border-border shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-serif text-2xl md:text-3xl mb-8 leading-tight">
            {selectedStream.questions[step].text}
          </h3>

          <div className="flex flex-col gap-4">
            {selectedStream.questions[step].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="text-left p-5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 group flex items-center justify-between"
              >
                <span className="font-medium text-lg">{option.label}</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={reset} className="text-muted-foreground hover:text-foreground">
            Cancel & Go Back
          </Button>
        </div>
      </div>
    </section>
  )
}
