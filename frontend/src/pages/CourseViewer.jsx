import BACKEND_URL from "../config.js";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Send, Loader, BookOpen, FlaskConical, Globe, Target,
  X, Sparkles, ArrowRight, Trophy, AlertCircle, Lightbulb, Link
} from "lucide-react";

// ─── Mock course data ──────────────────────────────────────────────────────────
const COURSE_DATA = {
  1: {
    code: "COMP516", title: "Research Methods in CS",
    examType: "Written — essay + short answer",
    examTips: ["Focus on research paradigms", "Know qualitative vs quantitative distinctions", "Cite methodology frameworks by name"],
    repeatedTopics: ["Research design", "Literature review methodology", "Ethics in CS research"],
    slides: [
      {
        id: 1, title: "Introduction to Research Methods",
        topic: "Research Paradigms",
        content: "A research paradigm is a set of common beliefs and agreements shared between scientists about how problems should be understood and addressed. The two dominant paradigms in CS research are Positivism and Interpretivism.",
        image: null,
        topicChain: ["Research Paradigms", "→", "Research Design", "→", "Literature Review", "→", "Data Collection", "→", "Analysis"],
        nextTopics: ["Quantitative Methods (Lecture 3)", "Survey Design (Lecture 4)"],
        labRelevance: "Lab 2: You will apply these paradigms when designing your research instrument. Choosing positivism vs interpretivism directly affects your data collection method.",
        realWorldUseCase: "Tech companies like Google use positivist paradigms (A/B testing, metrics) while UX researchers often use interpretivist approaches (user interviews, ethnography).",
        realWorldVisual: "🔬 Google A/B Tests → Positivist | 🎭 UX Research → Interpretivist",
        examHint: "Frequently asked: 'Compare positivism and interpretivism with examples.' — appeared in 3 of last 5 papers.",
        mathProblem: false,
      },
      {
        id: 2, title: "Quantitative Research Design",
        topic: "Statistical Methods",
        content: "Quantitative research involves the systematic empirical investigation using statistical, mathematical or computational techniques. Key measures include mean, variance, standard deviation and correlation coefficients.",
        image: null,
        topicChain: ["Statistical Measures", "→", "Hypothesis Testing", "→", "p-values", "→", "Significance", "→", "Conclusions"],
        nextTopics: ["Hypothesis Testing (Lecture 4)", "Data Visualisation (Lecture 5)"],
        labRelevance: "Lab 3: Statistical analysis in Python. You will compute mean, std deviation and run t-tests on real datasets using scipy.stats — directly using the formulas from this slide.",
        realWorldUseCase: "Clinical trials use these exact statistical methods to determine if a drug is effective. Netflix uses A/B testing with statistical significance to decide which UI changes to ship.",
        realWorldVisual: "💊 Clinical Trials | 📺 Netflix A/B Testing | 📊 Google Analytics",
        examHint: "MCQ-heavy topic. Expect 4–5 questions on standard deviation, p-values and what statistical significance means.",
        mathProblem: true,
        sampleProblem: "A dataset has values [4, 8, 6, 5, 3, 2, 8, 9, 2, 5]. Calculate the mean, variance and standard deviation.",
        solution: "Mean = (4+8+6+5+3+2+8+9+2+5)/10 = 52/10 = 5.2\nVariance = Σ(x-μ)²/n = [(4-5.2)²+(8-5.2)²+...]/10 = 5.16\nStd Dev = √5.16 ≈ 2.27"
      },
      {
        id: 3, title: "Literature Review Methodology",
        topic: "Systematic Reviews",
        content: "A systematic literature review follows a predefined protocol to identify, appraise and synthesise all relevant research on a given topic. Unlike a traditional narrative review, it is replicable and minimises bias.",
        image: null,
        topicChain: ["Search Strategy", "→", "Inclusion Criteria", "→", "Quality Assessment", "→", "Synthesis", "→", "Reporting"],
        nextTopics: ["Citation Management (Lecture 6)", "Writing Up Findings (Lecture 7)"],
        labRelevance: "Lab 1: Your dissertation literature search uses this exact protocol. The PRISMA flow diagram you will complete in Lab 1 is the standard reporting tool for systematic reviews.",
        realWorldUseCase: "NHS and NICE use systematic reviews to decide which treatments to fund. Meta-analyses in AI research use these methods to compare model performance across papers.",
        realWorldVisual: "🏥 NHS Treatment Decisions | 🤖 AI Benchmark Meta-analyses | 📑 Cochrane Reviews",
        examHint: "Often appears as: 'What are the steps in a systematic review?' — know PRISMA by name.",
        mathProblem: false,
      }
    ]
  }
};

