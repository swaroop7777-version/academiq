import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { Send, Brain, User, Loader, Sparkles, AlertCircle } from "lucide-react";
import { getDemoTutorResponse, DEMO_MODE_BANNER } from "../demoData.js";

const suggestions = [
  "Explain the RAG pipeline in simple terms",
  "How does LoRA fine-tuning work?",
  "What is the difference between HPC and GPU?",
  "Summarise the key Canvas limitations",
];

export default function AITutor() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI tutor, grounded in your actual course content. Ask me anything about your lectures, slides, or past papers — I'll give you course-specific answers, not generic ones." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, course: "COMP516", top_k: 5 })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.answer }]);
    } catch (err) {
      // Backend unreachable — fall back to demo mode
      const demo = getDemoTutorResponse(q, "COMP516");
      setMessages(m => [...m, {
        role: "assistant",
        content: demo.answer,
        sources: demo.sources,
        isDemo: true
      }]);
    }
    setLoading(false);
  };

  return (
    <Layout title="AI Tutor">
      <div style={{ display: "flex", height: "calc(100vh - 112px)", gap: "20px" }}>

        {/* Sidebar suggestions */}
        <div style={{ width: "260px", flexShrink: 0 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "12px", padding: "16px",
            border: "1px solid var(--border)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Sparkles size={16} color="#1fb6a6" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Try asking...</span>
            </div>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px",
                border: "1px solid var(--border)", background: "var(--bg-secondary)",
                color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer",
                marginBottom: "6px", lineHeight: 1.4 }}>{s}</button>
            ))}
          </div>
          <div style={{ background: "rgba(31,182,166,0.1)", borderRadius: "12px", padding: "14px",
            border: "1px solid rgba(31,182,166,0.2)" }}>
            <p style={{ fontSize: "12px", color: "#1fb6a6", fontWeight: 600, marginBottom: "6px" }}>🧠 Course-grounded AI</p>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Answers are sourced from your actual course materials — not generic internet knowledge.
            </p>
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-card)",
          borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1fb6a6",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Brain size={16} color="white" />
                  </div>
                )}
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "#1fb6a6" : "var(--bg-secondary)",
                    color: m.role === "user" ? "white" : "var(--text-primary)",
                    fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && m.sources[0] !== "demo-mode" && (
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-secondary)",
                      display: "flex", alignItems: "center", gap: "4px", paddingLeft: "4px" }}>
                      📚 Source: {m.sources.join(", ")}
                    </div>
                  )}
                  {m.isDemo && (
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "#f5a623",
                      display: "flex", alignItems: "center", gap: "4px", paddingLeft: "4px" }}>
                      ⚡ Demo mode — start the Barkla backend for live AI answers
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#0f2744",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={16} color="white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1fb6a6",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Brain size={16} color="white" />
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
                  background: "var(--bg-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Loader size={14} color="#1fb6a6" style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask anything about your course..."
                style={{ flex: 1, padding: "12px 16px", borderRadius: "10px",
                  border: "1px solid var(--border)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "14px", outline: "none" }} />
              <button onClick={() => send()} disabled={!input.trim() || loading} style={{
                padding: "12px 16px", borderRadius: "10px", border: "none",
                background: input.trim() && !loading ? "#1fb6a6" : "var(--border)",
                color: input.trim() && !loading ? "white" : "var(--text-secondary)",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "13px" }}>
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
