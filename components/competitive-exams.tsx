"use client"

import { useState } from "react"
import {
  MapPin,
  ExternalLink,
  BookOpen,
  FileText,
  GraduationCap,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const states: Record<string, { name: string; exams: { name: string; description: string; officialUrl: string; resourceUrl: string }[] }> = {
  MH: {
    name: "Maharashtra",
    exams: [
      {
        name: "MHT CET",
        description: "Common Entrance Test for engineering and pharmacy courses in Maharashtra state colleges.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "MPSC",
        description: "Maharashtra Public Service Commission exam for state government administrative positions.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "MAH MBA CET",
        description: "State-level entrance for MBA/MMS programs in Maharashtra universities.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
  DL: {
    name: "Delhi",
    exams: [
      {
        name: "Delhi CET",
        description: "Common Entrance Test for polytechnic and diploma admissions in Delhi colleges.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "IPU CET",
        description: "Guru Gobind Singh Indraprastha University entrance for engineering, law, and management.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
  KA: {
    name: "Karnataka",
    exams: [
      {
        name: "KCET",
        description: "Karnataka Common Entrance Test for professional courses in engineering and medicine.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "KPSC",
        description: "Karnataka Public Service Commission exam for state-level civil services.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
  TN: {
    name: "Tamil Nadu",
    exams: [
      {
        name: "TNEA",
        description: "Tamil Nadu Engineering Admissions based on 12th marks for B.E./B.Tech courses.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "TNPSC",
        description: "Tamil Nadu Public Service Commission exam for state government positions.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
  UP: {
    name: "Uttar Pradesh",
    exams: [
      {
        name: "UPSEE / AKTU",
        description: "State entrance exam for engineering, pharmacy, and MBA programs in UP.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "UPPSC",
        description: "Uttar Pradesh Public Service Commission for state administrative services.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
  RJ: {
    name: "Rajasthan",
    exams: [
      {
        name: "RPSC RAS",
        description: "Rajasthan Administrative Services exam conducted by RPSC for state officers.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "REEET",
        description: "Rajasthan Eligibility Examination for Teachers, mandatory for teaching positions.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
  national: {
    name: "National Level",
    exams: [
      {
        name: "JEE Main & Advanced",
        description: "National exam for admission to IITs, NITs, and top engineering colleges.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "NEET",
        description: "National Eligibility cum Entrance Test for MBBS, BDS, and medical courses.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "UPSC CSE",
        description: "Civil Services Examination for IAS, IPS, and central government officers.",
        officialUrl: "#",
        resourceUrl: "#",
      },
      {
        name: "CUET",
        description: "Common University Entrance Test for admission to central universities across India.",
        officialUrl: "#",
        resourceUrl: "#",
      },
    ],
  },
}

export function CompetitiveExams() {
  const [selectedState, setSelectedState] = useState<string>("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const stateEntries = Object.entries(states)
  const selectedExams = selectedState ? states[selectedState] : null

  return (
    <section id="exams" className="py-24 px-4">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm w-fit mx-auto">
            <MapPin className="h-4 w-4" />
            <span>Know Your State Exams</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
            Competitive exams that matter to you
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {"Select your state to discover relevant competitive exams, what they're about, and where to find study resources."}
          </p>
        </div>

        {/* State Selector */}
        <div className="mx-auto w-full max-w-sm relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full glass-card rounded-xl px-4 py-3 flex items-center justify-between text-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className={selectedState ? "text-foreground" : "text-muted-foreground"}>
                {selectedState ? states[selectedState].name : "Select your state or region"}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl shadow-lg shadow-primary/5 overflow-hidden z-10 max-h-64 overflow-y-auto">
              {stateEntries.map(([code, state]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setSelectedState(code)
                    setDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-primary/5 ${
                    selectedState === code ? "bg-primary/5 text-primary" : "text-foreground"
                  }`}
                >
                  {state.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exam Cards */}
        {selectedExams && (
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up">
            {selectedExams.exams.map((exam) => (
              <div key={exam.name} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{exam.description}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs text-foreground bg-transparent" asChild>
                    <a href={exam.officialUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Official Site
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs text-foreground bg-transparent" asChild>
                    <a href={exam.resourceUrl} target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-3.5 w-3.5" />
                      Study Resources
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!selectedState && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Select a state above to explore competitive exams</p>
          </div>
        )}
      </div>
    </section>
  )
}
