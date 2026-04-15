"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "../../lib/firebase";
import { ref, get } from "firebase/database";

// ─── THEME (same as before) ───────────────────────────────────────
const theme = {
  bg: "#080810", surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)",
  pink: "#FF4D8D", purple: "#A855F7", gold: "#FFD166", text: "#F0EAF8", muted: "rgba(240,234,248,0.45)",
};

const GlobalStyle = () => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; max-width: 100%; }
    html, body { overflow-x: hidden; width: 100%; max-width: 100%; }
    body { background: ${theme.bg}; color: ${theme.text}; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
    .display { font-family: 'Fraunces', serif; }
    @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes confetti-fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
    @keyframes scale-in { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes fade-up { 0% { transform: translateY(24px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes bounce-in { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 80% { transform: scale(0.95); } 100% { transform: scale(1); } }
    @keyframes blink { 50% { opacity: 0; } }
    .gradient-text { background: linear-gradient(135deg, ${theme.pink}, ${theme.purple}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .glass { background: ${theme.surface}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid ${theme.border}; border-radius: 20px; }
    .btn-primary { background: linear-gradient(135deg, ${theme.pink}, ${theme.purple}); color: white; border: none; padding: 14px 32px; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,77,141,0.35); }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
    .noise-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

const OrbBg = ({ orbs = [] }: { orbs?: any[] }) => (
  <>
    {orbs.map((o, i) => (
      <div key={i} className="orb" style={{ width: o.size || 300, height: o.size || 300, background: o.color, opacity: o.opacity || 0.15, top: o.top, left: o.left, right: o.right, bottom: o.bottom }} />
    ))}
  </>
);

interface ConfettiPiece {
  id: number; left: string; delay: string; dur: string; color: string; size: number; shape: string;
}

const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  useEffect(() => {
    setPieces(Array.from({ length: 60 }, (_, i) => ({
      id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 3}s`, dur: `${2.5 + Math.random() * 2}s`,
      color: [theme.pink, theme.purple, theme.gold, "#4FDFFF", "#80FF72"][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8, shape: Math.random() > 0.5 ? "circle" : "rect",
    })));
  }, []);
  if (!pieces.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position: "absolute", left: p.left, top: -20, width: p.size, height: p.size, background: p.color, borderRadius: p.shape === "circle" ? "50%" : "2px", animation: `confetti-fall ${p.dur} ${p.delay} ease-in forwards` }} />
      ))}
    </div>
  );
};

export default function SurprisePage() {
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [phase, setPhase] = useState<"intro" | "countdown" | "gift" | "reveal">("intro");
  const [count, setCount] = useState(3);
  const [giftOpen, setGiftOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [typedMsg, setTypedMsg] = useState("");
  const [msgDone, setMsgDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchSurprise = async () => {
      try {
        const snapshot = await get(ref(db, `surprises/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setForm({
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
            imagePreview: data.imagePreview || null,
          });
        } else {
          // Fallback to localStorage
          const raw = localStorage.getItem(`surprise_${id}`);
          if (raw) {
            const data = JSON.parse(raw);
            setForm({
              sender: data.sender,
              receiver: data.receiver,
              message: data.message,
              imagePreview: data.imagePreview || null,
            });
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error("Error fetching surprise:", error);
        setNotFound(true);
      }
    };
    fetchSurprise();
  }, [id]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count <= 0) { const t = setTimeout(() => setPhase("gift"), 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "reveal" || !form) return;
    setShowConfetti(true);
    const ct = setTimeout(() => setShowConfetti(false), 4000);
    let i = 0;
    const msg = form.message;
    const iv = setInterval(() => {
      if (i >= msg.length) { clearInterval(iv); setMsgDone(true); return; }
      setTypedMsg(msg.slice(0, i + 1)); i++;
    }, 35);
    return () => { clearInterval(iv); clearTimeout(ct); };
  }, [phase, form]);

  const handleOpenGift = () => {
    setGiftOpen(true);
    setTimeout(() => setPhase("reveal"), 1000);
  };

  if (notFound) return (
    <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <GlobalStyle /><div className="noise-overlay" />
      <div className="glass" style={{ padding: 32, textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 className="display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Surprise not found</h2>
        <p style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>This link may have expired or doesn't exist.</p>
        <a href="/" style={{ textDecoration: "none" }}><button className="btn-primary">Create your own 🎁</button></a>
      </div>
    </div>
  );

  if (!form) return (
    <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyle /><div className="noise-overlay" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: "float 2s ease-in-out infinite", display: "inline-block" }}>🎁</div>
        <p style={{ color: theme.muted, fontSize: 14 }}>Loading your surprise…</p>
      </div>
    </div>
  );

  if (phase === "intro") return (
    <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 8vw, 32px)", position: "relative", textAlign: "center" }}>
      <GlobalStyle /><div className="noise-overlay" />
      <OrbBg orbs={[{ color: theme.purple, size: 400, top: "-5%", left: "-5%", opacity: 0.15 }, { color: theme.pink, size: 300, bottom: "5%", right: "-5%", opacity: 0.12 }]} />
      <div style={{ position: "relative", zIndex: 1, animation: "scale-in 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ fontSize: "clamp(48px, 15vw, 64px)", marginBottom: "clamp(16px, 5vw, 24px)", animation: "float 2s ease-in-out infinite" }}>👀</div>
        <h1 className="display" style={{ fontSize: "clamp(24px, 7vw, 48px)", fontWeight: 700, marginBottom: "clamp(12px, 4vw, 16px)" }}>
          Someone made a<br /><span className="gradient-text">surprise for you</span>
        </h1>
        <p style={{ color: theme.muted, fontSize: "clamp(14px, 4vw, 16px)", marginBottom: "clamp(32px, 8vw, 40px)" }}>
          Hey <strong style={{ color: theme.text }}>{form.receiver}</strong> — tap below when you're ready 🎁
        </p>
        <button className="btn-primary" style={{ fontSize: "clamp(14px, 4vw, 16px)", padding: "clamp(14px, 4vw, 16px) clamp(32px, 10vw, 40px)" }} onClick={() => setPhase("countdown")}>
          I'm ready ✨
        </button>
      </div>
    </div>
  );

  if (phase === "countdown") return (
    <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <GlobalStyle /><div className="noise-overlay" />
      <OrbBg orbs={[{ color: theme.pink, size: 500, top: "50%", left: "50%", opacity: 0.18 }]} />
      <div style={{ position: "relative", zIndex: 1 }} key={count}>
        <div className="display gradient-text" style={{ fontSize: "clamp(80px, 30vw, 200px)", fontWeight: 700, lineHeight: 1, textAlign: "center", animation: "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
          {count > 0 ? count : "🎉"}
        </div>
        {count > 0 && <p style={{ textAlign: "center", color: theme.muted, fontSize: "clamp(14px, 4vw, 16px)", marginTop: 16 }}>Get ready…</p>}
      </div>
    </div>
  );

  if (phase === "gift") return (
    <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 8vw, 32px)", position: "relative", textAlign: "center" }}>
      <GlobalStyle /><div className="noise-overlay" />
      <OrbBg orbs={[{ color: theme.gold, size: 350, top: "30%", left: "30%", opacity: 0.12 }]} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ color: theme.muted, fontSize: "clamp(13px, 4vw, 15px)", marginBottom: 20 }}>Tap the gift to open 🎁</p>
        <div onClick={handleOpenGift} style={{ fontSize: "clamp(80px, 25vw, 140px)", cursor: "pointer", animation: giftOpen ? "bounce-in 0.5s forwards" : "float 2s ease-in-out infinite", display: "inline-block", userSelect: "none", filter: giftOpen ? "brightness(1.5) drop-shadow(0 0 30px rgba(255,209,102,0.6))" : "none", transform: giftOpen ? "scale(1.3) rotate(10deg)" : "" }}>
          {giftOpen ? "✨" : "🎁"}
        </div>
        {!giftOpen && <p style={{ marginTop: 20, color: theme.muted, fontSize: "clamp(12px, 3.5vw, 14px)", animation: "pulse-glow 2s ease-in-out infinite" }}>tap to unwrap</p>}
      </div>
    </div>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 8vw, 32px) clamp(16px, 5vw, 24px)", position: "relative" }}>
      <GlobalStyle /><div className="noise-overlay" />
      {showConfetti && <Confetti />}
      <OrbBg orbs={[{ color: theme.pink, size: 350, top: "-5%", right: "-5%", opacity: 0.12 }, { color: theme.purple, size: 300, bottom: "5%", left: "-5%", opacity: 0.12 }]} />
      <div style={{ maxWidth: 420, width: "100%", position: "relative", zIndex: 1, animation: "fade-up 0.6s ease forwards", textAlign: "center" }}>
        <div className="display" style={{ fontSize: "clamp(24px, 7vw, 44px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>Happy Birthday,</div>
        <div className="display gradient-text" style={{ fontSize: "clamp(28px, 9vw, 58px)", fontWeight: 700, marginBottom: "clamp(20px, 6vw, 28px)" }}>{form.receiver}! 🎂</div>
        {form.imagePreview && (
          <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 24, border: `2px solid rgba(255,77,141,0.2)`, animation: "scale-in 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both", boxShadow: "0 20px 60px rgba(255,77,141,0.15)" }}>
            <img src={form.imagePreview} alt="birthday" style={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
          </div>
        )}
        <div className="glass" style={{ padding: "clamp(20px, 5vw, 24px)", marginBottom: 20, textAlign: "left" }}>
          <p style={{ fontSize: "clamp(14px, 4vw, 16px)", lineHeight: 1.75, color: theme.text, fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300, minHeight: 60 }}>
            "{typedMsg}"
            {!msgDone && <span style={{ display: "inline-block", width: 2, height: 18, background: theme.pink, marginLeft: 2, verticalAlign: "middle", animation: "blink 0.7s step-end infinite" }} />}
          </p>
        </div>
        {msgDone && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, animation: "fade-up 0.5s ease forwards" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.pink}, ${theme.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💌</div>
            <span style={{ color: theme.muted, fontSize: "clamp(13px, 3.5vw, 14px)" }}>with love from <strong style={{ color: theme.text }}>{form.sender}</strong></span>
          </div>
        )}
        {msgDone && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(6px, 2vw, 8px)", marginTop: "clamp(24px, 8vw, 32px)", animation: "fade-up 0.5s 0.3s ease both" }}>
            {["🎂", "🎊", "🎈", "✨", "🌸", "🎀"].map((e, i) => (
              <span key={i} style={{ fontSize: "clamp(20px, 6vw, 24px)", animation: `float ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`, display: "inline-block" }}>{e}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}