// ─── AI Panel Tab ──────────────────────────────────────────────────────────────
function AIPanel({ slide, courseData, onClose, isExpanded }) {
  const [tab, setTab] = useState("ask");
  const [messages, setMessages] = useState([
    { role: "ai", text: `I'm your AI tutor for **${slide.topic}**. I can explain this slide, solve problems step by step, or tell you how this connects to your exam and lab work. What would you like?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [solveMode, setSolveMode] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);

    // Augment question with slide context for better retrieval
    const contextualQ = `[Slide: ${slide.title} | Topic: ${slide.topic}] ${q}`;

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: contextualQ, course: courseData.code, top_k: 4 })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setMessages(m => [...m, { role: "ai", text: data.answer }]);
    } catch (err) {
      // Fallback to local knowledge if backend unreachable
      let reply = "";
      if (slide.mathProblem && (q.toLowerCase().includes("solve") || q.toLowerCase().includes("step"))) {
        reply = `**Step-by-step solution:**\n\n${slide.solution}\n\n✅ Always show your working — partial marks are awarded even if the final answer is wrong.`;
      } else if (q.toLowerCase().includes("exam") || q.toLowerCase().includes("tip")) {
        reply = `**Exam insight for ${slide.topic}:**\n\n${slide.examHint}`;
      } else if (q.toLowerCase().includes("lab")) {
        reply = `**Lab connection:**\n\n${slide.labRelevance}`;
      } else {
        reply = `**${slide.topic}:**\n\n${slide.content}\n\n⚠️ AI backend offline — showing cached content.`;
      }
      setMessages(m => [...m, { role: "ai", text: reply }]);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "ask", label: "Ask AI", icon: Brain },
    { id: "chain", label: "Topic Flow", icon: Link },
    { id: "exam", label: "Exam Intel", icon: Trophy },
    { id: "lab", label: "Lab + World", icon: Globe },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0 }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "10px 4px", border: "none", cursor: "pointer", fontSize: "11px",
            fontWeight: tab === id ? 700 : 500, background: "transparent",
            color: tab === id ? "#1fb6a6" : "var(--text-secondary)",
            borderBottom: tab === id ? "2px solid #1fb6a6" : "2px solid transparent",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", transition: "all 0.15s"
          }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>

        {/* ASK AI */}
        {tab === "ask" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {slide.mathProblem && (
              <div style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)",
                borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <Target size={14} color="#f5a623" />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623" }}>Practice Problem</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "8px" }}>{slide.sampleProblem}</p>
                <button onClick={() => send("Solve this step by step")} style={{
                  background: "#f5a623", color: "white", border: "none", borderRadius: "6px",
                  padding: "6px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                  Solve step by step →
                </button>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "90%", padding: "10px 12px", borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    background: m.role === "user" ? "#1fb6a6" : "var(--bg-secondary)",
                    color: m.role === "user" ? "white" : "var(--text-primary)",
                    fontSize: "12.5px", lineHeight: 1.6, whiteSpace: "pre-wrap"
                  }}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "8px 12px",
                  background: "var(--bg-secondary)", borderRadius: "12px", width: "fit-content" }}>
                  <Loader size={12} color="#1fb6a6" />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Thinking...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
              {["Explain this slide", "Exam tips for this topic", "Lab connection", "Real world use"].map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderRadius: "20px", padding: "4px 10px", fontSize: "11px",
                  color: "var(--text-secondary)", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Ask about this slide..." style={{
                  flex: 1, padding: "9px 12px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "13px", outline: "none" }} />
              <button onClick={() => send()} disabled={!input.trim() || loading} style={{
                padding: "9px 12px", borderRadius: "8px", border: "none",
                background: "#1fb6a6", color: "white", cursor: "pointer", display: "flex" }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TOPIC CHAIN */}
        {tab === "chain" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <Link size={14} color="#1fb6a6" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Topic Learning Flow</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                {slide.topicChain.map((t, i) => (
                  <span key={i} style={{
                    padding: t === "→" ? "0" : "4px 10px",
                    borderRadius: "20px", fontSize: "11px", fontWeight: t === "→" ? 400 : 600,
                    background: t === "→" ? "transparent" : i === 0 ? "#1fb6a6" : "var(--bg-secondary)",
                    color: t === "→" ? "var(--text-secondary)" : i === 0 ? "white" : "var(--text-primary)",
                    border: t === "→" ? "none" : "1px solid var(--border)"
                  }}>{t}</span>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px" }}>
                You are currently on: <strong style={{ color: "#1fb6a6" }}>{slide.topic}</strong>
              </p>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <ArrowRight size={14} color="#f5a623" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Coming Up Next</span>
              </div>
              {slide.nextTopics.map((t, i) => (
                <div key={i} style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
                  borderRadius: "8px", padding: "8px 12px", marginBottom: "6px",
                  fontSize: "12px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ArrowRight size={12} color="#f5a623" />{t}
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(31,182,166,0.08)", borderRadius: "10px", padding: "12px",
              border: "1px solid rgba(31,182,166,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Lightbulb size={13} color="#1fb6a6" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1fb6a6" }}>AI Study Tip</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Master this topic before moving to the next — each topic in this chain builds directly on the previous one. Gaps here create confusion 2–3 lectures ahead.
              </p>
            </div>
          </div>
        )}

        {/* EXAM INTEL */}
        {tab === "exam" && (
          <div>
            <div style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)",
              borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <AlertCircle size={14} color="#e24b4a" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#e24b4a" }}>Exam Format</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{courseData.examType}</p>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Trophy size={14} color="#f5a623" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>This Slide in the Exam</span>
              </div>
              <div style={{ background: "rgba(245,166,35,0.08)", borderRadius: "10px", padding: "12px",
                border: "1px solid rgba(245,166,35,0.2)", fontSize: "12.5px",
                color: "var(--text-primary)", lineHeight: 1.6 }}>{slide.examHint}</div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Target size={14} color="#1fb6a6" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Repeated Topics (All Years)</span>
              </div>
              {courseData.repeatedTopics.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px",
                  padding: "7px 10px", borderRadius: "7px", marginBottom: "5px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1fb6a6", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{t}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Sparkles size={14} color="#6e9bd1" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Preparation Tips</span>
              </div>
              {courseData.examTips.map((t, i) => (
                <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px",
                  paddingLeft: "12px", borderLeft: "2px solid #6e9bd1", lineHeight: 1.5 }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* LAB + WORLD */}
        {tab === "lab" && (
          <div>
            <div style={{ background: "rgba(110,155,209,0.08)", border: "1px solid rgba(110,155,209,0.2)",
              borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <FlaskConical size={14} color="#6e9bd1" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#6e9bd1" }}>Lab Relevance</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-primary)", lineHeight: 1.6 }}>{slide.labRelevance}</p>
            </div>
            <div style={{ background: "rgba(31,182,166,0.08)", border: "1px solid rgba(31,182,166,0.2)",
              borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Globe size={14} color="#1fb6a6" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1fb6a6" }}>Real World Use Case</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-primary)", lineHeight: 1.6, marginBottom: "10px" }}>{slide.realWorldUseCase}</p>
              <div style={{ background: "var(--bg-secondary)", borderRadius: "8px", padding: "10px",
                fontSize: "13px", textAlign: "center", border: "1px solid var(--border)" }}>
                {slide.realWorldVisual}
              </div>
            </div>
            <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: "10px", padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Lightbulb size={13} color="#f5a623" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#f5a623" }}>Why this matters for your career</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Understanding {slide.topic} gives you the vocabulary to discuss research and data decisions in job interviews — especially in data science, product, and engineering roles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Slide Viewer ─────────────────────────────────────────────────────────
export default function CourseViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = COURSE_DATA[id] || COURSE_DATA[1];
  const [slideIdx, setSlideIdx] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const slide = course.slides[slideIdx];

  const toggleFullscreen = () => {
    setFullscreen(f => !f);
    if (!fullscreen) setPanelOpen(false);
    else setTimeout(() => setPanelOpen(true), 400);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#0a0f1e", overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ height: "52px", background: "#0f2744", display: "flex",
        alignItems: "center", justifyContent: "space-between", padding: "0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/courses")} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "6px",
            padding: "6px 10px", color: "#8aaec4", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
            <ChevronLeft size={14} /> Back
          </button>
          <div>
            <span style={{ color: "#1fb6a6", fontSize: "11px", fontWeight: 700 }}>{course.code}</span>
            <span style={{ color: "white", fontSize: "13px", fontWeight: 600, marginLeft: "8px" }}>{slide.title}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#8aaec4", fontSize: "12px" }}>{slideIdx + 1} / {course.slides.length}</span>
          <button onClick={() => setPanelOpen(p => !p)} style={{
            background: panelOpen ? "rgba(31,182,166,0.2)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${panelOpen ? "#1fb6a6" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "6px", padding: "6px 10px", color: panelOpen ? "#1fb6a6" : "#8aaec4",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
            <Brain size={14} /> AI Panel
          </button>
          <button onClick={toggleFullscreen} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "6px", padding: "6px 10px", color: "#8aaec4",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {fullscreen ? "Exit Full" : "Full Screen"}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Slide area */}
        <div style={{
          transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          width: panelOpen && !fullscreen ? "70%" : "100%",
          position: "relative", display: "flex", alignItems: "center",
          justifyContent: "center", background: "#0a0f1e", padding: "24px"
        }}>
          {/* Slide card */}
          <div style={{
            width: "100%", maxWidth: "900px", background: "#1a2444",
            borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            minHeight: "460px", display: "flex", flexDirection: "column"
          }}>
            {/* Slide header */}
            <div style={{ background: "#0f2744", padding: "20px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ background: "rgba(31,182,166,0.2)", color: "#1fb6a6", fontSize: "11px",
                  fontWeight: 700, padding: "3px 8px", borderRadius: "4px" }}>{course.code}</span>
                <span style={{ color: "#8aaec4", fontSize: "11px" }}>Slide {slideIdx + 1}</span>
              </div>
              <h2 style={{ color: "white", fontSize: "22px", fontWeight: 800 }}>{slide.title}</h2>
              <p style={{ color: "#1fb6a6", fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>Topic: {slide.topic}</p>
            </div>

            {/* Slide body */}
            <div style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{ color: "#c8dce9", fontSize: "16px", lineHeight: 1.75 }}>{slide.content}</p>

              {slide.mathProblem && (
                <div style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)",
                  borderRadius: "12px", padding: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                    <Target size={16} color="#f5a623" />
                    <span style={{ color: "#f5a623", fontWeight: 700, fontSize: "13px" }}>Practice Problem</span>
                  </div>
                  <p style={{ color: "white", fontSize: "14px", lineHeight: 1.6 }}>{slide.sampleProblem}</p>
                </div>
              )}

              {/* Topic pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                {slide.topicChain.filter(t => t !== "→").map((t, i) => (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                    background: i === 0 ? "rgba(31,182,166,0.2)" : "rgba(255,255,255,0.06)",
                    color: i === 0 ? "#1fb6a6" : "#8aaec4",
                    border: `1px solid ${i === 0 ? "rgba(31,182,166,0.3)" : "rgba(255,255,255,0.08)"}`
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
              background: slideIdx === 0 ? "rgba(255,255,255,0.04)" : "rgba(31,182,166,0.2)",
              border: "1px solid rgba(31,182,166,0.3)", borderRadius: "50%", width: "44px", height: "44px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: slideIdx === 0 ? "not-allowed" : "pointer", color: slideIdx === 0 ? "#333" : "#1fb6a6",
              transition: "all 0.2s" }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setSlideIdx(i => Math.min(course.slides.length - 1, i + 1))}
            disabled={slideIdx === course.slides.length - 1}
            style={{ position: "absolute", right: panelOpen && !fullscreen ? "calc(30% + 12px)" : "12px",
              top: "50%", transform: "translateY(-50%)",
              background: slideIdx === course.slides.length - 1 ? "rgba(255,255,255,0.04)" : "rgba(31,182,166,0.2)",
              border: "1px solid rgba(31,182,166,0.3)", borderRadius: "50%", width: "44px", height: "44px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: slideIdx === course.slides.length - 1 ? "not-allowed" : "pointer",
              color: slideIdx === course.slides.length - 1 ? "#333" : "#1fb6a6",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
            <ChevronRight size={20} />
          </button>

          {/* Slide dots */}
          <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: "6px" }}>
            {course.slides.map((_, i) => (
              <button key={i} onClick={() => setSlideIdx(i)} style={{
                width: i === slideIdx ? "20px" : "8px", height: "8px",
                borderRadius: "4px", border: "none", cursor: "pointer",
                background: i === slideIdx ? "#1fb6a6" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", padding: 0
              }} />
            ))}
          </div>
        </div>

        {/* AI Panel */}
        <div style={{
          width: panelOpen && !fullscreen ? "30%" : "0%",
          overflow: "hidden",
          transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0
        }}>
          <div style={{ width: "calc(30vw)", height: "100%", minWidth: "280px" }}>
            <AIPanel slide={slide} courseData={course} isExpanded={panelOpen} />
          </div>
        </div>
      </div>

      {/* Bottom slide bar */}
      <div style={{ height: "60px", background: "#0f2744", borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: "8px", padding: "0 16px",
        overflowX: "auto", flexShrink: 0 }}>
        {course.slides.map((s, i) => (
          <button key={i} onClick={() => setSlideIdx(i)} style={{
            flexShrink: 0, padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: i === slideIdx ? "rgba(31,182,166,0.25)" : "rgba(255,255,255,0.06)",
            color: i === slideIdx ? "#1fb6a6" : "#8aaec4",
            borderLeft: i === slideIdx ? "3px solid #1fb6a6" : "3px solid transparent",
            fontSize: "12px", fontWeight: i === slideIdx ? 700 : 400,
            transition: "all 0.2s", textAlign: "left", maxWidth: "150px", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
