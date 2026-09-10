import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { FileText, Brain, Loader, FolderOpen } from "lucide-react";

import { apiFetch } from "../config.js";

const COURSES = [
  { code: "COMP516", title: "Research Methods in CS", color: "#1fb6a6" },
  { code: "COMP315", title: "Cloud Computing", color: "#f5a623" },
];

export default function Documents() {
  const navigate = useNavigate();
  const [course, setCourse] = useState("COMP315");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/documents/${course}`)
      .then(r => r.json())
      .then(d => { setDocs(d.documents || []); setLoading(false); })
      .catch(() => { setDocs([]); setLoading(false); });
  }, [course]);

  const activeCourse = COURSES.find(c => c.code === course);

  return (
    <Layout title="Course Documents">
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {COURSES.map(c => (
          <button key={c.code} onClick={() => setCourse(c.code)} style={{
            padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px",
            background: course === c.code ? c.color : "var(--bg-card)",
            color: course === c.code ? "white" : "var(--text-secondary)",
            border: `1px solid ${course === c.code ? c.color : "var(--border)"}` }}>
            {c.code} · {c.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)", padding: "40px" }}>
          <Loader size={18} /> Loading documents from backend...
        </div>
      ) : docs.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <FolderOpen size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
          <p>No documents found. Make sure the API and SSH tunnel are running.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {docs.map(doc => (
            <div key={doc} onClick={() => navigate(`/view/${course}/${encodeURIComponent(doc)}`)}
              style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "18px",
                border: "1px solid var(--border)", cursor: "pointer", boxShadow: "var(--shadow)",
                transition: "transform 0.15s", display: "flex", flexDirection: "column", gap: "12px" }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform = "none"}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: `${activeCourse.color}20`, borderRadius: "8px", padding: "8px" }}>
                  <FileText size={20} color={activeCourse.color} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                  {doc.replace(/\.pdf$/i, "")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: activeCourse.color,
                fontSize: "12px", fontWeight: 600 }}>
                <Brain size={13} /> Open with AI assistant →
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
