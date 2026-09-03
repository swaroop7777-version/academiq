import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GraduationCap, Eye, EyeOff, Sun, Moon } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Demo login — replace with real API call when backend is ready
    await new Promise(r => setTimeout(r, 800));
    if (form.email && form.password.length >= 4) {
      const fakeToken = btoa(JSON.stringify({ email: form.email, exp: Date.now() + 86400000 }));
      login({ name: form.email.split("@")[0], email: form.email, role: "Student" }, fakeToken);
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position: "fixed", top: "20px", right: "20px",
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px",
        padding: "8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "#0f2744", borderRadius: "16px", padding: "14px", marginBottom: "16px" }}>
            <GraduationCap size={32} color="#1fb6a6" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            AcademIQ
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            AI-powered learning — smarter than Canvas
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "32px",
          border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600,
                color: "var(--text-primary)", marginBottom: "6px" }}>Email</label>
              <input type="email" value={form.email} required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@liverpool.ac.uk"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "var(--bg-secondary)",
                  color: "var(--text-primary)", fontSize: "14px", outline: "none" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600,
                color: "var(--text-primary)", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={form.password} required
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px",
                    border: "1px solid var(--border)", background: "var(--bg-secondary)",
                    color: "var(--text-primary)", fontSize: "14px", outline: "none" }} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)",
                borderRadius: "8px", padding: "10px 14px", color: "#e24b4a",
                fontSize: "13px", marginBottom: "16px" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: "8px", border: "none",
              background: loading ? "#999" : "#1fb6a6", color: "white", fontSize: "15px",
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--text-secondary)" }}>
          University of Liverpool · MSc Dissertation Project
        </p>
      </div>
    </div>
  );
}
