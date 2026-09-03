import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, title }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Navbar title={title} />
        <main style={{ flex: 1, padding: "24px", background: "var(--bg-secondary)", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
