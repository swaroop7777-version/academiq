import { Sun, Moon, Bell, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header style={{
      height: "64px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
      boxShadow: "var(--shadow)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h1>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: "400px", margin: "0 24px" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input placeholder="Search courses, materials..." style={{
            width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px",
            border: "1px solid var(--border)", background: "var(--bg-secondary)",
            color: "var(--text-primary)", fontSize: "13px", outline: "none"
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={toggle} style={{
          background: "var(--bg-secondary)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex",
          alignItems: "center", color: "var(--text-secondary)"
        }}>
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button style={{
          background: "var(--bg-secondary)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex",
          alignItems: "center", color: "var(--text-secondary)", position: "relative"
        }}>
          <Bell size={18} />
          <span style={{ position: "absolute", top: "6px", right: "6px", width: "8px",
            height: "8px", background: "#1fb6a6", borderRadius: "50%" }} />
        </button>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%",
          background: "#1fb6a6", display: "flex", alignItems: "center",
          justifyContent: "center", color: "white", fontWeight: 700, fontSize: "14px",
          cursor: "pointer" }}>
          {user?.name?.[0]?.toUpperCase() || "S"}
        </div>
      </div>
    </header>
  );
}
