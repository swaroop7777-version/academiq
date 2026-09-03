import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, BookOpen, Brain, FileText,
  BarChart2, Settings, LogOut, GraduationCap
} from "lucide-react";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses",   icon: BookOpen,        label: "My Courses" },
  { to: "/documents", icon: FileText,        label: "Documents"  },
  { to: "/ai-tutor",  icon: Brain,           label: "AI Tutor"   },
  { to: "/papers",    icon: FileText,        label: "Past Papers" },
  { to: "/analytics", icon: BarChart2,       label: "Progress"   },
  { to: "/settings",  icon: Settings,        label: "Settings"   },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside style={{ background: "var(--bg-sidebar)", width: "240px", minHeight: "100vh",
      display: "flex", flexDirection: "column", padding: "0", flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#1fb6a6", borderRadius: "8px", padding: "6px",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>AcademIQ</div>
            <div style={{ color: "#1fb6a6", fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>AI-POWERED LMS</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px 12px", borderRadius: "8px", marginBottom: "4px",
            color: isActive ? "white" : "var(--text-sidebar)",
            background: isActive ? "rgba(31,182,166,0.2)" : "transparent",
            borderLeft: isActive ? "3px solid #1fb6a6" : "3px solid transparent",
            textDecoration: "none", fontSize: "14px", fontWeight: isActive ? 600 : 400,
            transition: "all 0.15s"
          })}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%",
            background: "#1fb6a6", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontWeight: 700, fontSize: "14px" }}>
            {user?.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{user?.name || "Student"}</div>
            <div style={{ color: "var(--text-sidebar)", fontSize: "11px" }}>{user?.role || "Student"}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "8px", width: "100%",
          padding: "8px 12px", borderRadius: "8px", border: "none",
          background: "rgba(226,75,74,0.15)", color: "#e24b4a",
          cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
