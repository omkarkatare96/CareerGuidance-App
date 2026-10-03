"use client"

import { useState } from "react"
import {
    BookOpen,
    Filter,
    GraduationCap,
    Globe,
    Calendar,
    Users,
    FileText,
    ExternalLink,
    Search,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Exam {
    id: string
    name: string
    stream: string
    level: "National" | "State"
    examMonth: string
    eligibility: string
    pattern: string
    officialUrl: string
}

const EXAMS: Exam[] = [
    {
        id: "jee-main",
        name: "JEE Main",
        stream: "Engineering & Technology",
        level: "National",
        examMonth: "Jan & Apr",
        eligibility: "Class 12 (PCM), min 75% or top 20 percentile",
        pattern: "300 marks | 75 MCQ + Numerical | 3 hrs | Physics, Chemistry, Maths",
        officialUrl: "https://jeemain.nta.nic.in",
    },
    {
        id: "neet-ug",
        name: "NEET UG",
        stream: "Medical & Healthcare",
        level: "National",
        examMonth: "May",
        eligibility: "Class 12 (PCB), min 50% marks",
        pattern: "720 marks | 180 MCQ | 3 hrs 20 min | Physics, Chemistry, Biology",
        officialUrl: "https://neet.nta.nic.in",
    },
    {
        id: "upsc-cse",
        name: "UPSC CSE",
        stream: "Law & Public Policy",
        level: "National",
        examMonth: "Jun (Prelims), Sep (Mains)",
        eligibility: "Any graduate, age 21–32 (Gen)",
        pattern: "Prelims: 400 marks | Mains: 1750 marks | Interview: 275 marks",
        officialUrl: "https://upsc.gov.in",
    },
    {
        id: "cat",
        name: "CAT",
        stream: "Business & Finance",
        level: "National",
        examMonth: "Nov",
        eligibility: "Any graduate with min 50% (45% for SC/ST)",
        pattern: "198 marks | 66 MCQ + TITA | 2 hrs | VARC, DILR, QA",
        officialUrl: "https://iimcat.ac.in",
    },
    {
        id: "clat",
        name: "CLAT",
        stream: "Law & Public Policy",
        level: "National",
        examMonth: "Dec",
        eligibility: "Class 12 with min 45% marks",
        pattern: "120 marks | 120 MCQ | 2 hrs | English, GK, Legal, Logical, Math",
        officialUrl: "https://consortiumofnlus.ac.in",
    },
    {
        id: "nda",
        name: "NDA",
        stream: "Law & Public Policy",
        level: "National",
        examMonth: "Apr & Sep",
        eligibility: "Class 12 (PCM for Army/AF/Navy), unmarried male, age 16.5–19.5",
        pattern: "Maths: 300 | GAT: 600 | SSB Interview",
        officialUrl: "https://upsc.gov.in/examinations/active-examinations/nda-na",
    },
    {
        id: "gate",
        name: "GATE",
        stream: "Engineering & Technology",
        level: "National",
        examMonth: "Feb",
        eligibility: "B.E./B.Tech or final year student",
        pattern: "100 marks | 65 Questions | 3 hrs | MCQ, MSQ, NAT",
        officialUrl: "https://gate2025.iitr.ac.in",
    },
    {
        id: "cuet-ug",
        name: "CUET UG",
        stream: "Education & Research",
        level: "National",
        examMonth: "May–Jun",
        eligibility: "Class 12 pass (any stream)",
        pattern: "Domain subjects + General Test | Multiple sessions",
        officialUrl: "https://cuet.samarth.ac.in",
    },
    {
        id: "ssc-cgl",
        name: "SSC CGL",
        stream: "Business & Finance",
        level: "National",
        examMonth: "Sep–Oct",
        eligibility: "Any graduate, age 18–32",
        pattern: "Tier 1: 200 marks MCQ | Tier 2: 300 marks | 2 hrs each",
        officialUrl: "https://ssc.nic.in",
    },
    {
        id: "nift-nid",
        name: "NIFT / NID",
        stream: "Design & Creative Arts",
        level: "National",
        examMonth: "Jan (NID), Feb (NIFT)",
        eligibility: "Class 12 pass (any stream), age up to 24",
        pattern: "CAT + GAT test | Situation Test | Studio Test / Interview",
        officialUrl: "https://nift.ac.in",
    },
    {
        id: "mht-cet",
        name: "MHT-CET",
        stream: "Engineering & Technology",
        level: "State",
        examMonth: "Apr–May",
        eligibility: "Class 12 (PCM), Maharashtra domicile preferred",
        pattern: "200 marks | 150 MCQ | 3 hrs | Maths, Physics, Chemistry",
        officialUrl: "https://cetcell.mahacet.org",
    },
    {
        id: "kcet",
        name: "KCET",
        stream: "Engineering & Technology",
        level: "State",
        examMonth: "Apr",
        eligibility: "Class 12 (PCM/PCB), Karnataka domicile",
        pattern: "180 marks | Physics + Chemistry + Maths/Biology | 80 min each",
        officialUrl: "https://cetonline.karnataka.gov.in",
    },
    {
        id: "wbjee",
        name: "WBJEE",
        stream: "Engineering & Technology",
        level: "State",
        examMonth: "Apr",
        eligibility: "Class 12 (PCM), West Bengal domicile preferred",
        pattern: "200 marks | Mathematics + Physics + Chemistry | 2 hrs each",
        officialUrl: "https://wbjeeb.nic.in",
    },
    {
        id: "ap-eamcet",
        name: "AP EAMCET",
        stream: "Engineering & Technology",
        level: "State",
        examMonth: "May",
        eligibility: "Class 12 (PCM/PCB), Andhra Pradesh domicile",
        pattern: "160 marks | 160 MCQ | 3 hrs | Maths/Biology, Physics, Chemistry",
        officialUrl: "https://sche.ap.gov.in/eapcet",
    },
    {
        id: "tnea",
        name: "TNEA",
        stream: "Engineering & Technology",
        level: "State",
        examMonth: "Jul (Counselling)",
        eligibility: "Class 12 (PCM), Tamil Nadu domicile preferred; merit-based, no entrance exam",
        pattern: "No entrance test — merit based on Class 12 marks",
        officialUrl: "https://tneaonline.org",
    },
]

const STREAM_FILTERS = [
    "All",
    "Engineering & Technology",
    "Medical & Healthcare",
    "Law & Public Policy",
    "Business & Finance",
    "Design & Creative Arts",
    "Education & Research",
]

const LEVEL_FILTERS = ["All", "National", "State"]

const LEVEL_COLOR: Record<string, string> = {
    National: "bg-primary/10 text-primary",
    State: "bg-accent/10 text-accent-foreground border border-border",
}

export default function ExamsPage() {
    const [search, setSearch] = useState("")
    const [streamFilter, setStreamFilter] = useState("All")
    const [levelFilter, setLevelFilter] = useState("All")

    const filtered = EXAMS.filter((e) => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.stream.toLowerCase().includes(search.toLowerCase())
        const matchStream = streamFilter === "All" || e.stream === streamFilter
        const matchLevel = levelFilter === "All" || e.level === levelFilter
        return matchSearch && matchStream && matchLevel
    })

    return (
        <main className="min-h-screen">
            <Navbar />
            <section className="py-24 px-4">
                <div className="mx-auto max-w-6xl flex flex-col gap-10">

                    {/* Header */}
                    <div className="text-center flex flex-col gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm w-fit mx-auto">
                            <GraduationCap className="h-4 w-4" />
                            <span>Competitive Exams</span>
                        </div>
                        <h1 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
                            Find Your Qualifying Exam
                        </h1>
                        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                            Explore major national and state competitive exams across every career stream. Click any card to visit the official website.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search exams or streams..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl"
                            />
                        </div>

                        {/* Level filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {LEVEL_FILTERS.map((l) => (
                                <Button
                                    key={l}
                                    size="sm"
                                    variant={levelFilter === l ? "default" : "outline"}
                                    onClick={() => setLevelFilter(l)}
                                    className="rounded-full h-7 text-xs"
                                >
                                    {l}
                                </Button>
                            ))}
                        </div>

                        {/* Stream filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {STREAM_FILTERS.map((s) => (
                                <Button
                                    key={s}
                                    size="sm"
                                    variant={streamFilter === s ? "default" : "outline"}
                                    onClick={() => setStreamFilter(s)}
                                    className="rounded-full h-7 text-xs"
                                >
                                    {s === "All" ? "All Streams" : s.split(" & ")[0]}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Count */}
                    <p className="text-sm text-muted-foreground -mt-4">
                        Showing <span className="font-medium text-foreground">{filtered.length}</span> exams
                    </p>

                    {/* Cards grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((exam) => (
                            <a
                                key={exam.id}
                                href={exam.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group glass-card rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all"
                            >
                                {/* Name + Level badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">
                                        {exam.name}
                                    </h2>
                                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLOR[exam.level]}`}>
                                        {exam.level}
                                    </span>
                                </div>

                                {/* Stream */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <BookOpen className="h-3 w-3 flex-shrink-0" />
                                    <span>{exam.stream}</span>
                                </div>

                                <div className="flex flex-col gap-2 text-sm">
                                    {/* Exam Month */}
                                    <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground/80">{exam.examMonth}</span>
                                    </div>

                                    {/* Eligibility */}
                                    <div className="flex items-start gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground/80">{exam.eligibility}</span>
                                    </div>

                                    {/* Pattern */}
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground/80">{exam.pattern}</span>
                                    </div>
                                </div>

                                {/* Official site label */}
                                <div className="mt-auto flex items-center gap-1 text-xs text-primary font-medium">
                                    <Globe className="h-3 w-3" />
                                    <span>Official Website</span>
                                    <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </a>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p>No exams match your filters.</p>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    )
}
