import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  BookOpen, FileText, FlaskConical, Video, ClipboardList,
  Brain, ChevronRight, Clock, CheckCircle, AlertCircle,
  Play, Upload, Star, Zap, Target, TrendingUp, Calendar,
  GraduationCap, Lightbulb, ArrowRight, Lock, BarChart2
} from "lucide-react";

// ── Mock data (replace with API calls later) ──────────────────────────────────
const COURSES = {
  1: {
    code: "COMP516", title: "Research Methods in CS", color: "#1fb6a6",
    instructor: "Prof. Phil Jimmieson", semester: "Semester 2 · 2025–26",
    examType: "Written (Essay + Short Answer)", examDate: "TBC",
    overallGrade: "74%",
    sections: {
      lectures: [
        { id: 1, title: "Introduction to Research Methods", slides: 18, viewed: true, week: 1 },
        { id: 2, title: "Quantitative Research Design", slides: 22, viewed: true, week: 2 },
        { id: 3, title: "Literature Review Methodology", slides: 16, viewed: false, week: 3 },
        { id: 4, title: "Qualitative Methods & Interviews", slides: 20, viewed: false, week: 4 },
        { id: 5, title: "Ethics in CS Research", slides: 14, viewed: false, week: 5 },
      ],
      tutorials: [
        { id: 1, title: "Tutorial 1: Research Question Design", week: 2, completed: true, aiHelp: "How to narrow a broad research area into a precise, testable question." },
        { id: 2, title: "Tutorial 2: Literature Search Strategy", week: 4, completed: true, aiHelp: "Boolean operators, database selection, PRISMA flow." },
        { id: 3, title: "Tutorial 3: Data Collection Methods", week: 6, completed: false, aiHelp: "Survey design, interview protocols, sampling." },
        { id: 4, title: "Tutorial 4: Statistical Analysis", week: 8, completed: false, aiHelp: "t-tests, ANOVA, regression — which to use when." },
      ],
      labs: [
        { id: 1, title: "Lab 1: Systematic Literature Search", week: 3, completed: true, tool: "Zotero + Scopus", aiHelp: "I can walk you through the PRISMA flow step by step." },
        { id: 2, title: "Lab 2: Survey Design in Qualtrics", week: 5, completed: false, tool: "Qualtrics", aiHelp: "Tips on avoiding leading questions and scaling responses." },
        { id: 3, title: "Lab 3: Statistical Analysis in Python", week: 7, completed: false, tool: "Python + scipy", aiHelp: "scipy.stats walkthrough — t-tests and p-values explained." },
      ],
      recordings: [
        { id: 1, title: "Lecture 1 Recording — Research Paradigms", duration: "52 min", week: 1, watched: true },
        { id: 2, title: "Lecture 2 Recording — Quantitative Methods", duration: "48 min", week: 2, watched: true },
        { id: 3, title: "Lecture 3 Recording — Literature Reviews", duration: "55 min", week: 3, watched: false },
        { id: 4, title: "Tutorial 2 Recording — Live Q&A Session", duration: "38 min", week: 4, watched: false },
      ],
      assignments: [
        { id: 1, title: "CA1: Research Proposal", due: "15 Mar 2026", points: 10, scored: 10, status: "graded", weight: "20%" },
        { id: 2, title: "CA2: Literature Review Draft", due: "6 May 2026", points: 10, scored: 8, status: "graded", weight: "30%" },
        { id: 3, title: "Final Dissertation", due: "11 Sep 2026", points: 100, scored: null, status: "active", weight: "50%" },
      ],
    }
  },
  2: {
    code: "COMP702", title: "MSc Placement Project", color: "#f5a623",
    instructor: "Prof. Phil Jimmieson", semester: "Year in Industry · 2025–26",
    examType: "Dissertation + Presentation", examDate: "21 Aug 2026",
    overallGrade: "In Progress",
    sections: {
      lectures: [
        { id: 1, title: "Project Planning & Methodology", slides: 12, viewed: true, week: 1 },
        { id: 2, title: "Writing Up Research", slides: 10, viewed: false, week: 2 },
      ],
      tutorials: [
        { id: 1, title: "Supervisor Meeting 1", week: 1, completed: true, aiHelp: "How to prepare for your supervisor meeting." },
        { id: 2, title: "Supervisor Meeting 2", week: 4, completed: false, aiHelp: "Progress review — what to bring." },
      ],
      labs: [],
      recordings: [
        { id: 1, title: "Dissertation Guidance Session", duration: "40 min", week: 1, watched: false },
      ],
      assignments: [
        { id: 1, title: "Interim Report", due: "21 Aug 2026", points: 100, scored: null, status: "active", weight: "40%" },
        { id: 2, title: "Final Dissertation", due: "11 Sep 2026", points: 100, scored: null, status: "active", weight: "60%" },
      ],
    }
  },
  3: {
    code: "ENVS563", title: "Geographic Data Science", color: "#e24b4a",
    instructor: "Dr. Dani Arribas-Bel", semester: "Semester 2 · 2025–26",
    examType: "Coursework Only (No Exam)", examDate: "N/A",
    overallGrade: "82%",
    sections: {
      lectures: [
        { id: 1, title: "Introduction to GDS", slides: 20, viewed: true, week: 1 },
        { id: 2, title: "Spatial Data Structures", slides: 18, viewed: true, week: 2 },
        { id: 3, title: "Programmatic Mapping with Python", slides: 24, viewed: true, week: 3 },
        { id: 4, title: "Spatial Autocorrelation", slides: 16, viewed: false, week: 4 },
      ],
      tutorials: [
        { id: 1, title: "Tutorial 1: Python GIS Setup", week: 1, completed: true, aiHelp: "geopandas, folium, matplotlib — setup and usage." },
        { id: 2, title: "Tutorial 2: Colombia Map Assignment", week: 3, completed: false, aiHelp: "Step-by-step help for the programmed map (563.1)." },
      ],
      labs: [
        { id: 1, title: "Lab 1: GeoPandas Basics", week: 2, completed: true, tool: "Python + geopandas", aiHelp: "Reading shapefiles, projections, and plotting." },
        { id: 2, title: "Lab 2: Choropleth Mapping", week: 4, completed: false, tool: "Python + matplotlib", aiHelp: "Colour scales, classification schemes, legends." },
      ],
      recordings: [
        { id: 1, title: "Lecture 1 — Intro to GDS", duration: "45 min", week: 1, watched: true },
        { id: 2, title: "Lecture 3 — Programmatic Maps", duration: "50 min", week: 3, watched: true },
      ],
      assignments: [
        { id: 1, title: "563.1: Programmed Map — Colombia", due: "Resit TBC", points: 100, scored: null, status: "active", weight: "40%" },
        { id: 2, title: "563.2: Spatial Analysis Report", due: "TBC", points: 100, scored: null, status: "upcoming", weight: "60%" },
      ],
    }
  }
};

