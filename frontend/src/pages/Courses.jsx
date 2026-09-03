import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { BookOpen, Brain, ChevronRight } from "lucide-react";

const courses = [
  { id: 1, code: "COMP516", title: "Research Methods in CS", instructor: "Prof. Phil Jimmieson", progress: 65, color: "#1fb6a6", modules: 12, description: "Research methodology, literature review, and academic writing for computer scientists." },
  { id: 2, code: "COMP702", title: "MSc Placement Project", instructor: "Prof. Phil Jimmieson", progress: 40, color: "#f5a623", modules: 8, description: "Industry placement project with academic supervision and professional development." },
  { id: 3, code: "ENVS563", title: "Geographic Data Science", instructor: "Dr. Dani Arribas-Bel", progress: 80, color: "#e24b4a", modules: 10, description: "Spatial data analysis, programmatic mapping, and geographic visualisation using Python." },
];

export default function Courses() {
  const navigate = useNavigate();
  return (
    <Layout title="My Courses">
      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{courses.length} courses enrolled this semester</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
        {courses.map(c => (
          <div key={c.id} style={{ background: "var(--bg-card)", borderRadius: "14px",
            border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            <div style={{ height: "6px", background: c.color }} />
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ background: `${c.color}20`, color: c.color, fontSize: "11px",
                  fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>{c.code}</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.modules} modules</span>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{c.title}</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>{c.instructor}</p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.5 }}>{c.description}</p>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Progress</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: c.color }}>{c.progress}%</span>
                </div>
                <div style={{ height: "6px", background: "var(--border)", borderRadius: "99px" }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: "99px" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => navigate(`/courses/${c.id}`)} style={{
                  flex: 1, padding: "9px", borderRadius: "8px", border: `1px solid ${c.color}`,
                  background: "transparent", color: c.color, fontWeight: 600, fontSize: "13px",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <BookOpen size={14} /> Open Course
                </button>
                <button onClick={() => navigate("/ai-tutor")} style={{
                  flex: 1, padding: "9px", borderRadius: "8px", border: "none",
                  background: c.color, color: "white", fontWeight: 600, fontSize: "13px",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Brain size={14} /> Ask AI
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
