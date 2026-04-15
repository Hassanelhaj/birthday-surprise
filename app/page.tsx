"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "./lib/firebase";
import { ref, set } from "firebase/database";

// ─── DESIGN TOKENS ───────────────────────────────────────────────
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

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${theme.bg}; color: ${theme.text}; font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
    .display { font-family: 'Fraunces', serif; }
    @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes confetti-fall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
    @keyframes scale-in { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes fade-up { 0% { transform: translateY(24px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes bounce-in { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 80% { transform: scale(0.95); } 100% { transform: scale(1); } }
    @keyframes blink { 50% { border-color: transparent; } }
    .gradient-text { background: linear-gradient(135deg, ${theme.pink}, ${theme.purple}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .glass { background: ${theme.surface}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid ${theme.border}; border-radius: 20px; }
    .btn-primary { background: linear-gradient(135deg, ${theme.pink}, ${theme.purple}); color: white; border: none; padding: 14px 32px; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,77,141,0.35); }
    .btn-primary:active { transform: translateY(0); }
    .btn-ghost { background: transparent; color: ${theme.muted}; border: 1px solid ${theme.border}; padding: 12px 28px; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-size: 15px; cursor: pointer; transition: all 0.2s; }
    .btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: ${theme.text}; }
    .input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid ${theme.border}; border-radius: 12px; padding: 14px 16px; color: ${theme.text}; font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none; transition: border-color 0.2s, background 0.2s; }
    .input-field:focus { border-color: rgba(168,85,247,0.5); background: rgba(255,255,255,0.07); }
    .input-field::placeholder { color: ${theme.muted}; }
    textarea.input-field { resize: none; min-height: 100px; }
    .noise-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
    @media (max-width: 480px) { .btn-primary, .btn-ghost { padding: 12px 24px; font-size: 14px; } .glass { border-radius: 16px; } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  `}</style>
);

interface Orb {
  size?: number | string;
  color?: string;
  opacity?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
}

interface ConfettiPiece {
  id: number;
  left: string;
  delay: string;
  dur: string;
  color: string;
  size: number;
  shape: string;
}

const OrbBg = ({ orbs = [] }: { orbs?: Orb[] }) => (
  <>
    {orbs.map((o, i) => (
      <div key={i} className="orb" style={{
        width: o.size || 300, height: o.size || 300,
        background: o.color, opacity: o.opacity || 0.15,
        top: o.top, left: o.left, right: o.right, bottom: o.bottom,
      }} />
    ))}
  </>
);

const Confetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  useEffect(() => {
    setPieces(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      dur: `${2.5 + Math.random() * 2}s`,
      color: [theme.pink, theme.purple, theme.gold, "#4FDFFF", "#80FF72"][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? "circle" : "rect",
    })));
  }, []);
  if (pieces.length === 0) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: p.left, top: -20,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.shape === "circle" ? "50%" : "2px",
          animation: `confetti-fall ${p.dur} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  );
};

const StepBar = ({ current, total }: { current: number; total: number }) => (
  <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        height: 3, flex: 1, borderRadius: 2,
        background: i < current ? `linear-gradient(90deg, ${theme.pink}, ${theme.purple})` : theme.border,
        transition: "background 0.4s",
      }} />
    ))}
  </div>
);

