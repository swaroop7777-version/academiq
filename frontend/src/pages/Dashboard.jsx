import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Brain, BookOpen, FileText, TrendingUp, Clock, ChevronRight, Zap } from "lucide-react";

const courses = [
  { id: 1, code: "COMP516", title: "Research Methods in CS", progress: 65, color: "#1fb6a6", modules: 12 },
  { id: 2, code: "COMP702", title: "MSc Placement Project", progress: 40, color: "#f5a623", modules: 8 },
  { id: 3, code: "ENVS563", title: "Geographic Data Science", progress: 80, color: "#e24b4a", modules: 10 },
];

const stats = [
  { label: "AI Questions Asked", value: "0", icon: Brain, color: "#1fb6a6" },
  { label: "Courses Enrolled", value: "3", icon: BookOpen, color: "#f5a623" },
  { label: "Papers Practised", value: "0", icon: FileText, color: "#e24b4a" },
  { label: "Study Hours", value: "0h", icon: Clock, color: "#6e9bd1" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout title="Dashboard">
      {/* Welcome */}
      <div style={{ background: "linear-gradient(135deg, #0f2744 0%, #1a3d6b 100%)",
        borderRadius: "16px", padding: "28px 32px", marginBottom: "24px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "#1fb6a6", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
            Welcome back 👋
          </p>
          <h2 style={{ color: "white", fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
            {user?.name || "Student"}
          </h2>
          <p style={{ color: "#8aaec4", fontSize: "14px" }}>
            Your AI tutor is ready — ask anything about your courses.
          </p>
        </div>
        <button onClick={() => navigate("/ai-tutor")} style={{
          background: "#1fb6a6", color: "white", border: "none", borderRadius: "12px",
          padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center",
          gap: "8px", fontWeight: 700, fontSize: "14px" }}>
          <Zap size={18} /> Ask AI Tutor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "var(--bg-card)", borderRadius: "12px",
            padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "8px" }}>{label}</p>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
              </div>
              <div style={{ background: `${color}20`, borderRadius: "10px", padding: "10px" }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>My Courses</h3>
          <button onClick={() => navigate("/courses")} style={{
            background: "none", border: "none", color: "#1fb6a6", cursor: "pointer",
            fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {courses.map(c => (
            <div key={c.id} onClick={() => navigate(`/courses/${c.id}`)}
              style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "20px",
                border: "1px solid var(--border)", cursor: "pointer", boxShadow: "var(--shadow)",
                transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ background: `${c.color}20`, color: c.color, fontSize: "11px",
                  fontWeight: 700, padding: "4px 8px", borderRadius: "6px" }}>{c.code}</span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.modules} modules</span>
              </div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", lineHeight: 1.3 }}>
                {c.title}
              </h4>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Progress</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: c.color }}>{c.progress}%</span>
                </div>
                <div style={{ height: "6px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: "99px", transition: "width 0.5s" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI highlight banner */}
      <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "20px 24px",
        border: "1px solid var(--border)", display: "flex", alignItems: "center",
        justifyContent: "space-between", boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "rgba(31,182,166,0.15)", borderRadius: "10px", padding: "10px" }}>
            <TrendingUp size={24} color="#1fb6a6" />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>
              AI Tutor available on every slide and past paper
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px" }}>
              Ask anything — your AI is grounded in your actual course content, not generic knowledge.
            </p>
          </div>
        </div>
        <button onClick={() => navigate("/ai-tutor")} style={{
          background: "#1fb6a6", color: "white", border: "none", borderRadius: "8px",
          padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap" }}>
          Try it now
        </button>
      </div>
    </Layout>
  );
}
