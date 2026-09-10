import { useState } from "react";
import Layout from "../components/Layout";
import { getDemoSolveResponse } from "../demoData.js";
import {
  FileText, Brain, ChevronRight, Loader, CheckCircle,
  Target, BookOpen, Sparkles, ArrowRight, Award, Clock
} from "lucide-react";

// Mock past papers — questions can be real from your uploaded exams
const PAPERS = {
  COMP516: {
    code: "COMP516", color: "#1fb6a6", title: "Research Methods in CS",
    papers: [
      {
        id: 1, year: "2025", type: "Mock Exam", questions: [
          { id: 1, q: "Explain the difference between positivism and interpretivism as research paradigms. Give an example of each.", marks: 10 },
          { id: 2, q: "What is a systematic literature review and how does it differ from a narrative review?", marks: 8 },
          { id: 3, q: "Describe the key ethical considerations when conducting research involving human participants.", marks: 12 },
        ]
      },
      {
        id: 2, year: "2025", type: "Final Exam", questions: [
          { id: 1, q: "Discuss the role of hypothesis testing in quantitative research. What is a p-value?", marks: 10 },
          { id: 2, q: "How do you formulate a good research question? What makes a research question testable?", marks: 10 },
        ]
      }
    ]
  },
  COMP315: {
    code: "COMP315", color: "#f5a623", title: "Cloud Computing",
    papers: [
      {
        id: 1, year: "2026", type: "Mock Exam", questions: [
          { id: 1, q: "What is Kubernetes and what problem does it solve in cloud computing?", marks: 10 },
          { id: 2, q: "Explain the concept of Infrastructure as Code and give an example tool.", marks: 8 },
          { id: 3, q: "Compare Platform as a Service (PaaS) with Infrastructure as a Service (IaaS).", marks: 12 },
        ]
      }
    ]
  }
};

const API_URL = "http://localhost:8000";

export default function PastPapers() {
  const [selectedCourse, setSelectedCourse] = useState("COMP516");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [solving, setSolving] = useState(null); // question id currently solving
  const [solutions, setSolutions] = useState({}); // {questionId: solutionText}

  const course = PAPERS[selectedCourse];

  const solveQuestion = async (question) => {
    setSolving(question.id);
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `This is an exam question worth ${question.marks} marks. Provide a clear, step-by-step model answer suitable for a student revising. Question: ${question.q}`,
          course: selectedCourse,
          top_k: 5
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setSolutions(s => ({ ...s, [question.id]: data.answer }));
    } catch (err) {
      const demo = getDemoSolveResponse("solve");
      setSolutions(s => ({ ...s, [question.id]: demo.answer + "\n\n⚡ Demo mode — start the Barkla backend for live AI answers grounded in your real lectures." }));
    }
    setSolving(null);
  };

  return (
    <Layout title="Past Papers & Model Solver">
      {/* Course selector */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {Object.keys(PAPERS).map(code => (
          <button key={code} onClick={() => { setSelectedCourse(code); setSelectedPaper(null); setSolutions({}); }}
            style={{
              padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: selectedCourse === code ? PAPERS[code].color : "var(--bg-card)",
              color: selectedCourse === code ? "white" : "var(--text-secondary)",
              fontWeight: 700, fontSize: "14px", border: `1px solid ${selectedCourse === code ? PAPERS[code].color : "var(--border)"}`,
              transition: "all 0.2s" }}>
            {code} · {PAPERS[code].title}
          </button>
        ))}
      </div>

      {!selectedPaper ? (
        // Paper list
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: `${course.color}20`, borderRadius: "8px", padding: "8px" }}>
              <FileText size={20} color={course.color} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Available Past Papers</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {course.papers.map(paper => (
              <div key={paper.id} onClick={() => setSelectedPaper(paper)}
                style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "20px",
                  border: "1px solid var(--border)", cursor: "pointer", boxShadow: "var(--shadow)",
                  transition: "transform 0.15s" }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span style={{ background: `${course.color}20`, color: course.color, fontSize: "11px",
                    fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>{paper.year}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{paper.questions.length} questions</span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  {paper.type}
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  {paper.questions.reduce((s, q) => s + q.marks, 0)} marks total · AI step-by-step solutions available
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: course.color, fontSize: "13px", fontWeight: 600 }}>
                  Open paper <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Question solver view
        <div>
          <button onClick={() => setSelectedPaper(null)} style={{
            display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", marginBottom: "16px" }}>
            <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to papers
          </button>

          <div style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}08)`,
            border: `1px solid ${course.color}30`, borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
              {course.code} {selectedPaper.year} {selectedPaper.type}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Click "Solve with AI" on any question for a step-by-step model answer grounded in your course material.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {selectedPaper.questions.map((question, i) => (
              <div key={question.id} style={{ background: "var(--bg-card)", borderRadius: "12px",
                border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                {/* Question header */}
                <div style={{ padding: "18px 20px", borderBottom: solutions[question.id] ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ background: course.color, color: "white", fontSize: "11px",
                          fontWeight: 700, padding: "3px 10px", borderRadius: "6px" }}>Q{i + 1}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Award size={12} /> {question.marks} marks
                        </span>
                      </div>
                      <p style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
                        {question.q}
                      </p>
                    </div>
                    <button onClick={() => solveQuestion(question)} disabled={solving === question.id}
                      style={{ padding: "10px 16px", borderRadius: "8px", border: "none",
                        background: solving === question.id ? "var(--border)" : course.color,
                        color: "white", fontWeight: 700, fontSize: "13px", cursor: solving === question.id ? "wait" : "pointer",
                        display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {solving === question.id
                        ? <><Loader size={14} /> Solving...</>
                        : solutions[question.id]
                          ? <><CheckCircle size={14} /> Re-solve</>
                          : <><Brain size={14} /> Solve with AI</>}
                    </button>
                  </div>
                </div>

                {/* Solution */}
                {solutions[question.id] && (
                  <div style={{ padding: "18px 20px", background: "var(--bg-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Sparkles size={15} color={course.color} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: course.color }}>
                        AI Model Answer — grounded in course content
                      </span>
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {solutions[question.id]}
                    </div>
                    <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: "6px" }}>
                      <BookOpen size={12} color="var(--text-secondary)" />
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        Answer generated by Mistral 7B from real {course.code} lecture material
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