const FloatingParticles = () => {
  const items = ["✨", "🌸", "💫", "🎀", "⭐", "🌙"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {items.map((emoji, i) => (
        <span key={i} style={{
          position: "absolute", fontSize: "clamp(12px, 4vw, 16px)", opacity: 0.15,
          left: `${10 + i * 14}%`, top: `${15 + (i % 3) * 25}%`,
          animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
        }}>{emoji}</span>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: HOME
// ════════════════════════════════════════════════════════════════
const HomePage = ({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 5vh, 24px)", position: "relative", overflow: "hidden" }}>
      <OrbBg orbs={[
        { color: theme.pink, size: 400, top: "-10%", left: "-10%", opacity: 0.12 },
        { color: theme.purple, size: 350, bottom: "0%", right: "-5%", opacity: 0.12 },
        { color: theme.gold, size: 200, top: "50%", left: "40%", opacity: 0.06 },
      ]} />
      <FloatingParticles />
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "clamp(56px, 12vh, 64px)", height: "clamp(56px, 12vh, 64px)", borderRadius: "20px", background: "linear-gradient(135deg, rgba(255,77,141,0.2), rgba(168,85,247,0.2))", border: `1px solid rgba(255,77,141,0.3)`, marginBottom: "clamp(24px, 6vh, 32px)", fontSize: "clamp(24px, 5vh, 28px)", opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.8)", transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)", animation: "float 3s ease-in-out infinite" }}>🎁</div>
        <h1 className="display" style={{ fontSize: "clamp(32px, 8vh, 58px)", fontWeight: 700, lineHeight: 1.1, marginBottom: "clamp(16px, 3vh, 20px)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 0.1s" }}>
          Make someone's<br /><span className="gradient-text">birthday unforgettable</span>
        </h1>
        <p style={{ fontSize: "clamp(15px, 3.5vh, 17px)", color: theme.muted, lineHeight: 1.5, marginBottom: "clamp(28px, 6vh, 40px)", fontWeight: 300, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 0.2s" }}>
          Create a personalized birthday surprise in minutes. Add a message, a photo, and share the magic with anyone — anywhere.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vh, 16px)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 0.3s" }}>
          <button className="btn-primary" style={{ fontSize: "clamp(15px, 3.5vh, 16px)", padding: "clamp(12px, 3vh, 16px) clamp(24px, 6vh, 36px)" }} onClick={() => onNavigate("create")}>
            Create a Surprise 🎉
          </button>
          <button className="btn-ghost" style={{ fontSize: "clamp(14px, 3vh, 15px)", padding: "clamp(10px, 2.5vh, 12px) clamp(20px, 5vh, 28px)" }} onClick={() => onNavigate("view", { demo: true })}>
            See a Demo
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 24px)", marginTop: "clamp(40px, 8vh, 56px)", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}>
          {[["✨", "Beautiful"], ["🔗", "Shareable"], ["📱", "Mobile-first"]].map(([icon, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(18px, 4vh, 22px)", marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: "clamp(10px, 2.5vh, 12px)", color: theme.muted, letterSpacing: "0.5px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: CREATE
// ════════════════════════════════════════════════════════════════
const CreatePage = ({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ sender: "", receiver: "", message: "", image: null as any, imagePreview: null as string | null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("imagePreview", reader.result);
    reader.readAsDataURL(file);
    update("image", file);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.sender.trim()) e.sender = "Required";
    if (!form.receiver.trim()) e.receiver = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.message.trim()) e.message = "Write a message";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) onNavigate("preview", { form });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 5vw, 24px)", position: "relative" }}>
      <OrbBg orbs={[
        { color: theme.purple, size: 300, top: 0, left: 0, opacity: 0.1 },
        { color: theme.pink, size: 250, bottom: 0, right: 0, opacity: 0.1 },
      ]} />
      <div style={{ maxWidth: 440, width: "100%", position: "relative", zIndex: 1, animation: "fade-up 0.5s ease forwards" }}>
        <button onClick={() => step === 1 ? onNavigate("home") : setStep(1)} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
        <StepBar current={step} total={2} />
        <h2 className="display" style={{ fontSize: "clamp(24px, 6vw, 28px)", fontWeight: 700, marginBottom: 6 }}>{step === 1 ? "Who's this for?" : "Add the magic ✨"}</h2>
        <p style={{ color: theme.muted, fontSize: 14, marginBottom: 28 }}>{step === 1 ? "Tell us who's sending and who's receiving." : "Write a heartfelt message and add a photo."}</p>
        <div className="glass" style={{ padding: "clamp(20px, 5vw, 28px) clamp(16px, 4vw, 24px)" }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, color: theme.muted, display: "block", marginBottom: 8 }}>Your name</label>
                <input className="input-field" placeholder="e.g. Hassan" value={form.sender} onChange={e => update("sender", e.target.value)} />
                {errors.sender && <span style={{ color: theme.pink, fontSize: 12, marginTop: 4, display: "block" }}>{errors.sender}</span>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: theme.muted, display: "block", marginBottom: 8 }}>Their name</label>
                <input className="input-field" placeholder="e.g. Sara" value={form.receiver} onChange={e => update("receiver", e.target.value)} />
                {errors.receiver && <span style={{ color: theme.pink, fontSize: 12, marginTop: 4, display: "block" }}>{errors.receiver}</span>}
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, color: theme.muted, display: "block", marginBottom: 8 }}>Your message</label>
                <textarea className="input-field" placeholder={`Say something beautiful to ${form.receiver || "them"}...`} value={form.message} onChange={e => update("message", e.target.value)} />
                {errors.message && <span style={{ color: theme.pink, fontSize: 12, marginTop: 4, display: "block" }}>{errors.message}</span>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: theme.muted, display: "block", marginBottom: 8 }}>Add a photo <span style={{ fontWeight: 300 }}>(optional)</span></label>
                <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${theme.border}`, borderRadius: 12, padding: "clamp(16px, 4vw, 20px)", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", background: form.imagePreview ? "transparent" : "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                  {form.imagePreview ? (
                    <img src={form.imagePreview} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <><div style={{ fontSize: "clamp(20px, 6vw, 24px)", marginBottom: 8 }}>🖼️</div><div style={{ color: theme.muted, fontSize: "clamp(12px, 3vw, 13px)" }}>Tap to upload</div></>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
              </div>
            </div>
          )}
        </div>
        <button className="btn-primary" style={{ width: "100%", marginTop: 16, fontSize: "clamp(14px, 3.5vw, 15px)" }} onClick={handleNext}>
          {step === 2 ? "Preview Surprise →" : "Continue →"}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: PREVIEW — saves to Realtime Database, generates permanent link
// ════════════════════════════════════════════════════════════════
const PreviewPage = ({ data, onNavigate }: { data?: any; onNavigate: (page: string, data?: any) => void }) => {
  const form = data?.form || { sender: "Hassan", receiver: "Sara", message: "Wishing you the most magical birthday! 🎂", imagePreview: null };
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setVisible(true), 100);

    const saveToRealtime = async () => {
      try {
        // Generate a unique ID
        const id = Math.random().toString(36).slice(2, 10);
        // Save to Realtime Database
        await set(ref(db, `surprises/${id}`), {
          sender: form.sender,
          receiver: form.receiver,
          message: form.message,
          imagePreview: form.imagePreview || null,
          createdAt: new Date().toISOString(),
        });
        const generatedLink = `${window.location.origin}/surprise/${id}`;
        setShareLink(generatedLink);
        console.log("Saved to Realtime Database, link:", generatedLink);
      } catch (err) {
        console.error("Realtime Database save failed:", err);
        setError(true);
        // Fallback to localStorage
        try {
          const fallbackId = Math.random().toString(36).slice(2, 10);
          const payload = {
            sender: form.sender,
            receiver: form.receiver,
            message: form.message,
            imagePreview: form.imagePreview,
          };
          localStorage.setItem(`surprise_${fallbackId}`, JSON.stringify(payload));
          const fallbackLink = `${window.location.origin}/surprise/${fallbackId}`;
          setShareLink(fallbackLink);
          console.log("Saved to localStorage, link:", fallbackLink);
        } catch (localError) {
          console.error("Fallback save failed:", localError);
          setShareLink("#");
        }
      } finally {
        setIsSaving(false);
      }
    };

    // Timeout to avoid infinite loading
    const timeoutId = setTimeout(() => {
      if (isSaving) {
        console.warn("Save took too long, forcing exit");
        setIsSaving(false);
        setShareLink("#");
        setError(true);
      }
    }, 10000);

    saveToRealtime();
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleCopy = () => {
    if (shareLink && shareLink !== "#") {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isMounted || isSaving) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OrbBg orbs={[{ color: theme.gold, size: 300, top: "20%", left: "50%", opacity: 0.08 }]} />
        <div className="glass" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
          <div style={{ fontSize: 13, color: theme.muted }}>Creating your surprise...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 5vw, 24px)", position: "relative" }}>
      <OrbBg orbs={[
        { color: theme.gold, size: 300, top: "20%", left: "50%", opacity: 0.08 },
        { color: theme.pink, size: 250, bottom: "10%", left: "-5%", opacity: 0.1 },
      ]} />
      <div style={{ maxWidth: 440, width: "100%", position: "relative", zIndex: 1 }}>
        <button onClick={() => onNavigate("create")} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Edit</button>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.5s ease" }}>
          <h2 className="display" style={{ fontSize: "clamp(24px, 6vw, 28px)", fontWeight: 700, marginBottom: 6 }}>Looking good! 🎉</h2>
          <p style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>
            Share this link with <strong style={{ color: theme.text }}>{form.receiver}</strong> — they'll see the full surprise when they open it.
            {error && <span style={{ color: theme.gold, display: "block", marginTop: 8 }}>⚠️ Using local storage (link valid only on this device)</span>}
          </p>

          <div className="glass" style={{ padding: "clamp(20px, 5vw, 24px)", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: "clamp(32px, 8vw, 40px)", marginBottom: 12 }}>🎁</div>
            <div style={{ fontSize: 13, color: theme.muted, marginBottom: 4 }}>A birthday surprise for</div>
            <div className="display gradient-text" style={{ fontSize: "clamp(22px, 6vw, 26px)", fontWeight: 700, marginBottom: 16 }}>{form.receiver}</div>
            {form.imagePreview && <img src={form.imagePreview} alt="preview" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", textAlign: "left", fontSize: 14, color: theme.muted, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>"{form.message}"</div>
            <div style={{ fontSize: 13, color: theme.muted }}>— from <span style={{ color: theme.text }}>{form.sender}</span></div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.04)", border: `1px solid ${theme.border}`, borderRadius: 12, padding: "12px 16px", fontSize: "clamp(11px, 3vw, 13px)", color: theme.muted, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {shareLink}
            </div>
            <button className="btn-primary" style={{ padding: "12px 20px", fontSize: 13, whiteSpace: "nowrap" }} onClick={handleCopy} disabled={shareLink === "#"}>
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>

          <button className="btn-primary" style={{ width: "100%" }} onClick={() => onNavigate("view", { form })}>
            Preview the Experience →
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// PAGE: VIEW (THE MAGIC)
// ════════════════════════════════════════════════════════════════
const ViewPage = ({ data }: { data?: any }) => {
  const form = data?.form || {
    sender: "Hassan", receiver: "Sara",
    message: "May your birthday be as bright and beautiful as you are. Wishing you all the happiness in the world today and always. 🌸",
    imagePreview: null,
  };

  const [phase, setPhase] = useState<"intro" | "countdown" | "gift" | "reveal">("intro");
  const [count, setCount] = useState(3);
  const [giftOpen, setGiftOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [typedMsg, setTypedMsg] = useState("");
  const [msgDone, setMsgDone] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count <= 0) { const t = setTimeout(() => setPhase("gift"), 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "reveal") return;
    setShowConfetti(true);
    const ct = setTimeout(() => setShowConfetti(false), 4000);
    let i = 0;
    const msg = form.message;
    const iv = setInterval(() => {
      if (i >= msg.length) { clearInterval(iv); setMsgDone(true); return; }
      setTypedMsg(msg.slice(0, i + 1)); i++;
    }, 35);
    return () => { clearInterval(iv); clearTimeout(ct); };
  }, [phase, form.message]);

  const handleOpenGift = () => {
    setGiftOpen(true);
    const t = setTimeout(() => setPhase("reveal"), 1000);
    return () => clearTimeout(t);
  };

  if (phase === "intro") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 8vw, 32px)", position: "relative", textAlign: "center" }}>
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <OrbBg orbs={[{ color: theme.pink, size: 500, top: "50%", left: "50%", opacity: 0.18 }]} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="display gradient-text" style={{ fontSize: "clamp(80px, 30vw, 200px)", fontWeight: 700, lineHeight: 1, textAlign: "center", animation: "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }} key={count}>
          {count > 0 ? count : "🎉"}
        </div>
        {count > 0 && <p style={{ textAlign: "center", color: theme.muted, fontSize: "clamp(14px, 4vw, 16px)", marginTop: 16 }}>Get ready…</p>}
      </div>
    </div>
  );

  if (phase === "gift") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 8vw, 32px)", position: "relative", textAlign: "center" }}>
      <OrbBg orbs={[{ color: theme.gold, size: 350, top: "30%", left: "30%", opacity: 0.12 }]} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ color: theme.muted, fontSize: "clamp(13px, 4vw, 15px)", marginBottom: 20 }}>Tap the gift to open 🎁</p>
        <div onClick={handleOpenGift} style={{ fontSize: "clamp(80px, 25vw, 140px)", cursor: "pointer", transition: "transform 0.3s", animation: giftOpen ? "bounce-in 0.5s forwards" : "float 2s ease-in-out infinite", display: "inline-block", userSelect: "none", filter: giftOpen ? "brightness(1.5) drop-shadow(0 0 30px rgba(255,209,102,0.6))" : "none", transform: giftOpen ? "scale(1.3) rotate(10deg)" : "" }}>
          {giftOpen ? "✨" : "🎁"}
        </div>
        {!giftOpen && <p style={{ marginTop: 20, color: theme.muted, fontSize: "clamp(12px, 3.5vw, 14px)", animation: "pulse-glow 2s ease-in-out infinite" }}>tap to unwrap</p>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 8vw, 32px) clamp(16px, 5vw, 24px)", position: "relative" }}>
      {isMounted && showConfetti && <Confetti />}
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
};

// ════════════════════════════════════════════════════════════════
// APP SHELL
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState<"home" | "create" | "preview" | "view">("home");
  const [pageData, setPageData] = useState<any>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const navigate = (to: string, data: any = null) => {
    setTransitioning(true);
    setTimeout(() => { setPage(to as any); setPageData(data); setTransitioning(false); window.scrollTo(0, 0); }, 220);
  };

  if (!isMounted) return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      <GlobalStyle /><div className="noise-overlay" />
    </div>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      <GlobalStyle />
      <div className="noise-overlay" />
      <div style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(8px)" : "translateY(0)", transition: "opacity 0.22s ease, transform 0.22s ease" }}>
        {page === "home" && <HomePage onNavigate={navigate} />}
        {page === "create" && <CreatePage onNavigate={navigate} />}
        {page === "preview" && <PreviewPage data={pageData} onNavigate={navigate} />}
        {page === "view" && <ViewPage data={pageData} />}
      </div>
    </div>
  );
}