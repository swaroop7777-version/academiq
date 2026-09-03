import Layout from "../components/Layout";
import { Construction } from "lucide-react";

export default function Placeholder({ title }) {
  return (
    <Layout title={title}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "60vh", gap: "16px" }}>
        <div style={{ background: "rgba(31,182,166,0.1)", borderRadius: "16px", padding: "20px" }}>
          <Construction size={40} color="#1fb6a6" />
        </div>
        <h2 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 700 }}>{title} — Coming Soon</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>This feature is being built as part of the dissertation.</p>
      </div>
    </Layout>
  );
}
