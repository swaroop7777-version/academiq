import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { getDemoSolveResponse } from "../demoData.js";
import {
  ChevronLeft, ChevronRight, FileText, Type, Brain, Send, Loader,
  Sparkles, Target, Globe, Lightbulb, X, BookOpen, Maximize2, Minimize2,
  Zap, GraduationCap
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

import { apiFetch } from "../config.js";
import BACKEND_URL from "../config.js";

export default function DocumentViewer() {
  const { course, filename } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("pdf"); // pdf | text
  const [numPages, setNumPages] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [textPages, setTextPages] = useState([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [scale, setScale] = useState(1.2);

  // AI panel state
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("solve");
  const [showTease, setShowTease] = useState(false);
  const [teasePos, setTeasePos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");

  const pdfUrl = {
    url: `${BACKEND_URL}/pdf/${course}/${encodeURIComponent(filename)}`,
    httpHeaders: { "ngrok-skip-browser-warning": "true" }
  };
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Load text version
  useEffect(() => {
    if (viewMode === "text" && textPages.length === 0) {
      apiFetch(`/pdf-text/${course}/${encodeURIComponent(filename)}`)
        .then(r => r.json())
        .then(d => setTextPages(d.pages || []))
        .catch(() => setTextPages([{ page: 1, text: "Could not load text. Make sure the API is running." }]));
    }
  }, [viewMode, course, filename, textPages.length]);

  // Handle text selection → show tease popup
  const handleMouseUp = (e) => {
    const sel = window.getSelection().toString().trim();
    if (sel.length > 10) {
      setSelectedText(sel);
      setTeasePos({ x: e.clientX, y: e.clientY });
      setShowTease(true);
    } else {
      setShowTease(false);
    }
  };

  const askAI = async (text, selectedMode) => {
    const q = text || question.trim();
    if (!q) return;
    setShowTease(false);
    setPanelOpen(true);
    setQuestion("");
    const useMode = selectedMode || mode;
    setMessages(m => [...m, { role: "user", text: q, mode: useMode }]);
    setLoading(true);
    try {
      const res = await apiFetch(`/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, course, mode: useMode })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setMessages(m => [...m, { role: "ai", text: data.answer, mode: useMode, sources: data.sources }]);
    } catch (err) {
      const demo = getDemoSolveResponse(selectedMode || mode);
      setMessages(m => [...m, { role: "ai", text: demo.answer, isDemo: true }]);
    }
    setLoading(false);
  };

  const modeButtons = [
    { id: "solve", label: "Solve step-by-step", icon: Target, color: "#1fb6a6" },
    { id: "realworld", label: "Real-world use", icon: Globe, color: "#f5a623" },
    { id: "explain", label: "Explain simply", icon: Lightbulb, color: "#6e9bd1" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0f1e", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ height: "54px", background: "#0f2744", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate(`/courses/${course === "COMP516" ? 1 : 2}`)} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "6px", padding: "6px 10px",
            color: "#8aaec4", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
            <ChevronLeft size={14} /> Back
          </button>
          <span style={{ color: "#1fb6a6", fontSize: "12px", fontWeight: 700 }}>{course}</span>
          <span style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{decodeURIComponent(filename)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* View toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "3px" }}>
            <button onClick={() => setViewMode("pdf")} style={{
              padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
              background: viewMode === "pdf" ? "#1fb6a6" : "transparent",
              color: viewMode === "pdf" ? "white" : "#8aaec4", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
              <FileText size={13} /> PDF
            </button>
            <button onClick={() => setViewMode("text")} style={{
              padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
              background: viewMode === "text" ? "#1fb6a6" : "transparent",
              color: viewMode === "text" ? "white" : "#8aaec4", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
              <Type size={13} /> Text
            </button>
          </div>
          <button onClick={() => setPanelOpen(p => !p)} style={{
            background: panelOpen ? "rgba(31,182,166,0.2)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${panelOpen ? "#1fb6a6" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "6px", padding: "6px 10px", color: panelOpen ? "#1fb6a6" : "#8aaec4",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
            <Brain size={14} /> AI Panel
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Document area — 70% */}
        <div onMouseUp={handleMouseUp} style={{
          width: panelOpen ? "70%" : "100%",
          transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto", background: "#12182b", padding: "20px",
          display: "flex", flexDirection: "column", alignItems: "center" }}>

          {viewMode === "pdf" ? (
            <>
              <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div style={{ color: "#8aaec4", padding: "40px" }}>Loading PDF...</div>}
                error={<div style={{ color: "#e24b4a", padding: "40px" }}>Could not load PDF. Ensure API + tunnel are running.</div>}>
                <div style={{ background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                  <Page pageNumber={pageNum} scale={scale} renderTextLayer={true} renderAnnotationLayer={false} />
                </div>
              </Document>

              {/* Page controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px",
                background: "#0f2744", padding: "8px 16px", borderRadius: "10px" }}>
                <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1}
                  style={{ background: "rgba(31,182,166,0.2)", border: "none", borderRadius: "6px", padding: "6px 12px",
                    color: pageNum <= 1 ? "#444" : "#1fb6a6", cursor: pageNum <= 1 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ color: "white", fontSize: "13px" }}>Page {pageNum} of {numPages || "?"}</span>
                <button onClick={() => setPageNum(p => Math.min(numPages, p + 1))} disabled={pageNum >= numPages}
                  style={{ background: "rgba(31,182,166,0.2)", border: "none", borderRadius: "6px", padding: "6px 12px",
                    color: pageNum >= numPages ? "#444" : "#1fb6a6", cursor: pageNum >= numPages ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
                  Next <ChevronRight size={14} />
                </button>
                <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.15)" }} />
                <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} style={{
                  background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "6px", padding: "6px 10px",
                  color: "#8aaec4", cursor: "pointer", fontSize: "13px" }}>−</button>
                <span style={{ color: "#8aaec4", fontSize: "12px" }}>{Math.round(scale * 83)}%</span>
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} style={{
                  background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "6px", padding: "6px 10px",
                  color: "#8aaec4", cursor: "pointer", fontSize: "13px" }}>+</button>
              </div>
              <p style={{ color: "#5a6b80", fontSize: "12px", marginTop: "12px", textAlign: "center" }}>
                💡 Select any text on the document to get instant AI help
              </p>
            </>
          ) : (
            // Text view
            <div style={{ maxWidth: "800px", width: "100%", background: "white", borderRadius: "8px",
              padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: "#1a1a1a", lineHeight: 1.8 }}>
              {textPages.length === 0 ? (
                <div style={{ color: "#666" }}>Loading text...</div>
              ) : (
                textPages.map(p => (
                  <div key={p.page} style={{ marginBottom: "32px" }}>
                    <div style={{ fontSize: "11px", color: "#999", fontWeight: 700, marginBottom: "8px",
                      textTransform: "uppercase", letterSpacing: "0.05em" }}>Page {p.page}</div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{p.text}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* AI Panel — 30% */}
        <div style={{
          width: panelOpen ? "30%" : "0%",
          transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden", borderLeft: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <div style={{ width: "30vw", minWidth: "320px", height: "100%", display: "flex", flexDirection: "column",
            background: "#1a2e4a" }}>

            {/* Panel header */}
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, #1fb6a6, #0f8f82)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap size={20} color="white" />
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>AI Learning Assistant</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>Select text or paste a question</div>
                </div>
              </div>
            </div>

            {/* Mode selector */}
            <div style={{ display: "flex", gap: "4px", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {modeButtons.map(({ id, label, icon: Icon, color }) => (
                <button key={id} onClick={() => setMode(id)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: mode === id ? color : "rgba(255,255,255,0.05)",
                  color: mode === id ? "white" : "#8aaec4", fontSize: "10px", fontWeight: 600,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 16px", color: "#8aaec4" }}>
                  <Sparkles size={28} color="#1fb6a6" style={{ marginBottom: "12px" }} />
                  <p style={{ fontSize: "13px", lineHeight: 1.6 }}>
                    Highlight any text on the document, or paste a question below.
                    I'll solve it step-by-step, show real-world uses, or explain it simply.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "92%", padding: "10px 13px",
                    borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    background: m.role === "user" ? "#1fb6a6" : "rgba(255,255,255,0.1)",
                    color: m.role === "user" ? "#ffffff" : "#e8edf5", fontSize: "12.5px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {m.text}
                    {m.sources && m.sources.length > 0 && (
                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "10px", color: "#8aaec4" }}>
                        📚 {m.sources.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "10px 13px",
                  background: "rgba(255,255,255,0.06)", borderRadius: "12px", width: "fit-content" }}>
                  <Loader size={13} color="#1fb6a6" /> <span style={{ fontSize: "12px", color: "#8aaec4" }}>Thinking...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={question} onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askAI()}
                  placeholder="Paste a question..." style={{
                    flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)", color: "#e8edf5", fontSize: "13px", outline: "none" }} />
                <button onClick={() => askAI()} disabled={!question.trim() || loading} style={{
                  padding: "10px 13px", borderRadius: "8px", border: "none",
                  background: question.trim() && !loading ? "#1fb6a6" : "rgba(255,255,255,0.1)",
                  color: "white", cursor: question.trim() && !loading ? "pointer" : "not-allowed", display: "flex" }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Text selection tease popup */}
        {showTease && (
          <div style={{ position: "fixed", left: Math.min(teasePos.x, window.innerWidth - 280),
            top: teasePos.y + 12, zIndex: 1000, background: "#0f2744",
            border: "1px solid #1fb6a6", borderRadius: "12px", padding: "12px", width: "260px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#1fb6a6", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                <Zap size={13} /> Learn this with AI
              </span>
              <button onClick={() => setShowTease(false)} style={{ background: "none", border: "none", color: "#8aaec4", cursor: "pointer" }}>
                <X size={14} />
              </button>
            </div>
            <p style={{ color: "#c8dce9", fontSize: "11px", lineHeight: 1.4, marginBottom: "10px",
              maxHeight: "48px", overflow: "hidden" }}>"{selectedText.slice(0, 90)}{selectedText.length > 90 ? "..." : ""}"</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <button onClick={() => askAI(selectedText, "solve")} style={{
                padding: "7px", borderRadius: "6px", border: "none", background: "#1fb6a6", color: "white",
                fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                <Target size={12} /> Solve step-by-step
              </button>
              <button onClick={() => askAI(selectedText, "realworld")} style={{
                padding: "7px", borderRadius: "6px", border: "none", background: "#f5a623", color: "white",
                fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                <Globe size={12} /> How is this used in the real world?
              </button>
              <button onClick={() => askAI(selectedText, "explain")} style={{
                padding: "7px", borderRadius: "6px", border: "none", background: "#6e9bd1", color: "white",
                fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                <Lightbulb size={12} /> Explain simply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