// ── Small reusable card ───────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "12px",
      border: "1px solid var(--border)", padding: "20px",
      boxShadow: "var(--shadow)", ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <div style={{ background: `${color}20`, borderRadius: "8px", padding: "7px" }}>
        <Icon size={18} color={color} />
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{label}</h3>
      {count !== undefined && (
        <span style={{ background: `${color}20`, color, fontSize: "11px",
          fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>{count}</span>
      )}
    </div>
  );
}

// ── AI Skill Builder modal ───────────────────────────────────────────────────
function SkillBuilder({ item, type, onClose, courseColor }) {
  const [step, setStep] = useState(0);
  const steps = type === "assignment" ? [
    "Understand the brief — AI reads the assignment spec and explains what's required",
    "Break it into chunks — AI creates a personalised task list with time estimates",
    "Draft support — AI helps you write each section without doing it for you",
    "Review & improve — AI checks your work against the marking criteria",
    "Final polish — citations, formatting, submission checklist"
  ] : [
    "Understand today's objectives — AI summarises what you need to achieve",
    "Key concepts explained — AI explains the core theory before you start",
    "Step-by-step walkthrough — AI guides you through the practical tasks",
    "Common mistakes — AI flags the errors most students make in this lab",
    "Connecting to lectures — AI links the lab back to relevant slide content"
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "16px", width: "100%",
        maxWidth: "560px", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ background: courseColor, padding: "20px 24px", display: "flex",
          justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={18} color="white" />
              <span style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>AI Skill Builder</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>{item.title}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: "6px", padding: "6px 10px", color: "white", cursor: "pointer", fontSize: "13px" }}>✕</button>
        </div>
        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            {item.aiHelp}
          </p>
          <div style={{ marginBottom: "20px" }}>
            {steps.map((s, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                display: "flex", gap: "12px", alignItems: "flex-start",
                padding: "10px 12px", borderRadius: "8px", marginBottom: "6px",
                background: step === i ? `${courseColor}15` : "var(--bg-secondary)",
                border: `1px solid ${step === i ? courseColor : "var(--border)"}`,
                cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                  background: i < step ? "#1fb6a6" : step === i ? courseColor : "var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < step
                    ? <CheckCircle size={12} color="white" />
                    : <span style={{ color: "white", fontSize: "10px", fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: "13px", color: step === i ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: step === i ? 600 : 400, lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(s => Math.min(s + 1, steps.length - 1))}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none",
              background: courseColor, color: "white", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {step < steps.length - 1 ? <><ArrowRight size={16} /> Next Step</> : <><CheckCircle size={16} /> Complete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CourseHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = COURSES[id] || COURSES[1];
  const [activeTab, setActiveTab] = useState("overview");
  const [skillBuilderItem, setSkillBuilderItem] = useState(null);
  const [skillBuilderType, setSkillBuilderType] = useState(null);
  const { sections, color } = course;

  const tabs = [
    { id: "overview",     label: "Overview",    icon: BarChart2   },
    { id: "lectures",     label: "Lectures",    icon: BookOpen    },
    { id: "tutorials",    label: "Tutorials",   icon: GraduationCap },
    { id: "labs",         label: "Labs",        icon: FlaskConical },
    { id: "recordings",   label: "Recordings",  icon: Video       },
    { id: "assignments",  label: "Assignments", icon: ClipboardList },
  ];

  const gradedAssignments = sections.assignments.filter(a => a.status === "graded");
  const avgGrade = gradedAssignments.length
    ? Math.round(gradedAssignments.reduce((s, a) => s + (a.scored / a.points) * 100, 0) / gradedAssignments.length)
    : null;

  return (
    <Layout title={`${course.code} · ${course.title}`}>
      {/* Header banner */}
      <div style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`, borderRadius: "14px", padding: "20px 24px",
        marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ background: `${color}25`, color, fontSize: "11px",
            fontWeight: 700, padding: "3px 10px", borderRadius: "6px" }}>{course.code}</span>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)",
            margin: "8px 0 4px" }}>{course.title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            {course.instructor} · {course.semester}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ textAlign: "center", background: "var(--bg-card)", borderRadius: "10px",
            padding: "12px 18px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>EXAM TYPE</p>
            <p style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 700 }}>{course.examType}</p>
          </div>
          <div style={{ textAlign: "center", background: "var(--bg-card)", borderRadius: "10px",
            padding: "12px 18px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>CURRENT GRADE</p>
            <p style={{ fontSize: "18px", color, fontWeight: 800 }}>{course.overallGrade}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-card)",
        padding: "6px", borderRadius: "12px", border: "1px solid var(--border)", overflowX: "auto" }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
            borderRadius: "8px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
            background: activeTab === id ? color : "transparent",
            color: activeTab === id ? "white" : "var(--text-secondary)",
            fontWeight: activeTab === id ? 700 : 500, fontSize: "13px", transition: "all 0.2s" }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Quick stats */}
          {[
            { label: "Lectures", val: `${sections.lectures.filter(l=>l.viewed).length}/${sections.lectures.length} viewed`, icon: BookOpen, c: color },
            { label: "Labs", val: `${sections.labs.filter(l=>l.completed).length}/${sections.labs.length} done`, icon: FlaskConical, c: "#6e9bd1" },
            { label: "Recordings", val: `${sections.recordings.filter(r=>r.watched).length}/${sections.recordings.length} watched`, icon: Video, c: "#f5a623" },
            { label: "Assignments", val: `${sections.assignments.filter(a=>a.status==="graded").length}/${sections.assignments.length} submitted`, icon: ClipboardList, c: "#e24b4a" },
          ].map(({ label, val, icon: Icon, c }) => (
            <Card key={label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px" }}>
              <div style={{ background: `${c}20`, borderRadius: "10px", padding: "10px" }}>
                <Icon size={22} color={c} />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{val}</p>
              </div>
            </Card>
          ))}

          {/* AI Study Suggestions */}
          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionHeader icon={Brain} label="AI Study Suggestions" color="#1fb6a6" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
              {[
                { tip: "You haven't watched Lecture 3 yet — it's key for the exam", action: "Watch now", tab: "recordings" },
                { tip: "Lab 2 is due soon — AI Skill Builder can guide you step by step", action: "Start lab", tab: "labs" },
                { tip: "Final assignment is active — break it down with AI now", action: "Get help", tab: "assignments" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(31,182,166,0.07)", borderRadius: "10px",
                  padding: "14px", border: "1px solid rgba(31,182,166,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                    <Lightbulb size={14} color="#1fb6a6" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.5 }}>{s.tip}</p>
                  </div>
                  <button onClick={() => setActiveTab(s.tab)} style={{
                    width: "100%", padding: "6px", borderRadius: "6px", border: "none",
                    background: "#1fb6a6", color: "white", fontSize: "11px",
                    fontWeight: 700, cursor: "pointer" }}>{s.action} →</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── LECTURES ─────────────────────────────────────────────────────── */}
      {activeTab === "lectures" && (
        <Card>
          <SectionHeader icon={BookOpen} label="Lecture Slides" color={color} count={sections.lectures.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sections.lectures.map((lec) => (
              <div key={lec.id} style={{ display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border)",
                background: "var(--bg-secondary)", transition: "all 0.15s" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "8px",
                  background: lec.viewed ? `${color}20` : "var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {lec.viewed
                    ? <CheckCircle size={18} color={color} />
                    : <BookOpen size={18} color="var(--text-secondary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                    Week {lec.week}: {lec.title}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{lec.slides} slides</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => navigate(`/courses/${id}/slides/${lec.id}`)} style={{
                    padding: "7px 14px", borderRadius: "7px", border: `1px solid ${color}`,
                    background: "transparent", color, fontWeight: 600, fontSize: "12px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <BookOpen size={13} /> Open Slides
                  </button>
                  <button onClick={() => navigate(`/courses/${id}`)} style={{
                    padding: "7px 14px", borderRadius: "7px", border: "none",
                    background: color, color: "white", fontWeight: 600, fontSize: "12px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Brain size={13} /> Ask AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── TUTORIALS ────────────────────────────────────────────────────── */}
      {activeTab === "tutorials" && (
        <Card>
          <SectionHeader icon={GraduationCap} label="Tutorials" color="#f5a623" count={sections.tutorials.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sections.tutorials.map((tut) => (
              <div key={tut.id} style={{ padding: "16px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                        borderRadius: "4px", background: "rgba(245,166,35,0.15)", color: "#f5a623" }}>
                        Week {tut.week}
                      </span>
                      {tut.completed && <span style={{ fontSize: "10px", fontWeight: 700,
                        color: "#1fb6a6", display: "flex", alignItems: "center", gap: "3px" }}>
                        <CheckCircle size={11} /> Completed
                      </span>}
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{tut.title}</p>
                  </div>
                </div>
                <div style={{ background: "rgba(31,182,166,0.07)", borderRadius: "8px",
                  padding: "10px 12px", marginBottom: "10px", display: "flex", gap: "8px" }}>
                  <Lightbulb size={13} color="#1fb6a6" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{tut.aiHelp}</p>
                </div>
                <button onClick={() => { setSkillBuilderItem(tut); setSkillBuilderType("tutorial"); }} style={{
                  padding: "7px 14px", borderRadius: "7px", border: "none",
                  background: "#f5a623", color: "white", fontWeight: 600, fontSize: "12px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={13} /> AI Skill Builder
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── LABS ─────────────────────────────────────────────────────────── */}
      {activeTab === "labs" && (
        <Card>
          <SectionHeader icon={FlaskConical} label="Lab Sessions" color="#6e9bd1" count={sections.labs.length} />
          {sections.labs.length === 0
            ? <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No lab sessions for this course.</p>
            : <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sections.labs.map((lab) => (
                <div key={lab.id} style={{ padding: "16px", borderRadius: "10px",
                  border: `1px solid ${lab.completed ? "rgba(31,182,166,0.3)" : "var(--border)"}`,
                  background: lab.completed ? "rgba(31,182,166,0.05)" : "var(--bg-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px",
                          borderRadius: "4px", background: "rgba(110,155,209,0.15)", color: "#6e9bd1" }}>
                          Week {lab.week}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Tool: {lab.tool}</span>
                        {lab.completed && <CheckCircle size={13} color="#1fb6a6" />}
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{lab.title}</p>
                    </div>
                  </div>
                  <div style={{ background: "rgba(110,155,209,0.08)", borderRadius: "8px",
                    padding: "10px 12px", marginBottom: "10px", display: "flex", gap: "8px" }}>
                    <Brain size={13} color="#6e9bd1" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{lab.aiHelp}</p>
                  </div>
                  <button onClick={() => { setSkillBuilderItem(lab); setSkillBuilderType("lab"); }} style={{
                    padding: "7px 14px", borderRadius: "7px", border: "none",
                    background: "#6e9bd1", color: "white", fontWeight: 600, fontSize: "12px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Zap size={13} /> AI Lab Guide
                  </button>
                </div>
              ))}
            </div>}
        </Card>
      )}

      {/* ── RECORDINGS ───────────────────────────────────────────────────── */}
      {activeTab === "recordings" && (
        <Card>
          <SectionHeader icon={Video} label="Panopto Recordings" color="#e24b4a" count={sections.recordings.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sections.recordings.map((rec) => (
              <div key={rec.id} style={{ display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border)",
                background: "var(--bg-secondary)" }}>
                <div style={{ width: "52px", height: "40px", borderRadius: "8px",
                  background: rec.watched ? "rgba(226,75,74,0.15)" : "#1a2444",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  border: "1px solid var(--border)" }}>
                  {rec.watched
                    ? <CheckCircle size={18} color="#e24b4a" />
                    : <Play size={18} color="#1fb6a6" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{rec.title}</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={11} />{rec.duration}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Week {rec.week}</span>
                    {rec.watched && <span style={{ fontSize: "11px", color: "#1fb6a6", fontWeight: 600 }}>✓ Watched</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "7px 14px", borderRadius: "7px",
                    border: "1px solid #e24b4a", background: "transparent",
                    color: "#e24b4a", fontWeight: 600, fontSize: "12px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Play size={13} /> Watch
                  </button>
                  <button style={{ padding: "7px 14px", borderRadius: "7px", border: "none",
                    background: "#1fb6a6", color: "white", fontWeight: 600, fontSize: "12px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Brain size={13} /> AI Summary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── ASSIGNMENTS ──────────────────────────────────────────────────── */}
      {activeTab === "assignments" && (
        <Card>
          <SectionHeader icon={ClipboardList} label="Assignments" color="#e24b4a" count={sections.assignments.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sections.assignments.map((asgn) => (
              <div key={asgn.id} style={{ padding: "18px", borderRadius: "12px",
                border: `1px solid ${asgn.status === "active" ? "rgba(31,182,166,0.3)" : "var(--border)"}`,
                background: asgn.status === "active" ? "rgba(31,182,166,0.04)" : "var(--bg-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
                        background: asgn.status === "graded" ? "rgba(31,182,166,0.15)" : asgn.status === "active" ? "rgba(245,166,35,0.15)" : "rgba(110,155,209,0.15)",
                        color: asgn.status === "graded" ? "#1fb6a6" : asgn.status === "active" ? "#f5a623" : "#6e9bd1" }}>
                        {asgn.status === "graded" ? "✓ Graded" : asgn.status === "active" ? "● Active" : "Upcoming"}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Weight: {asgn.weight}</span>
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{asgn.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px",
                      display: "flex", alignItems: "center", gap: "5px" }}>
                      <Calendar size={11} /> Due: {asgn.due}
                    </p>
                  </div>
                  {asgn.status === "graded" && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "26px", fontWeight: 800, color: "#1fb6a6" }}>{asgn.scored}/{asgn.points}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{Math.round((asgn.scored/asgn.points)*100)}%</p>
                    </div>
                  )}
                </div>
                {asgn.status !== "graded" && (
                  <button onClick={() => { setSkillBuilderItem(asgn); setSkillBuilderType("assignment"); }} style={{
                    width: "100%", padding: "10px", borderRadius: "8px", border: "none",
                    background: "linear-gradient(135deg, #1fb6a6, #0f8f82)",
                    color: "white", fontWeight: 700, fontSize: "13px",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "8px" }}>
                    <Zap size={15} /> AI Skill Builder — Step-by-step assignment help
                  </button>
                )}
                {asgn.status === "graded" && (
                  <button style={{ padding: "7px 14px", borderRadius: "7px", border: "1px solid var(--border)",
                    background: "transparent", color: "var(--text-secondary)", fontSize: "12px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Star size={13} /> View feedback
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skill Builder modal */}
      {skillBuilderItem && (
        <SkillBuilder
          item={skillBuilderItem}
          type={skillBuilderType}
          courseColor={color}
          onClose={() => { setSkillBuilderItem(null); setSkillBuilderType(null); }}
        />
      )}
    </Layout>
  );
}
