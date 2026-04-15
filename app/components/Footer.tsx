"use client";

import { useEffect, useState } from "react";

const theme = {
  bg: "#080810",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  pink: "#FF4D8D",
  purple: "#A855F7",
  gold: "#FFD166",
  text: "#F0EAF8",
  muted: "rgba(240,234,248,0.45)",
};

export default function Footer() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500); // subtle delay for fade-in
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        padding: "clamp(12px, 3vh, 20px) clamp(16px, 5vw, 24px)",
        borderTop: `1px solid ${theme.border}`,
        background: "rgba(8,8,16,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.6s ease 0.2s",
      }}
    >
      <p
        style={{
          fontSize: "clamp(11px, 2.5vh, 13px)",
          color: theme.muted,
          letterSpacing: "0.3px",
          margin: 0,
        }}
      >
        © {new Date().getFullYear()} Birthday Surprise — Made with{" "}
        <span style={{ color: theme.pink }}>❤️</span> by{" "}
        <strong style={{ color: theme.text, fontWeight: 500 }}>Hassan</strong>
      </p>
    </div>
  );
}