import { useState, useEffect, useRef, useCallback } from "react";
import logoFull from "../assets/mira-logo-full.png";
import logoIcon from "../assets/mira-logo-icon.png";
import founderPhoto from "../imports/IMG_9015.jpeg";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Shield,
  Lock,
  Server,
  Eye,
} from "lucide-react";

/* ─── Form submission ─── */

// Web3Forms — no backend required. The access key is public by design.
// Submissions are routed to hello@ai-mira.tech via Web3Forms.
const W3F_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

interface FormPayload {
  name: string;
  company: string;
  email: string;
  message: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function submitForm(payload: FormPayload): Promise<void> {
  const body = new FormData();
  body.append("access_key", W3F_ACCESS_KEY);
  body.append("subject", "New Demo Request — MIRA Website");
  body.append("from_name", "MIRA Website");
  body.append("name", payload.name.trim());
  body.append("email", payload.email.trim());
  body.append("company", payload.company.trim());
  body.append("message", payload.message.trim() || "(no message)");
  // Honeypot — bots fill this, humans don't
  body.append("botcheck", "");

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body,
  });

  const data = await res.json().catch(() => ({})) as { success?: boolean; message?: string };

  if (!res.ok || !data.success) {
    throw new Error(
      data.message ?? "Something went wrong.\nPlease try again or email us at hello@ai-mira.tech"
    );
  }
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

function useFormSubmit() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = useCallback(async (payload: FormPayload) => {
    if (status === "loading" || status === "success") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitForm(payload);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }, [status]);

  return { status, errorMsg, submit };
}

/* ─── Scroll animation ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView(0.1);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (visible) {
      const id = setTimeout(() => setDone(true), 700 + delay);
      return () => clearTimeout(id);
    }
  }, [visible, delay]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        filter: visible ? "blur(0px)" : "blur(2px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.65s ease ${delay}ms`,
        willChange: done ? "auto" : "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Global styles injected ─── */
const GLOBAL_STYLES = `
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body { font-family: 'Inter', sans-serif; background: #000; }
  ::selection { background: rgba(255,212,0,0.22); color: #fff; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); }

  /* ── Global interaction defaults ── */
  button, [role="button"] { cursor: pointer; }
  a { cursor: pointer; }
  img { -webkit-user-drag: none; user-select: none; }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 12px 22px; border-radius: 10px;
    font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.005em;
    background: #FFD400; color: #000;
    transition: opacity 0.16s ease, box-shadow 0.2s ease, transform 0.16s cubic-bezier(0.4,0,0.2,1);
    will-change: transform, box-shadow;
    position: relative; overflow: hidden;
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.16s ease;
  }
  .btn-primary:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(255,212,0,0.42), 0 0 0 1px rgba(255,212,0,0.2);
  }
  .btn-primary:hover::before { background: rgba(255,255,255,0.06); }
  .btn-primary:active {
    transform: translateY(0) scale(0.985);
    box-shadow: 0 2px 10px rgba(255,212,0,0.22);
    transition-duration: 0.06s;
  }
  /* Arrow icon inside btn-primary nudges right on hover */
  .btn-primary:hover svg { transform: translateX(2px); }
  .btn-primary svg { transition: transform 0.16s ease; }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 12px 22px; border-radius: 10px;
    font-size: 0.8125rem; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.62);
    transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease, transform 0.16s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease;
    will-change: transform;
  }
  .btn-secondary:hover {
    color: #fff; border-color: rgba(255,255,255,0.26);
    background: rgba(255,255,255,0.05);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
  }
  .btn-secondary:active { transform: translateY(0) scale(0.985); transition-duration: 0.06s; }
  .btn-secondary:hover svg { transform: translateX(2px); }
  .btn-secondary svg { transition: transform 0.16s ease; }

  /* ── Focus-visible indicators (WCAG 2.1 SC 2.4.7) ── */
  :focus-visible {
    outline: 2px solid rgba(255,212,0,0.7);
    outline-offset: 3px;
    border-radius: 4px;
  }
  input:focus-visible, textarea:focus-visible { outline: none; }

  /* ── Nav links ── */
  .nav-link {
    font-size: 0.8125rem; color: rgba(255,255,255,0.45);
    transition: color 0.16s ease; position: relative;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
    height: 1px; background: #FFD400;
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
  }
  .nav-link:hover { color: #fff; }
  .nav-link:hover::after { transform: scaleX(1); }

  /* ── Card base ── */
  .card-base {
    border-radius: 16px; border: 1px solid rgba(255,255,255,0.07);
    background: #0c0c0c;
    transition: border-color 0.22s ease, transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s ease;
    will-change: transform;
  }
  .card-base:hover {
    border-color: rgba(255,212,0,0.18);
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,212,0,0.06);
  }

  /* ── Inline text links with arrow ── */
  .link-arrow {
    display: inline-flex; align-items: center; gap: 6px;
    transition: color 0.16s ease, gap 0.16s ease;
  }
  .link-arrow:hover { gap: 9px; }
  .link-arrow svg { transition: transform 0.16s ease; }
  .link-arrow:hover svg { transform: translateX(3px); }

  /* ── Image hover: subtle scale for interactive images ── */
  .img-interactive {
    transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease;
    will-change: transform;
  }
  .img-interactive:hover { transform: scale(1.015); }

  /* ── Logo hover ── */
  .logo-hover {
    transition: opacity 0.16s ease, filter 0.16s ease;
    will-change: opacity;
  }
  .logo-hover:hover { opacity: 0.8; filter: brightness(1.08); }

  /* ── Legacy compat ── */
  .mira-btn-glow:hover {
    box-shadow: 0 6px 28px rgba(255,212,0,0.42), 0 0 0 1px rgba(255,212,0,0.2);
  }
  .mira-card-hover {
    transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), border-color 0.22s ease, box-shadow 0.22s ease;
    will-change: transform;
  }
  .mira-card-hover:hover {
    transform: translateY(-3px);
    border-color: rgba(255,212,0,0.18) !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.55);
  }

  /* ── Eyebrow labels ── */
  .eyebrow {
    font-size: 10px; font-weight: 600; letter-spacing: 0.22em;
    text-transform: uppercase; color: rgba(255,255,255,0.36);
  }

  /* ── Section headlines ── */
  .section-h2 {
    font-size: clamp(2.25rem, 4vw, 3.5rem);
    font-weight: 900; letter-spacing: -0.03em; line-height: 1.08;
    color: #fff;
  }

  /* ── Section subtext ── */
  .section-sub {
    font-size: 15.5px; color: rgba(255,255,255,0.44); line-height: 1.76; max-width: 48ch;
  }

  /* ── Scroll reveal utility ── */
  .reveal-item {
    transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s ease;
  }

  /* ── Reduced motion: cut all animations ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
  }

  @keyframes mira-pulse-ring {
    0%, 100% { opacity: 0.25; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.04); }
  }
  @keyframes mira-travel {
    0% { stroke-dashoffset: 120; opacity: 0; }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  @keyframes mira-bar {
    0%, 100% { transform: scaleY(0.35); opacity: 0.4; }
    50% { transform: scaleY(1); opacity: 1; }
  }
  @keyframes mira-ping {
    0% { transform: scale(1); opacity: 0.4; }
    70% { transform: scale(2.2); opacity: 0; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes accordion-open {
    from { height: 0; opacity: 0; transform: translateY(-4px); }
    to   { height: var(--radix-accordion-content-height); opacity: 1; transform: translateY(0); }
  }
  @keyframes accordion-close {
    from { height: var(--radix-accordion-content-height); opacity: 1; transform: translateY(0); }
    to   { height: 0; opacity: 0; transform: translateY(-4px); }
  }
  [data-state="open"] > .accordion-content {
    animation: accordion-open 0.34s cubic-bezier(0.16,1,0.3,1);
  }
  [data-state="closed"] > .accordion-content {
    animation: accordion-close 0.24s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes dot-flow {
    0%   { stroke-dashoffset: 0;    opacity: 0; }
    6%   { opacity: 1; }
    86%  { opacity: 1; }
    100% { stroke-dashoffset: -125; opacity: 0; }
  }
  @keyframes node-glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes core-ring-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes dash-in {
    from { stroke-dashoffset: 28; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes arch-travel {
    0%   { stroke-dashoffset: 260; opacity: 0; }
    6%   { opacity: 1; }
    94%  { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  @keyframes arch-travel-out {
    0%   { stroke-dashoffset: 0; opacity: 0; }
    6%   { opacity: 1; }
    94%  { opacity: 1; }
    100% { stroke-dashoffset: -260; opacity: 0; }
  }
  @keyframes core-breathe {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,212,0,0); }
    50%       { box-shadow: 0 0 40px 6px rgba(255,212,0,0.11); }
  }
  @keyframes arc-spin {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -251; }
  }
  @keyframes core-glow-pulse {
    0%, 100% { opacity: 0.18; transform: scale(1); }
    50%       { opacity: 0.32; transform: scale(1.08); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .animate-spin { animation: spin 0.8s linear infinite; }

  @keyframes hero-reveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hero-left-reveal {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes icon-breathe {
    0%, 100% { opacity: 0.38; r: 52; }
    50%       { opacity: 0.72; r: 58; }
  }
  @keyframes track-breathe {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 1; }
  }
  @keyframes score-blink {
    0%, 88%, 100% { opacity: 1; }
    91%            { opacity: 0.25; }
  }
  @keyframes live-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  @keyframes border-breathe {
    0%, 100% { stroke-opacity: 0.38; }
    50%       { stroke-opacity: 0.55; }
  }
  @keyframes chart-reveal {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0); }
  }
  @keyframes bar-shimmer {
    0%   { transform: translateX(-100%); }
    60%  { transform: translateX(100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes btn-breathe {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,212,0,0); }
    50%       { box-shadow: 0 0 0 6px rgba(255,212,0,0.08); }
  }
  @keyframes scroll-bob {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.7; }
    50%       { transform: translateX(-50%) translateY(6px); opacity: 1; }
  }
  @keyframes mobile-nav-drop {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Hero Visualization ─── */
function HeroVisualization() {
  const [hoveredInput, setHoveredInput] = useState<number | null>(null);
  const [hoveredCore, setHoveredCore] = useState(false);
  const [hoveredOutput, setHoveredOutput] = useState<number | null>(null);

  // Live score ticker — slowly drifts between 85–92 to simulate live data
  const [liveScore, setLiveScore] = useState(87);
  useEffect(() => {
    const values = [87, 89, 88, 91, 90, 87, 92, 89, 88, 90];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % values.length;
      setLiveScore(values[idx]);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  const inputs = [
    { y: 178, label: "Zoom" },
    { y: 254, label: "Google Meet" },
    { y: 330, label: "Microsoft Teams" },
    { y: 406, label: "Slack" },
    { y: 482, label: "Webex" },
  ];

  const outputs = [
    { y: 155, label: "Understanding Score", accent: true, live: true },
    { y: 225, label: "Knowledge Transfer", accent: false, live: false },
    { y: 295, label: "Engagement", accent: false, live: false },
    { y: 365, label: "Learning Quality", accent: false, live: false },
    { y: 435, label: "Recommendations", accent: false, live: false },
    { y: 505, label: "Business Outcomes", accent: true, live: false },
  ];

  const inRx   = 140;
  const miraLx = 286;
  const miraRx = 574;
  const outLx  = 668;
  const coreCY = 330;
  const coreCX = 430;

  const inPath  = (y: number) => { const mx = Math.round((inRx + miraLx) / 2); return `M ${inRx} ${y} C ${mx} ${y} ${mx} ${coreCY} ${miraLx} ${coreCY}`; };
  const outPath = (y: number) => { const mx = Math.round((miraRx + outLx) / 2); return `M ${miraRx} ${coreCY} C ${mx} ${coreCY} ${mx} ${y} ${outLx - 8} ${y}`; };

  const anyHovered = hoveredInput !== null || hoveredCore || hoveredOutput !== null;
  const inpActive  = (i: number) => hoveredCore || hoveredInput === i || hoveredOutput !== null;
  const outActive  = (i: number) => hoveredCore || hoveredOutput === i;
  const inpDim     = (i: number) => anyHovered && !inpActive(i);
  const outDim     = (i: number) => anyHovered && !outActive(i);
  const coreGlow   = anyHovered;

  // Idle flow durations — slower = more premium
  const inDurs  = ["9.2s", "8.4s", "10.1s", "7.8s", "9.6s"];
  const inDelays = ["-0s", "-2.8s", "-5.4s", "-1.2s", "-7.0s"];
  const outDurs  = ["8.8s", "10.4s", "7.6s", "9.0s", "11.2s", "8.2s"];
  const outDelays = ["-1.4s", "-4.0s", "-0.8s", "-6.2s", "-2.6s", "-3.8s"];

  function renderIcon(name: string, sx: number, sy: number, color: string) {
    switch (name) {
      case "Zoom":
        return (<>
          <rect x={sx} y={sy+4} width={18} height={13} rx={2} fill="none" stroke={color} strokeWidth={1.4}/>
          <path d={`M${sx+18},${sy+7}L${sx+27},${sy+4}L${sx+27},${sy+17}L${sx+18},${sy+14}Z`} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round"/>
        </>);
      case "Google Meet":
        return (<>
          <path d={`M${sx+13},${sy+1}L${sx+25},${sy+11}L${sx+13},${sy+21}L${sx+1},${sy+11}Z`} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round"/>
          <path d={`M${sx+8},${sy+11}L${sx+13},${sy+7}L${sx+18},${sy+11}L${sx+13},${sy+15}Z`} fill="none" stroke={color} strokeWidth={1.2}/>
        </>);
      case "Microsoft Teams":
        return (<>
          <circle cx={sx+10} cy={sy+7} r={4.5} fill="none" stroke={color} strokeWidth={1.4}/>
          <path d={`M${sx+2},${sy+22}Q${sx+2},${sy+14}${sx+10},${sy+14}Q${sx+18},${sy+14}${sx+18},${sy+22}`} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
          <circle cx={sx+21} cy={sy+6} r={3.5} fill="none" stroke={color} strokeWidth={1.2}/>
          <path d={`M${sx+24},${sy+6}L${sx+26},${sy+4}L${sx+26},${sy+12}L${sx+24},${sy+11}`} fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round"/>
        </>);
      case "Slack":
        return (<>
          <line x1={sx+7} y1={sy+2} x2={sx+7} y2={sy+17} stroke={color} strokeWidth={2.2} strokeLinecap="round"/>
          <line x1={sx+15} y1={sy+5} x2={sx+15} y2={sy+20} stroke={color} strokeWidth={2.2} strokeLinecap="round"/>
          <line x1={sx+2} y1={sy+9} x2={sx+20} y2={sy+9} stroke={color} strokeWidth={2.2} strokeLinecap="round"/>
          <line x1={sx+2} y1={sy+15} x2={sx+20} y2={sy+15} stroke={color} strokeWidth={2.2} strokeLinecap="round"/>
        </>);
      default: // Webex
        return (<>
          <circle cx={sx+12} cy={sy+11} r={10} fill="none" stroke={color} strokeWidth={1.4}/>
          <path d={`M${sx+9},${sy+7}L${sx+19},${sy+11}L${sx+9},${sy+15}Z`} fill={color}/>
        </>);
    }
  }

  return (
    <svg viewBox="-50 0 960 660" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <pattern id="viz-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="0.8" fill="rgba(255,255,255,0.042)"/>
        </pattern>
        <filter id="viz-line-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="viz-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6"/>
        </filter>
        <filter id="viz-core-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="viz-icon-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="18" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Dot grid */}
      <rect x="-50" width="960" height="660" fill="url(#viz-dots)"/>

      {/* Ambient center glow */}
      <ellipse cx={coreCX} cy={coreCY} rx="230" ry="180"
        fill="rgba(255,212,0,0.028)"
        style={{ animation: "mira-pulse-ring 8s ease-in-out infinite" }}/>

      {/* ── Input connection paths — base track + animated particle ── */}
      {inputs.map((inp, i) => {
        const d = inPath(inp.y);
        const active = inpActive(i);
        const dim = inpDim(i);
        const dur = active ? "2.4s" : inDurs[i];
        const delay = active ? "0s" : inDelays[i];
        // Single-dot guarantee: dash + gap must exceed pathLength (100).
        // "6 116" → pattern=122 > 100 → always exactly one dot on the path.
        const dashArr = active ? "8 116" : "6 116";
        const trackAnim = `track-breathe ${7 + i * 0.8}s ease-in-out infinite ${-(i * 2.1)}s`;
        return (
          <g key={`ip-${i}`}>
            {/* Static base track with slow breathing opacity */}
            <path d={d} fill="none" stroke="rgba(255,212,0,0.06)" strokeWidth="1"
              style={{ opacity: dim ? 0.2 : undefined, animation: dim ? undefined : trackAnim }}/>
            {/* Animated particle — glow halo */}
            {!dim && <path d={d} fill="none" stroke="rgba(255,212,0,0.22)" strokeWidth={active ? 7 : 3.5}
              strokeDasharray={dashArr} pathLength="100"
              filter="url(#viz-bloom)"
              style={{ animation: `dot-flow ${dur} ease-in-out infinite ${delay}` }}/>}
            {/* Animated particle — sharp core (same timing = in sync, appears as one dot) */}
            {!dim && <path d={d} fill="none"
              stroke={active ? "#FFD400" : "rgba(255,212,0,0.62)"}
              strokeWidth={active ? 2 : 1.25}
              strokeDasharray={dashArr} pathLength="100"
              filter="url(#viz-line-glow)"
              style={{ animation: `dot-flow ${dur} ease-in-out infinite ${delay}` }}/>}
          </g>
        );
      })}

      {/* ── Output connection paths ── */}
      {outputs.map((out, i) => {
        const d = outPath(out.y);
        const active = outActive(i);
        const dim = outDim(i);
        const dur = active ? "2.4s" : outDurs[i];
        const delay = active ? "0s" : outDelays[i];
        // Same single-dot guarantee as input paths
        const dashArr = active ? "8 116" : "6 116";
        const strokeC = out.accent
          ? (active ? "#FFD400" : "rgba(255,212,0,0.58)")
          : (active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)");
        const glowC = out.accent ? "rgba(255,212,0,0.24)" : "rgba(255,255,255,0.14)";
        const trackAnim = `track-breathe ${6.5 + i * 0.7}s ease-in-out infinite ${-(i * 1.8)}s`;
        const trackBase = out.accent ? "rgba(255,212,0,0.06)" : "rgba(255,255,255,0.04)";
        return (
          <g key={`op-${i}`}>
            <path d={d} fill="none" stroke={trackBase} strokeWidth="1"
              style={{ opacity: dim ? 0.2 : undefined, animation: dim ? undefined : trackAnim }}/>
            {!dim && <path d={d} fill="none" stroke={glowC} strokeWidth={active ? 7 : 3.5}
              strokeDasharray={dashArr} pathLength="100"
              filter="url(#viz-bloom)"
              style={{ animation: `dot-flow ${dur} ease-in-out infinite ${delay}` }}/>}
            {!dim && <path d={d} fill="none" stroke={strokeC}
              strokeWidth={active ? 2 : 1.25}
              strokeDasharray={dashArr} pathLength="100"
              filter="url(#viz-line-glow)"
              style={{ animation: `dot-flow ${dur} ease-in-out infinite ${delay}` }}/>}
          </g>
        );
      })}

      {/* ── Enterprise platform nodes ── */}
      {inputs.map((inp, i) => {
        const hov = hoveredInput === i;
        const dim = inpDim(i);
        const nodeColor = hov ? "#FFD400" : dim ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)";
        const borderC = hov ? "rgba(255,212,0,0.55)" : dim ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)";
        const bg = hov ? "rgba(255,212,0,0.04)" : "#0b0b0b";
        return (
          <g key={`in-${i}`} style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredInput(i)}
            onMouseLeave={() => setHoveredInput(null)}>
            <rect x="-50" y={inp.y - 23} width="190" height="46" rx="7"
              fill={bg} stroke={borderC} strokeWidth="1"
              style={{ transition: "all 0.25s ease" }}/>
            {renderIcon(inp.label, -40, inp.y - 11, nodeColor)}
            <text x="0" y={inp.y + 5} fill={nodeColor} fontSize="12.5"
              fontFamily="Inter" fontWeight="600"
              style={{ transition: "fill 0.25s ease" }}>
              {inp.label}
            </text>
            <circle cx="140" cy={inp.y} r="3"
              fill={hov ? "#FFD400" : "rgba(255,212,0,0.38)"}
              style={{ transition: "fill 0.25s ease" }}/>
          </g>
        );
      })}

      {/* ── MIRA core outer ping rings ── */}
      <rect x="272" y="136" width="316" height="388" rx="28"
        fill="none" stroke="rgba(255,212,0,0.09)" strokeWidth="1.5"
        style={{ animation: "mira-ping 6s ease-out infinite 0s" }}/>
      <rect x="263" y="127" width="334" height="406" rx="30"
        fill="none" stroke="rgba(255,212,0,0.045)" strokeWidth="1"
        style={{ animation: "mira-ping 6s ease-out infinite 2.2s" }}/>

      {/* Core activation glow */}
      {coreGlow && (
        <rect x="286" y="150" width="288" height="360" rx="22"
          fill="rgba(255,212,0,0.06)" stroke="rgba(255,212,0,0.52)" strokeWidth="1.5"
          filter="url(#viz-core-glow)"/>
      )}

      {/* ── MIRA core card — border breathes subtly when idle ── */}
      <rect x="286" y="150" width="288" height="360" rx="22"
        fill="#060606"
        stroke={coreGlow ? "rgba(255,212,0,0.62)" : "rgba(255,212,0,0.4)"}
        strokeWidth="1"
        style={{
          cursor: "pointer",
          transition: "stroke 0.3s ease",
          animation: coreGlow ? undefined : "border-breathe 5s ease-in-out infinite 0s",
        }}
        onMouseEnter={() => setHoveredCore(true)}
        onMouseLeave={() => setHoveredCore(false)}/>
      {/* Full-card hit area */}
      <rect x="286" y="150" width="288" height="360" rx="22"
        fill="rgba(0,0,0,0.001)" style={{ cursor: "pointer" }}
        onMouseEnter={() => setHoveredCore(true)}
        onMouseLeave={() => setHoveredCore(false)}/>

      {/* ── MIRA icon soft glow (behind the M mark) ── */}
      <ellipse cx="430" cy="287" rx="56" ry="56"
        fill="rgba(255,212,0,0.11)"
        filter="url(#viz-icon-glow)"
        style={{ animation: "icon-breathe 4s ease-in-out infinite 0s" }}/>

      {/* M logo icon */}
      <image href={logoIcon} x="385" y="242" width="90" height="90"/>

      {/* Processing bars */}
      {[0,1,2,3,4,5,6,7,8].map((j) => (
        <rect key={j}
          x={387 + j * 10} y="400" width="6" height="16" rx="3"
          fill="#FFD400"
          opacity={coreGlow ? 0.85 : 0.52}
          style={{
            animation: `mira-bar ${coreGlow ? "0.75s" : "1.4s"} ease-in-out infinite ${j * 0.13}s`,
            transformOrigin: `${390 + j * 10}px 416px`,
            transition: "opacity 0.3s ease",
          }}/>
      ))}

      {/* MIRA edge terminus dots */}
      <circle cx={miraLx} cy={coreCY} r="3.5" fill="rgba(255,212,0,0.5)"/>
      <circle cx={miraRx} cy={coreCY} r="3.5" fill="rgba(255,212,0,0.5)"/>

      {/* ── Intelligence output cards — fresh implementation ── */}
      {/* Each card: ONE terminal circle at outLx-8 (path endpoint) + rect + label */}
      {outputs.map(({ y, label, accent, live }, oi) => {
        const isHov = hoveredOutput === oi;
        const isDim = outDim(oi);

        const nodeFill = isDim
          ? "rgba(255,255,255,0.08)"
          : isHov
            ? (accent ? "#FFD400" : "rgba(255,255,255,0.6)")
            : accent
              ? "rgba(255,212,0,0.55)"
              : "rgba(255,255,255,0.22)";

        const cardFill = isHov
          ? (accent ? "rgba(255,212,0,0.04)" : "rgba(255,255,255,0.025)")
          : "#0b0b0b";

        const cardStroke = isDim
          ? "rgba(255,255,255,0.04)"
          : isHov
            ? (accent ? "rgba(255,212,0,0.55)" : "rgba(255,255,255,0.28)")
            : accent
              ? "rgba(255,212,0,0.2)"
              : "rgba(255,255,255,0.09)";

        const labelFill = isDim
          ? "rgba(255,255,255,0.2)"
          : isHov
            ? (accent ? "#FFD400" : "rgba(255,255,255,0.92)")
            : accent
              ? "rgba(255,212,0,0.88)"
              : "rgba(255,255,255,0.62)";

        return (
          <g
            key={`output-card-${oi}`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredOutput(oi)}
            onMouseLeave={() => setHoveredOutput(null)}
          >
            {/* Card rectangle — starts at outLx, right of the terminal node */}
            <rect
              x={outLx} y={y - 22} width={182} height={44} rx={7}
              fill={cardFill} stroke={cardStroke} strokeWidth={1}
              style={{ transition: "fill 0.25s ease, stroke 0.25s ease" }}
            />

            {/* Terminal node — exactly ONE circle per card, at path endpoint outLx-8 */}
            <circle
              cx={outLx - 8} cy={y} r={3}
              fill={nodeFill}
              style={{ transition: "fill 0.25s ease" }}
            />

            {/* Label */}
            <text
              x={outLx + 14} y={y + 5}
              fill={labelFill} fontSize={12}
              fontFamily="Inter" fontWeight="600"
              style={{ transition: "fill 0.25s ease" }}
            >
              {label}
            </text>

            {/* Live score badge — text only, no additional circles */}
            {live && !isDim && (
              <text
                x={outLx + 138} y={y + 5}
                fill="rgba(255,212,0,0.65)" fontSize={9.5}
                fontFamily="Inter" fontWeight={700}
                style={{ animation: "score-blink 3.4s ease-in-out infinite 0.1s" }}
              >
                {liveScore}
              </text>
            )}
          </g>
        );
      })}

      {/* Section labels */}
      <text x="45" y="624" textAnchor="middle"
        fill="rgba(255,255,255,0.32)" fontSize="9.5" fontFamily="Inter"
        fontWeight="700" letterSpacing="2.4">
        ENTERPRISE PLATFORMS
      </text>
      <text x={coreCX} y="624" textAnchor="middle"
        fill="rgba(255,255,255,0.32)" fontSize="9.5" fontFamily="Inter"
        fontWeight="700" letterSpacing="2.4">
        INTELLIGENCE LAYER
      </text>
      <text x={outLx + 91} y="624" textAnchor="middle"
        fill="rgba(255,255,255,0.32)" fontSize="9.5" fontFamily="Inter"
        fontWeight="700" letterSpacing="2.4">
        BUSINESS INTELLIGENCE
      </text>
    </svg>
  );
}

/* ─── Header ─── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Product", href: "#product" },
    { label: "Technology", href: "#technology" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "About", href: "#about" },
    { label: "Security", href: "#security" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(0,0,0,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center" aria-label="MIRA homepage">
          <img
            src={logoFull}
            alt="MIRA"
            className="h-8 w-auto logo-hover"
            style={{ objectFit: "contain" }}
            loading="eager"

            width={120}
            height={32}
          />
        </a>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <a href="#contact" className="btn-secondary">Book a Demo</a>
          <a href="#contact" className="btn-primary">Request Early Access</a>
        </div>

        <button
          className="md:hidden text-white p-1"
          onClick={() => setMobile(!mobile)}
          aria-label={mobile ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobile}
          aria-controls="mobile-nav"
        >
          {mobile ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobile && (
        <div
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{
            background: "rgba(0,0,0,0.96)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            animation: "mobile-nav-drop 0.22s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] text-white/50 hover:text-white py-1 transition-colors duration-150"
              onClick={() => setMobile(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <a href="#contact" className="btn-secondary text-center" onClick={() => setMobile(false)}>
              Book a Demo
            </a>
            <a href="#contact" className="btn-primary justify-center" onClick={() => setMobile(false)}>
              Request Early Access
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section
      aria-label="MIRA — Enterprise Conversation Intelligence"
      className="relative overflow-hidden"
      style={{ minHeight: "100vh", background: "#000" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 70% 50%, rgba(255,212,0,0.08) 0%, rgba(255,212,0,0.02) 55%, transparent 75%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 35% 35% at 16% 28%, rgba(255,255,255,0.018) 0%, transparent 60%)" }} />

      {/* Two-column grid — 45/55 split, full viewport height */}
      <div
        className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[45%_55%]"
        style={{ alignItems: "stretch" }}
      >
        {/* ── Left: copy — vertically centered with nav clearance ── */}
        <div className="flex flex-col justify-center px-8 lg:pr-8 lg:pl-[max(56px,calc((100vw-1440px)/2+56px))]"
          style={{ paddingTop: "max(88px, 10vh)", paddingBottom: "3vh", animation: "hero-left-reveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
          <div
            className="inline-flex items-center gap-2.5 mb-8 px-3.5 py-1.5 rounded-full text-xs font-medium w-fit"
            style={{
              border: "1px solid rgba(255,212,0,0.28)",
              color: "#FFD400",
              background: "rgba(255,212,0,0.07)",
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FFD400" }}/>
            <span className="font-semibold tracking-wide">Early Access</span>
            <span className="opacity-30">•</span>
            <span>Design Partner Program</span>
          </div>

          <h1
            id="heading-hero"
            className="text-5xl lg:text-[60px] font-black text-white leading-[1.1] mb-10 max-w-[360px]"
            style={{ letterSpacing: "-0.03em" }}
          >
            Turn Every Conversation<br />
            into<br />
            <span style={{ color: "#FFD400" }}>Business Intelligence</span>
          </h1>

          <div className="max-w-[400px] mb-10 space-y-4">
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
              MIRA is an AI intelligence layer that transforms conversations, meetings, training sessions and collaborative work into measurable business insights.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
              Connect your existing communication tools and data sources. MIRA analyzes recorded interactions today and is designed for real-time intelligence as the platform evolves.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <a href="#contact" className="btn-primary">
              Request Early Access <ArrowRight size={14} />
            </a>
            <a href="#contact" className="btn-secondary">
              Book a Demo
            </a>
          </div>

          <div className="flex items-center gap-7">
            {[
              { val: "94%", label: "Accuracy" },
              { val: "3×", label: "Faster Insights" },
              { val: "SOC 2", label: "Aligned" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-7">
                {i > 0 && (
                  <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
                )}
                <div>
                  <div className="text-xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>
                    {s.val}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.44)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: visualization ── */}
        <div
          className="relative flex items-center justify-start min-h-[520px] lg:min-h-0 lg:pl-0 lg:pr-4"
          style={{ minHeight: "clamp(520px, 100vh, 1000px)", paddingTop: "max(56px, 6vh)", paddingBottom: "0" }}
        >
          <div className="w-full" style={{ transform: "translateX(16px) translateY(-278px) scale(1.14)", transformOrigin: "center top", animation: "hero-reveal 1.1s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
            <HeroVisualization />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "scroll-bob 2.4s ease-in-out infinite" }}
      >
        <div
          className="w-px h-14"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)" }}
        />
        <span className="text-[10px] text-white/20 tracking-[0.25em] font-medium">SCROLL</span>
      </div>
    </section>
  );
}

/* ─── Problem ─── */
function ProblemSection() {
  const stats = [
    { index: "01", value: "$358B", label: "Spent annually on corporate training worldwide", accent: false },
    { index: "02", value: "10%",   label: "Of training content retained after one week",   accent: false },
    { index: "03", value: "72%",   label: "Of meetings produce no measurable knowledge transfer", accent: false },
    { index: "04", value: "Zero",  label: "Objective tools to measure actual understanding — before MIRA", accent: true },
  ];

  return (
    <section
      aria-labelledby="heading-problem"
      className="py-22 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#000" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">The Problem</div>
          <h2 id="heading-problem" className="section-h2 max-w-3xl mb-5">
            Organizations are investing blind.
          </h2>
          <p className="section-sub mb-14">
            Every hour of training, every business meeting — consumed without
            any objective measurement of what was actually understood, learned,
            or retained.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <ProblemCard {...s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard({ index, value, label, accent }: {
  index: string; value: string; label: string; accent: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-default"
      style={{
        background: hovered ? (accent ? "rgba(255,212,0,0.03)" : "#0d0d0d") : "#080808",
        border: `1px solid ${hovered
          ? (accent ? "rgba(255,212,0,0.28)" : "rgba(255,255,255,0.12)")
          : (accent ? "rgba(255,212,0,0.14)" : "rgba(255,255,255,0.07)")}`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset"
          : "none",
        transition: "transform 0.24s cubic-bezier(0.4,0,0.2,1), border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line — always visible, brightens on hover */}
      <div
        style={{
          height: 2,
          background: accent
            ? `linear-gradient(90deg, transparent, ${hovered ? "#FFD400" : "rgba(255,212,0,0.55)"} 50%, transparent)`
            : `linear-gradient(90deg, transparent, ${hovered ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)"} 50%, transparent)`,
          transition: "background 0.24s ease",
          flexShrink: 0,
        }}
      />

      <div className="flex flex-col flex-1 p-8 pt-7">
        {/* Index */}
        <div
          className="font-semibold mb-8 tabular-nums"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            color: accent
              ? (hovered ? "rgba(255,212,0,0.7)" : "rgba(255,212,0,0.45)")
              : "rgba(255,255,255,0.22)",
            transition: "color 0.24s ease",
          }}
        >
          {index}
        </div>

        {/* Stat value */}
        <div
          className="font-black leading-none mb-5"
          style={{
            fontSize: "clamp(2.4rem, 3.8vw, 3.25rem)",
            letterSpacing: "-0.04em",
            color: accent ? "#FFD400" : "white",
          }}
        >
          {value}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 24,
            height: 1,
            marginBottom: 16,
            background: accent
              ? (hovered ? "rgba(255,212,0,0.35)" : "rgba(255,212,0,0.18)")
              : "rgba(255,255,255,0.08)",
            transition: "background 0.24s ease",
          }}
        />

        {/* Label */}
        <p
          className="leading-[1.7] mt-auto"
          style={{
            fontSize: 13.5,
            color: hovered ? "rgba(255,255,255,0.58)" : "rgba(255,255,255,0.42)",
            transition: "color 0.24s ease",
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ─── Introducing MIRA ─── */
const MIRA_STEPS = [
  {
    num: "01",
    title: "Upload Recording",
    desc: "Connect your video platform or upload meeting and training recordings directly via secure API or file transfer.",
  },
  {
    num: "02",
    title: "AI Analyzes Communication",
    desc: "MIRA processes speech, language patterns, and interaction dynamics across the full session.",
  },
  {
    num: "03",
    title: "Measure Engagement",
    desc: "Surface attention signals, participation patterns, and active listening indicators throughout the session.",
  },
  {
    num: "04",
    title: "Measure Understanding",
    desc: "Assess comprehension depth, concept retention, and knowledge gaps per participant — with explainable scores.",
  },
  {
    num: "05",
    title: "Generate Enterprise Insights",
    desc: "Deliver structured reports on learning effectiveness, knowledge transfer, and actionable next steps.",
  },
];

// Each step activates STEP_INTERVAL ms after the previous one, then cycles
const STEP_INTERVAL = 2200;

function IntroducingMira() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [connectorFill, setConnectorFill] = useState<number[]>(Array(MIRA_STEPS.length - 1).fill(0));

  // Trigger when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Sequential step activation — runs once on inView, then loops
  useEffect(() => {
    if (!inView) return;
    let step = 0;
    setActiveStep(0);

    const advance = () => {
      step = (step + 1) % MIRA_STEPS.length;
      setActiveStep(step);
    };

    const id = setInterval(advance, STEP_INTERVAL);
    return () => clearInterval(id);
  }, [inView]);

  // Animate connector fill between active step and next
  useEffect(() => {
    if (activeStep < 0) return;
    // Reset all connectors
    setConnectorFill(Array(MIRA_STEPS.length - 1).fill(0));
    if (activeStep >= MIRA_STEPS.length - 1) return;
    // Animate the connector below the active step from 0 → 100 over the interval
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / (STEP_INTERVAL - 80), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setConnectorFill((prev) => {
        const next = [...prev];
        next[activeStep] = Math.round(eased * 100);
        return next;
      });
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [activeStep]);

  return (
    <section
      aria-labelledby="heading-product"
      className="py-22 border-t"
      id="product"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#040404" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Introducing MIRA</div>
          <h2 id="heading-product" className="section-h2 max-w-2xl mb-5">
            From recording to insight.
          </h2>
          <p className="section-sub mb-14">
            No live integration required. MIRA works with existing recordings
            from any enterprise platform.
          </p>
        </Reveal>

        <div className="max-w-3xl" ref={sectionRef}>
          {MIRA_STEPS.map((step, i) => {
            const isActive = activeStep === i;
            const isPast = activeStep > i;
            const isDim = activeStep >= 0 && !isActive && !isPast;
            const showConnector = i < MIRA_STEPS.length - 1;

            return (
              <div key={i}>
                {/* Step row */}
                <div
                  className="flex gap-8 lg:gap-10 items-start cursor-default"
                  style={{
                    padding: isActive ? "28px 0 24px" : "22px 0 20px",
                    transition: "padding 0.5s cubic-bezier(0.4,0,0.2,1)",
                  }}
                  onClick={() => setActiveStep(i)}
                >
                  {/* Left: icon column (number + connector) */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: 52 }}>
                    {/* Step badge */}
                    <div
                      className="w-13 h-13 rounded-xl flex items-center justify-center border flex-shrink-0"
                      style={{
                        width: 52,
                        height: 52,
                        background: isActive
                          ? "rgba(255,212,0,0.07)"
                          : isPast ? "rgba(255,255,255,0.02)" : "#0d0d0d",
                        borderColor: isActive
                          ? "rgba(255,212,0,0.5)"
                          : isPast ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.08)",
                        boxShadow: isActive ? "0 0 20px rgba(255,212,0,0.12)" : "none",
                        transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
                      }}
                    >
                      {isPast ? (
                        // Checkmark for completed steps
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2.5 7L5.5 10L11.5 4"
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span
                          className="font-black tabular-nums"
                          style={{
                            fontSize: 15,
                            letterSpacing: "-0.02em",
                            color: isActive ? "#FFD400" : "rgba(255,255,255,0.28)",
                            transition: "color 0.4s ease",
                          }}
                        >
                          {step.num}
                        </span>
                      )}
                    </div>

                    {/* Animated vertical connector */}
                    {showConnector && (
                      <div
                        className="relative mt-2 flex-shrink-0"
                        style={{ width: 1, height: isActive ? 56 : 36, background: "rgba(255,255,255,0.06)", transition: "height 0.5s cubic-bezier(0.4,0,0.2,1)" }}
                      >
                        {/* Filled portion — animates downward */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${isActive ? connectorFill[i] : isPast ? 100 : 0}%`,
                            background: "linear-gradient(to bottom, #FFD400, rgba(255,212,0,0.3))",
                            transition: isPast ? "height 0.3s ease" : "none",
                          }}
                        />
                        {/* Traveling dot */}
                        {isActive && connectorFill[i] > 2 && connectorFill[i] < 96 && (
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              transform: "translateX(-50%)",
                              top: `calc(${connectorFill[i]}% - 2px)`,
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "#FFD400",
                              boxShadow: "0 0 6px rgba(255,212,0,0.8)",
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: text content */}
                  <div
                    className="flex-1"
                    style={{
                      paddingTop: 14,
                      opacity: isDim ? 0.38 : 1,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <div
                      className="font-semibold mb-2 leading-snug"
                      style={{
                        fontSize: isActive ? 16 : 15,
                        color: isActive ? "white" : isPast ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.62)",
                        transition: "color 0.4s ease, font-size 0.3s ease",
                      }}
                    >
                      {step.title}
                    </div>
                    <div
                      className="leading-relaxed"
                      style={{
                        fontSize: 14,
                        color: isActive ? "rgba(255,255,255,0.52)" : "rgba(255,255,255,0.32)",
                        maxHeight: isActive ? "6em" : isPast ? "3em" : "3em",
                        overflow: "hidden",
                        transition: "color 0.4s ease, max-height 0.5s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      {step.desc}
                    </div>
                    {/* Active step progress bar */}
                    {isActive && (
                      <div
                        className="mt-4 rounded-full overflow-hidden"
                        style={{ height: 2, background: "rgba(255,255,255,0.06)", maxWidth: 200 }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${connectorFill[i] ?? (connectorFill[MIRA_STEPS.length - 2])}%`,
                            background: "linear-gradient(90deg, rgba(255,212,0,0.6), #FFD400)",
                            borderRadius: 9999,
                            transition: i < MIRA_STEPS.length - 1 ? "none" : "width 0.1s linear",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal border below row (except last) */}
                {showConnector && (
                  <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginLeft: 60 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Intelligence Layer ─── */

// Fixed viewBox coordinate space for the connector SVG
const VB_W = 1000;
// Row geometry — must match rendered pill layout
const ARCH_ROW_H   = 52;   // py-3.5 top+bottom + ~20px font ≈ 52px
const ARCH_ROW_G   = 10;   // gap-2.5
const ARCH_LABEL_H = 33;   // label text + mb-5
const ARCH_ROWS    = 5;
const ARCH_COL_H   = ARCH_LABEL_H + ARCH_ROWS * ARCH_ROW_H + (ARCH_ROWS - 1) * ARCH_ROW_G; // ≈ 363
const VB_H = ARCH_COL_H; // 363 — viewBox matches pill column height exactly

const archRowCY = (i: number) =>
  ARCH_LABEL_H + ARCH_ROW_H / 2 + i * (ARCH_ROW_H + ARCH_ROW_G);

// Pill stack center = middle pill center
const CY_MID = archRowCY(2); // ≈ 185

// Column x-boundaries in viewBox space
const IN_X  = 316; // right edge of input column (≈ 31.6% of VB_W)
const OUT_X = 684; // left edge of output column  (≈ 68.4% of VB_W)
const CX    = 500; // horizontal center

// Bezier control-point pull: how far horizontally the curve holds before bending
const CP = 110;

// Smooth bezier: pill right → core center
const inPath = (i: number) => {
  const y = archRowCY(i);
  return `M ${IN_X} ${y} C ${IN_X + CP} ${y}, ${CX - CP} ${CY_MID}, ${CX} ${CY_MID}`;
};
// Smooth bezier: core center → pill left
const outPath = (i: number) => {
  const y = archRowCY(i);
  return `M ${CX} ${CY_MID} C ${CX + CP} ${CY_MID}, ${OUT_X - CP} ${y}, ${OUT_X} ${y}`;
};

function IntelligenceLayer() {
  const [hoverInput, setHoverInput]   = useState<number | null>(null);
  const [hoverOutput, setHoverOutput] = useState<number | null>(null);

  const inputs = [
    "Meeting Recordings",
    "Training Sessions",
    "CRM Data",
    "LMS Platform",
    "Video Platforms",
  ];
  const outputs = [
    { label: "Understanding Score", accent: true },
    { label: "Knowledge Transfer", accent: false },
    { label: "Recommendations", accent: false },
    { label: "Learning Quality", accent: false },
    { label: "Business Outcomes", accent: true },
  ];

  // Staggered travel timing per row
  const durations = ["2.9s", "3.4s", "2.6s", "3.7s", "3.1s"];
  const delays    = ["0s", "0.62s", "1.28s", "0.26s", "1.04s"];

  return (
    <section
      aria-labelledby="heading-technology"
      className="py-22 border-t"
      id="technology"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#000" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Architecture</div>
          <h2 id="heading-technology" className="section-h2 max-w-2xl mb-5">
            The MIRA Intelligence Layer.
          </h2>
          <p className="section-sub mb-14">
            A unified platform that ingests enterprise communication data and
            transforms it into measurable organizational intelligence.
          </p>
        </Reveal>

        <Reveal>
          <div className="relative">

            {/* ── SVG connector canvas — fixed viewBox, scales to container ── */}
            <div
              className="absolute inset-0 pointer-events-none hidden lg:block"
              aria-hidden="true"
            >
              <svg
                width="100%" height="100%"
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
              >
                <defs>
                  <radialGradient id="core-ambient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor="#FFD400" stopOpacity="0.11" />
                    <stop offset="60%"  stopColor="#FFD400" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#FFD400" stopOpacity="0" />
                  </radialGradient>
                  <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Ambient glow halo behind core */}
                <ellipse
                  cx={CX} cy={CY_MID}
                  rx={160} ry={140}
                  fill="url(#core-ambient)"
                  style={{ animation: "core-glow-pulse 4.5s ease-in-out infinite" }}
                />

                {/* ── Input bezier connectors ── */}
                {inputs.map((_, i) => {
                  const active = hoverInput === i;
                  const dimmed = hoverInput !== null && !active;
                  const d = inPath(i);
                  return (
                    <g key={`in-${i}`} style={{ transition: "opacity 0.25s ease", opacity: dimmed ? 0.18 : 1 }}>
                      {/* Wide glow track (Stripe-style double stroke) */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "rgba(255,212,0,0.09)" : "rgba(255,212,0,0.04)"}
                        strokeWidth={active ? 10 : 7}
                        style={{ transition: "stroke 0.25s ease, stroke-width 0.25s ease" }}
                      />
                      {/* Base track */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "rgba(255,212,0,0.22)" : "rgba(255,255,255,0.05)"}
                        strokeWidth={active ? 1.5 : 0.75}
                        style={{ transition: "stroke 0.25s ease, stroke-width 0.25s ease" }}
                      />
                      {/* Particle glow halo */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "rgba(255,212,0,0.22)" : "rgba(255,212,0,0.12)"}
                        strokeWidth={active ? 7 : 5}
                        strokeDasharray="4 290"
                        strokeLinecap="round"
                        style={{ animation: `arch-travel ${durations[i]} linear infinite ${delays[i]}` }}
                      />
                      {/* Particle core — bright thin */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "#FFD400" : "rgba(255,212,0,0.75)"}
                        strokeWidth={active ? 1.75 : 1.25}
                        strokeDasharray="4 290"
                        strokeLinecap="round"
                        style={{
                          animation: `arch-travel ${durations[i]} linear infinite ${delays[i]}`,
                          transition: "stroke 0.25s ease",
                        }}
                      />
                      {/* Terminal dot */}
                      <circle
                        cx={IN_X} cy={archRowCY(i)} r={active ? 3.5 : 2.5}
                        fill={active ? "#FFD400" : "rgba(255,212,0,0.45)"}
                        style={{ filter: active ? "drop-shadow(0 0 4px rgba(255,212,0,0.8))" : "none", transition: "all 0.25s ease" }}
                      />
                    </g>
                  );
                })}

                {/* ── Output bezier connectors ── */}
                {outputs.map((out, i) => {
                  const active = hoverOutput === i;
                  const dimmed = hoverOutput !== null && !active;
                  const d = outPath(i);
                  const restOpacity = out.accent ? 0.75 : 0.55;
                  const restParticle = out.accent ? "rgba(255,212,0,0.72)" : "rgba(255,212,0,0.48)";
                  return (
                    <g key={`out-${i}`} style={{ transition: "opacity 0.25s ease", opacity: dimmed ? 0.18 : restOpacity }}>
                      {/* Wide glow track */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "rgba(255,212,0,0.09)" : out.accent ? "rgba(255,212,0,0.05)" : "rgba(255,212,0,0.03)"}
                        strokeWidth={active ? 10 : 7}
                        style={{ transition: "stroke 0.25s ease" }}
                      />
                      {/* Base track */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "rgba(255,212,0,0.22)" : out.accent ? "rgba(255,212,0,0.12)" : "rgba(255,255,255,0.045)"}
                        strokeWidth={active ? 1.5 : 0.75}
                        style={{ transition: "stroke 0.25s ease, stroke-width 0.25s ease" }}
                      />
                      {/* Particle glow halo */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "rgba(255,212,0,0.22)" : "rgba(255,212,0,0.1)"}
                        strokeWidth={active ? 7 : 5}
                        strokeDasharray="4 290"
                        strokeLinecap="round"
                        style={{ animation: `arch-travel-out ${durations[i]} linear infinite ${delays[i]}` }}
                      />
                      {/* Particle core */}
                      <path
                        d={d} fill="none"
                        stroke={active ? "#FFD400" : restParticle}
                        strokeWidth={active ? 1.75 : 1.25}
                        strokeDasharray="4 290"
                        strokeLinecap="round"
                        style={{
                          animation: `arch-travel-out ${durations[i]} linear infinite ${delays[i]}`,
                          transition: "stroke 0.25s ease",
                        }}
                      />
                      {/* Terminal dot */}
                      <circle
                        cx={OUT_X} cy={archRowCY(i)} r={active ? 3.5 : out.accent ? 3 : 2.5}
                        fill={active ? "#FFD400" : out.accent ? "rgba(255,212,0,0.6)" : "rgba(255,212,0,0.32)"}
                        style={{ filter: active ? "drop-shadow(0 0 4px rgba(255,212,0,0.8))" : "none", transition: "all 0.25s ease" }}
                      />
                    </g>
                  );
                })}

                {/* Core convergence node */}
                <circle cx={CX} cy={CY_MID} r={4} fill="rgba(255,212,0,0.5)"
                  style={{ filter: "drop-shadow(0 0 6px rgba(255,212,0,0.6))" }} />
                <circle cx={CX} cy={CY_MID} r={8} fill="rgba(255,212,0,0.08)" />
              </svg>
            </div>

            {/* ── 3-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-12 items-center">

              {/* Inputs */}
              <div className="relative z-10">
                <div
                  className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-5"
                  style={{ color: "rgba(255,255,255,0.32)" }}
                >
                  Data Sources
                </div>
                <div className="flex flex-col gap-2.5">
                  {inputs.map((inp, i) => {
                    const active = hoverInput === i;
                    const dimmed = hoverInput !== null && !active;
                    return (
                      <button
                        key={i}
                        onMouseEnter={() => setHoverInput(i)}
                        onMouseLeave={() => setHoverInput(null)}
                        className="text-left px-5 py-3.5 rounded-xl border text-sm font-medium"
                        style={{
                          borderColor: active ? "rgba(255,212,0,0.42)" : "rgba(255,255,255,0.07)",
                          background: active ? "rgba(255,212,0,0.05)" : "rgba(255,255,255,0.018)",
                          color: active ? "#fff" : dimmed ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.56)",
                          transform: active ? "translateX(-3px)" : "translateX(0)",
                          boxShadow: active ? "inset 0 0 0 1px rgba(255,212,0,0.1)" : "none",
                          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: active ? "#FFD400" : "rgba(255,255,255,0.15)",
                              boxShadow: active ? "0 0 6px rgba(255,212,0,0.7)" : "none",
                              transition: "all 0.2s ease",
                            }}
                          />
                          {inp}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center core */}
              <div className="relative z-10 flex flex-col items-center py-4">
                <div className="relative">

                  {/* Outer pulse rings */}
                  <div
                    className="absolute"
                    style={{
                      inset: -12, borderRadius: 28,
                      border: "1px solid rgba(255,212,0,0.11)",
                      animation: "mira-pulse-ring 5s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      inset: -24, borderRadius: 34,
                      border: "1px solid rgba(255,212,0,0.05)",
                      animation: "mira-pulse-ring 5s ease-in-out infinite 1.7s",
                    }}
                  />

                  {/* Spinning arc — sized to 220px card */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{ inset: -6, width: "calc(100% + 12px)", height: "calc(100% + 12px)" }}
                    viewBox="0 0 232 232"
                  >
                    <circle
                      cx="116" cy="116" r="108"
                      fill="none" stroke="#FFD400" strokeWidth="0.75"
                      strokeDasharray="56 622" strokeLinecap="round"
                      style={{ opacity: 0.28, animation: "arc-spin 12s linear infinite" }}
                    />
                    <circle
                      cx="116" cy="116" r="108"
                      fill="none" stroke="#FFD400" strokeWidth="0.5"
                      strokeDasharray="24 654" strokeLinecap="round"
                      style={{ opacity: 0.13, animation: "arc-spin 12s linear infinite -6s reverse" }}
                    />
                  </svg>

                  {/* Core card — 220×220px */}
                  <div
                    className="relative rounded-2xl flex flex-col items-center justify-center"
                    style={{
                      width: 220, height: 220,
                      background: "linear-gradient(150deg, #141414 0%, #090909 100%)",
                      border: "1px solid rgba(255,212,0,0.3)",
                      animation: "core-breathe 4.5s ease-in-out infinite",
                    }}
                  >
                    {/* Top edge highlight — wider, brighter */}
                    <div
                      className="absolute top-0 left-6 right-6 h-px rounded-full"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,212,0,0.5), transparent)" }}
                    />
                    {/* Bottom edge subtle reflect */}
                    <div
                      className="absolute bottom-0 left-12 right-12 h-px"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,212,0,0.12), transparent)" }}
                    />
                    {/* Inner radial glow */}
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "radial-gradient(ellipse 75% 60% at 50% 28%, rgba(255,212,0,0.09) 0%, transparent 70%)" }}
                    />

                    <img
                      src={logoIcon}
                      alt="MIRA Intelligence Layer core processor"
                      loading="lazy"
                      className="relative w-12 h-12 rounded-xl mb-3.5"
                      style={{ objectFit: "contain" }}
                    />
                    {/* Processing bars */}
                    <div className="relative flex gap-1.5 items-end">
                      {[0.45, 0.78, 1, 0.68, 0.52].map((scale, j) => (
                        <div
                          key={j}
                          className="w-0.5 rounded-full"
                          style={{
                            height: Math.round(14 * scale),
                            background: "#FFD400",
                            opacity: 0.6,
                            animation: `mira-bar 1s ease-in-out infinite ${j * 0.15}s`,
                            transformOrigin: "center bottom",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="relative z-10">
                <div
                  className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-5"
                  style={{ color: "rgba(255,255,255,0.32)" }}
                >
                  Intelligence Outputs
                </div>
                <div className="flex flex-col gap-2.5">
                  {outputs.map((out, i) => {
                    const active = hoverOutput === i;
                    const dimmed = hoverOutput !== null && !active;
                    return (
                      <div
                        key={i}
                        onMouseEnter={() => setHoverOutput(i)}
                        onMouseLeave={() => setHoverOutput(null)}
                        className="px-5 py-3.5 rounded-xl border text-sm font-medium cursor-default"
                        style={{
                          borderColor: active
                            ? "rgba(255,212,0,0.48)"
                            : out.accent ? "rgba(255,212,0,0.18)" : "rgba(255,255,255,0.07)",
                          background: active
                            ? "rgba(255,212,0,0.06)"
                            : out.accent ? "rgba(255,212,0,0.025)" : "rgba(255,255,255,0.018)",
                          color: active
                            ? "#FFD400"
                            : dimmed ? "rgba(255,255,255,0.2)"
                            : out.accent ? "rgba(255,212,0,0.82)" : "rgba(255,255,255,0.52)",
                          transform: active ? "translateX(3px)" : "translateX(0)",
                          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: active ? "#FFD400" : out.accent ? "rgba(255,212,0,0.5)" : "rgba(255,255,255,0.14)",
                              boxShadow: active ? "0 0 6px rgba(255,212,0,0.7)" : "none",
                              transition: "all 0.2s ease",
                            }}
                          />
                          {out.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Dashboard Preview ─── */
const sessionEngData = [
  { t: "0:00",  e: 38, u: 29 },
  { t: "5:00",  e: 55, u: 42 },
  { t: "10:00", e: 51, u: 51 },
  { t: "15:00", e: 76, u: 64 },
  { t: "20:00", e: 71, u: 69 },
  { t: "25:00", e: 89, u: 77 },
  { t: "30:00", e: 84, u: 83 },
  { t: "35:00", e: 95, u: 88 },
  { t: "40:00", e: 78, u: 86 },
  { t: "45:00", e: 92, u: 94 },
];

/* Catmull-Rom → cubic Bezier helper for smooth SVG paths */
function smoothSvgPath(pts: [number, number][]): string {
  const n = pts.length;
  if (n === 0) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const cp1x = +(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2);
    const cp1y = +(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2);
    const cp2x = +(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2);
    const cp2y = +(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2);
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* Pure-SVG area chart — replaces Recharts AreaChart to eliminate duplicate-key warning */
function SessionAreaChart() {
  const VW = 400, PAD_T = 6, PAD_B = 24;
  const chartH = 140 - PAD_T - PAD_B; // 110
  const bot = PAD_T + chartH;          // 116
  const n = sessionEngData.length;
  const xs = sessionEngData.map((_, i) => +(VW * i / (n - 1)).toFixed(1));
  const toY = (v: number) => +(PAD_T + chartH * (1 - v / 100)).toFixed(1);
  const ept: [number, number][] = sessionEngData.map((d, i) => [xs[i], toY(d.e)]);
  const upt: [number, number][] = sessionEngData.map((d, i) => [xs[i], toY(d.u)]);
  const eLine = smoothSvgPath(ept);
  const uLine = smoothSvgPath(upt);
  const eArea = `${eLine} L ${xs[n - 1]},${bot} L ${xs[0]},${bot} Z`;
  const uArea = `${uLine} L ${xs[n - 1]},${bot} L ${xs[0]},${bot} Z`;
  const shown = sessionEngData.filter((_, i) => i % 3 === 0 || i === n - 1);
  return (
    <svg viewBox={`0 0 ${VW} 140`} width="100%" height={140} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="grad-engagement" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD400" stopOpacity={0.18} />
          <stop offset="100%" stopColor="#FFD400" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="grad-understanding" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.09} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[25, 50, 75].map(v => (
        <line key={v} x1={0} y1={toY(v)} x2={VW} y2={toY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}
      <path d={uArea} fill="url(#grad-understanding)" />
      <path d={eArea} fill="url(#grad-engagement)" />
      <path d={uLine} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={eLine} fill="none" stroke="#FFD400" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {shown.map(({ t }, i) => {
        const idx = sessionEngData.findIndex(d => d.t === t);
        return (
          <text key={t} x={xs[idx]} y={136}
            textAnchor={i === 0 ? "start" : i === shown.length - 1 ? "end" : "middle"}
            fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="Inter, system-ui, sans-serif">
            {t}
          </text>
        );
      })}
    </svg>
  );
}

const knowledgeTopics = [
  { name: "Core Concepts",   score: 91, delta: "+4",  positive: true },
  { name: "Process Steps",   score: 74, delta: "−5",  positive: false },
  { name: "Key Metrics",     score: 67, delta: "+9",  positive: true },
  { name: "Best Practices",  score: 88, delta: "+12", positive: true },
  { name: "Action Items",    score: 79, delta: "+3",  positive: true },
];

const businessOutcomeData = [
  { label: "Understanding",    value: 87, accent: true },
  { label: "Engagement",       value: 79, accent: true },
  { label: "Knowledge Ret.",   value: 73, accent: false },
  { label: "Learning Quality", value: 82, accent: false },
  { label: "Business Impact",  value: 68, accent: false },
];

const kpiCards = [
  { label: "Understanding Score", value: 87, suffix: "", unit: "/100", delta: "+12 pts", positive: true, accent: true },
  { label: "Engagement Score",    value: 79, suffix: "", unit: "/100", delta: "+6 pts",  positive: true, accent: false },
  { label: "Knowledge Transfer",  value: 73, suffix: "%", unit: "",   delta: "+8%",     positive: true, accent: false },
  { label: "Learning Quality",    value: 82, suffix: "", unit: "/100", delta: "+5 pts",  positive: true, accent: false },
];

function useDashInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// Counts from 0 → target with ease-out cubic, supports integer and one-decimal values
function AnimatedCount({ target, duration = 1300, decimals = 0 }: { target: number; duration?: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useDashInView();
  useEffect(() => {
    if (!visible) return;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      const cur = parseFloat((target * eased).toFixed(decimals));
      setVal(step >= steps ? target : cur);
      if (step >= steps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, [visible, target, duration, decimals]);
  return <span ref={ref}>{decimals > 0 ? val.toFixed(decimals) : val}</span>;
}

// Progress bar with animated fill + glowing end-cap
function AnimatedBar({ score, delay = 0, color, height = 4 }: { score: number; delay?: number; color: string; height?: number }) {
  const { ref, visible } = useDashInView();
  const isGold = color === "#FFD400";
  return (
    <div
      ref={ref}
      className="flex-1 rounded-full relative overflow-hidden"
      style={{ height, background: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="h-full rounded-full relative"
        style={{
          width: visible ? `${score}%` : "0%",
          background: color,
          transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        }}
      >
        {/* Shimmer sweep after fill */}
        {isGold && visible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
              animation: `bar-shimmer 1.6s ease-out ${delay + 1.05}s both`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function DashboardPreview() {
  const { ref: dashRef, visible: dashVisible } = useDashInView();
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null);
  const [hoveredRec, setHoveredRec] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="heading-platform"
      className="py-22 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#040404" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Platform</div>
          <h2 id="heading-platform" className="section-h2 max-w-2xl mb-5">
            Intelligence at a glance.
          </h2>
          <p className="section-sub mb-14">
            Enterprise dashboards that surface what matters — understanding scores, knowledge transfer, engagement patterns and recommendations that drive action.
          </p>
        </Reveal>

        <Reveal>
          <div
            ref={dashRef}
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: "rgba(255,255,255,0.11)",
              background: "#070707",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.7), 0 0 120px rgba(255,212,0,0.03)",
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-4 px-5 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "#060606" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,90,90,0.5)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,188,40,0.5)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(50,200,90,0.5)" }} />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <span className="text-[11px] text-white/20 font-mono">mira.ai</span>
                <span className="text-white/10">/</span>
                <span className="text-[11px] text-white/30 font-mono">workspace</span>
                <span className="text-white/10">/</span>
                <span className="text-[11px] text-white/40 font-mono">Q4 Sales Enablement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-white/20 px-2 py-0.5 rounded border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  Nov 18, 2024
                </div>
                <div className="text-[10px] text-white/20 px-2 py-0.5 rounded border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  Export ↓
                </div>
              </div>
            </div>

            {/* Sub-nav */}
            <div
              className="flex items-center gap-0 px-5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              {["Overview", "Sessions", "Teams", "Insights", "Reports"].map((tab, i) => (
                <div
                  key={tab}
                  className="text-[11px] px-4 py-2.5 cursor-default"
                  style={{
                    color: i === 0 ? "rgba(255,212,0,0.9)" : "rgba(255,255,255,0.22)",
                    borderBottom: i === 0 ? "1px solid #FFD400" : "1px solid transparent",
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {tab}
                </div>
              ))}
              <div className="ml-auto flex items-center gap-3 pr-1 py-1.5">
                <div className="text-[10px] text-white/20 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />
                  Analysis complete
                </div>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="p-5 flex flex-col gap-4">

              {/* ── Row 1: KPI cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpiCards.map((kpi, i) => {
                  const isHov = hoveredKpi === i;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border cursor-default"
                      style={{
                        padding: "20px 20px 18px",
                        background: isHov ? "#111" : "#0e0e0e",
                        borderColor: kpi.accent
                          ? isHov ? "rgba(255,212,0,0.3)" : "rgba(255,212,0,0.16)"
                          : isHov ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                        transform: isHov ? "translateY(-2px)" : "translateY(0)",
                        boxShadow: isHov
                          ? kpi.accent
                            ? "0 8px 32px rgba(255,212,0,0.07), 0 2px 8px rgba(0,0,0,0.4)"
                            : "0 8px 32px rgba(0,0,0,0.4)"
                          : "none",
                        transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={() => setHoveredKpi(i)}
                      onMouseLeave={() => setHoveredKpi(null)}
                    >
                      <div className="text-[10px] tracking-[0.16em] mb-3 uppercase font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {kpi.label}
                      </div>
                      <div className="flex items-end gap-1 mb-3">
                        <span
                          className="font-black leading-none"
                          style={{
                            fontSize: "clamp(1.8rem, 3vw, 2.25rem)",
                            color: kpi.accent ? "#FFD400" : "rgba(255,255,255,0.92)",
                            letterSpacing: "-0.04em",
                          }}
                        >
                          <AnimatedCount target={kpi.value} duration={1100 + i * 100} />
                          {kpi.suffix}
                        </span>
                        {kpi.unit && (
                          <span className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{kpi.unit}</span>
                        )}
                      </div>
                      <div className="mb-3">
                        <AnimatedBar
                          score={kpi.value}
                          delay={i * 0.09}
                          color={kpi.accent ? "#FFD400" : "rgba(255,255,255,0.4)"}
                          height={3}
                        />
                      </div>
                      <div className="text-[10px] flex items-center gap-1" style={{ color: kpi.positive ? "#4ade80" : "#f87171" }}>
                        {kpi.positive ? "↑" : "↓"} {kpi.delta}
                        <span className="ml-1" style={{ color: "rgba(255,255,255,0.28)" }}>vs prev. session</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Row 2: Timeline + Business Outcomes ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Timeline chart */}
                <div
                  className="rounded-xl border lg:col-span-2"
                  style={{ padding: "20px 20px 16px", background: "#0e0e0e", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                      Engagement & Understanding — Session Timeline
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                        <div className="w-3 h-0.5 rounded" style={{ background: "#FFD400" }} />
                        Engagement
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                        <div className="w-3 h-0.5 rounded bg-white/35" />
                        Understanding
                      </div>
                    </div>
                  </div>
                  {/* Chart reveal: slides from left when in view */}
                  <div
                    style={{
                      animation: dashVisible ? "chart-reveal 1.1s cubic-bezier(0.4,0,0.2,1) 0.2s both" : "none",
                    }}
                  >
                      <SessionAreaChart />
                  </div>
                  <div className="flex items-center gap-5 mt-1 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.32)" }}>Peak engagement at <span style={{ color: "rgba(255,255,255,0.52)" }}>30–35 min</span></div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.32)" }}>Understanding convergence at <span style={{ color: "rgba(255,255,255,0.52)" }}>40 min</span></div>
                  </div>
                </div>

                {/* Business Outcomes */}
                <div
                  className="rounded-xl border"
                  style={{ padding: "20px", background: "#0e0e0e", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="text-[10px] tracking-[0.16em] mb-4 uppercase font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Business Outcomes
                  </div>
                  <div className="flex flex-col gap-3">
                    {businessOutcomeData.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 cursor-default"
                        style={{ transition: "background 0.18s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div className="text-[10px] w-28 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>{d.label}</div>
                        <AnimatedBar score={d.value} delay={i * 0.08} color={d.accent ? "#FFD400" : "rgba(255,255,255,0.35)"} height={3} />
                        <div
                          className="text-[10px] font-semibold w-7 text-right shrink-0 tabular-nums"
                          style={{ color: d.accent ? "#FFD400" : "rgba(255,255,255,0.58)" }}
                        >
                          {d.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>Composite Score</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: "#FFD400" }}>
                        <AnimatedCount target={77.8} duration={1400} decimals={1} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Row 3: Knowledge Transfer + Executive Summary + Recommendations ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.22fr_1fr] gap-4">
                {/* Knowledge Transfer */}
                <div
                  className="rounded-xl border"
                  style={{ padding: "20px", background: "#0e0e0e", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="text-[10px] tracking-[0.16em] mb-4 uppercase font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Knowledge Transfer
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {knowledgeTopics.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 cursor-default"
                        style={{ transition: "background 0.18s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div className="text-[10px] w-24 truncate shrink-0" style={{ color: "rgba(255,255,255,0.48)" }}>{d.name}</div>
                        <AnimatedBar score={d.score} delay={i * 0.08} color={d.score >= 80 ? "#FFD400" : "rgba(255,255,255,0.32)"} height={3} />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] w-5 text-right tabular-nums" style={{ color: "rgba(255,255,255,0.52)" }}>{d.score}</span>
                          <span
                            className="text-[9px] font-semibold tabular-nums"
                            style={{ color: d.positive ? "#4ade80" : "#f87171" }}
                          >
                            {d.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="flex justify-between">
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>Avg. Transfer Rate</span>
                      <span className="text-[10px] font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.62)" }}>
                        <AnimatedCount target={79.8} duration={1400} decimals={1} /> / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div
                  className="rounded-xl border"
                  style={{ padding: "22px 22px 20px", background: "#0e0e0e", borderColor: "rgba(255,212,0,0.14)" }}
                >
                  <div className="text-[10px] tracking-[0.16em] mb-4 uppercase font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Executive Summary
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { k: "Duration", v: "47:32" },
                        { k: "Participants", v: "14" },
                        { k: "Topics", v: "8 / 10" },
                        { k: "Quality", v: "A−" },
                      ].map((r, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-md border" style={{ borderColor: "rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.025)" }}>
                          <div className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{r.k}</div>
                          <div className="text-sm font-semibold" style={{ color: r.k === "Quality" ? "#FFD400" : "rgba(255,255,255,0.78)" }}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.46)" }}>
                      MIRA detected above-average understanding across 8 of 10 topics. Engagement peaked between minutes 30–35 during the live product demonstration. Three participants scored below the 70-point comprehension threshold and have been flagged for follow-up.
                    </p>
                    <div
                      className="rounded-lg px-4 py-3 mt-1"
                      style={{ background: "rgba(255,212,0,0.055)", border: "1px solid rgba(255,212,0,0.18)" }}
                    >
                      <div className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Overall Session Score</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black leading-none tabular-nums" style={{ fontSize: 28, color: "#FFD400", letterSpacing: "-0.03em" }}>
                          <AnimatedCount target={83.4} duration={1300} decimals={1} />
                        </span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/ 100 · A−</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div
                  className="rounded-xl border"
                  style={{ padding: "20px", background: "#0e0e0e", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                      AI Recommendations
                    </div>
                    <div className="text-[9px] px-1.5 py-0.5 rounded border" style={{ borderColor: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.32)" }}>
                      4 actions
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { priority: "High",   color: "#f87171", text: "Schedule targeted follow-up with 3 participants who scored below the 70pt comprehension threshold." },
                      { priority: "High",   color: "#f87171", text: "Revisit Process Steps in the next session — a 26% comprehension gap was detected across the group." },
                      { priority: "Medium", color: "#FFD400", text: "Minutes 30–35 showed peak engagement. Structure future sessions to front-load complex topics in this window." },
                      { priority: "Low",    color: "rgba(255,255,255,0.3)", text: "Key Metrics coverage was below average. Consider a short pre-reading brief before the next session." },
                    ].map((rec, i) => {
                      const isHov = hoveredRec === i;
                      return (
                        <div
                          key={i}
                          className="flex gap-2.5 items-start rounded-lg px-2 py-2 -mx-2 cursor-default"
                          style={{
                            background: isHov ? "rgba(255,255,255,0.03)" : "transparent",
                            transition: "background 0.18s ease",
                          }}
                          onMouseEnter={() => setHoveredRec(i)}
                          onMouseLeave={() => setHoveredRec(null)}
                        >
                          <div className="shrink-0 mt-[5px]">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: rec.color }} />
                          </div>
                          <div>
                            <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: rec.color }}>
                              {rec.priority}
                            </div>
                            <p className="text-[10.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{rec.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Why MIRA ─── */
function WhyMira() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = [
    {
      num: "01",
      title: "Understanding, not transcription.",
      desc: "MIRA goes beyond words. It measures whether teams actually grasped the concepts discussed — not just what was said out loud.",
    },
    {
      num: "02",
      title: "Business outcomes, not vanity metrics.",
      desc: "Engagement scores tied to learning effectiveness. Knowledge retention mapped to business KPIs. Clarity, not theater.",
    },
    {
      num: "03",
      title: "Enterprise intelligence, not another AI wrapper.",
      desc: "A purpose-built platform for organizational learning — not a chatbot with extra steps or a transcription tool with a dashboard.",
    },
  ];

  return (
    <section
      aria-labelledby="heading-why"
      className="py-22 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#040404" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Why MIRA</div>
          <h2 id="heading-why" className="section-h2 mb-16">
            Intelligence with purpose.
          </h2>
        </Reveal>

        <div
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ background: "rgba(255,255,255,0.05)", gap: 1 }}
        >
          {cards.map((card, i) => {
            const isHov = hoveredCard === i;
            return (
              <Reveal key={i} delay={i * 100}>
                <div
                  className="flex flex-col h-full cursor-default relative"
                  style={{
                    padding: "64px 52px 68px",
                    background: isHov ? "#0a0a0a" : "#000",
                    transform: isHov ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: isHov
                      ? "0 16px 48px rgba(0,0,0,0.55), 0 0 40px rgba(255,212,0,0.06), 0 -1px 0 rgba(255,212,0,0.18)"
                      : "none",
                    zIndex: isHov ? 2 : 1,
                    transition: "background 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease",
                  }}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Index number */}
                  <div
                    className="font-black leading-none select-none mb-10"
                    style={{
                      fontSize: "clamp(3.5rem, 5.5vw, 5rem)",
                      color: isHov ? "rgba(255,212,0,0.22)" : "rgba(255,212,0,0.13)",
                      letterSpacing: "-0.05em",
                      transition: "color 0.28s ease",
                    }}
                  >
                    {card.num}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-bold leading-[1.2] mb-5"
                    style={{
                      fontSize: "clamp(1.15rem, 1.5vw, 1.4rem)",
                      letterSpacing: "-0.024em",
                      color: isHov ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.88)",
                      transition: "color 0.28s ease",
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Separator — widens on hover */}
                  <div
                    style={{
                      height: 1,
                      marginBottom: 20,
                      background: isHov ? "rgba(255,212,0,0.4)" : "rgba(255,212,0,0.18)",
                      width: isHov ? 44 : 28,
                      transition: "width 0.36s cubic-bezier(0.4,0,0.2,1), background 0.28s ease",
                    }}
                  />

                  {/* Body */}
                  <p
                    className="leading-[1.82]"
                    style={{
                      fontSize: 15.5,
                      color: isHov ? "rgba(255,255,255,0.56)" : "rgba(255,255,255,0.44)",
                      transition: "color 0.28s ease",
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Use Cases ─── */
/* ─── Request Demo CTA (early conversion, after Dashboard) ─── */
function RequestDemoCTA() {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { status, errorMsg, submit } = useFormSubmit();

  const inputStyle = (hasErr: boolean) => ({
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${hasErr ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.09)"}`,
    color: "white",
    outline: "none",
    transition: "border-color 0.18s ease, background 0.18s ease",
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.company.trim()) errs.company = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    submit({
      name: form.name,
      company: form.company,
      email: form.email,
      message: "Demo request submitted via the early access form.",
    });
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <section
      aria-label="Request early access to MIRA"
      className="py-22 border-t border-b"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#060606" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <Reveal>
            <div>
              <div className="eyebrow mb-3">Early Access</div>
              <h2 className="section-h2 mb-5">
                See MIRA<br />in action.
              </h2>
              <p className="section-sub max-w-sm mb-10">
                We onboard a limited number of design partners each quarter. Request a personalized demo and we{"'"}ll be in touch within 24 hours.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Personalized 30-minute product walkthrough",
                  "Live analysis of your own meeting recordings",
                  "Custom ROI assessment for your team",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "#FFD400" }}
                    />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.46)" }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right — compact form or success */}
          <Reveal delay={100}>
            {isSuccess ? (
              <div
                className="rounded-2xl p-10 border flex flex-col items-center justify-center text-center"
                style={{ background: "#111", borderColor: "rgba(255,212,0,0.18)", minHeight: 280 }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6 border"
                  style={{ background: "rgba(255,212,0,0.1)", borderColor: "rgba(255,212,0,0.3)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M4.5 11.5L9 16L17.5 7" stroke="#FFD400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 22, strokeDashoffset: 0, animation: "dash-in 0.4s cubic-bezier(0.4,0,0.2,1) both" }}/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Thank you.</h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Your request has been received. Our team will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl p-8 border flex flex-col gap-4"
                style={{ background: "#111", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { key: "name" as const, label: "Name", type: "text", placeholder: "Your full name" },
                    { key: "company" as const, label: "Company", type: "text", placeholder: "Company name" },
                  ] as const).map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label htmlFor={`cta-${key}`} className="block text-[10px] text-white/30 mb-2 uppercase tracking-[0.18em] font-semibold">
                        {label}
                      </label>
                      <input
                        id={`cta-${key}`}
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, [key]: e.target.value }));
                          if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: "" }));
                        }}
                        className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/16"
                        style={inputStyle(!!fieldErrors[key])}
                        onFocus={(e) => { if (!fieldErrors[key]) e.target.style.borderColor = "rgba(255,212,0,0.35)"; e.target.style.background = "rgba(255,255,255,0.045)"; }}
                        onBlur={(e) => { e.target.style.borderColor = fieldErrors[key] ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.09)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                        disabled={isLoading}
                      />
                      {fieldErrors[key] && (
                        <p className="text-[10px] mt-1" style={{ color: "rgba(239,68,68,0.8)" }}>{fieldErrors[key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="cta-email" className="block text-[10px] text-white/30 mb-2 uppercase tracking-[0.18em] font-semibold">
                    Work Email
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, email: e.target.value }));
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                    }}
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/16"
                    style={inputStyle(!!fieldErrors.email)}
                    onFocus={(e) => { if (!fieldErrors.email) e.target.style.borderColor = "rgba(255,212,0,0.35)"; e.target.style.background = "rgba(255,255,255,0.045)"; }}
                    onBlur={(e) => { e.target.style.borderColor = fieldErrors.email ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.09)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
                    disabled={isLoading}
                  />
                  {fieldErrors.email && (
                    <p className="text-[10px] mt-1" style={{ color: "rgba(239,68,68,0.8)" }}>{fieldErrors.email}</p>
                  )}
                </div>

                {status === "error" && (
                  <div
                    className="rounded-lg px-4 py-3 text-[12px] leading-relaxed"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.9)" }}
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary justify-center w-full"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : undefined, cursor: isLoading ? "not-allowed" : undefined }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5"/>
                        <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>Request Early Access <ArrowRight size={14} /></>
                  )}
                </button>
                <p className="text-[10px] text-white/20 text-center">
                  No spam. We respond personally within 24 hours.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const USE_CASES = [
  {
    tag: "L&D",
    title: "Corporate Learning",
    desc: "Measure training effectiveness across the entire organization. Know exactly what stuck, what was missed, and where to invest next. Replace attendance reports with comprehension reports.",
    stat: { value: "10×", label: "knowledge retention vs passive delivery" },
  },
  {
    tag: "Revenue",
    title: "Sales Enablement",
    desc: "Ensure your sales team truly understands the playbook — not just heard it. Identify knowledge gaps before they face customers and cost the business.",
    stat: { value: "31%", label: "faster ramp time for new sales hires" },
  },
  {
    tag: "Leadership",
    title: "Leadership Training",
    desc: "Validate that leadership programs deliver measurable capability shifts, not just attendance certificates. Measure concept absorption and behavioral readiness.",
    stat: { value: "2.4×", label: "increase in measurable program ROI" },
  },
  {
    tag: "CS",
    title: "Customer Success",
    desc: "Analyze onboarding sessions for comprehension gaps before they become retention risks. Surface early warning signals tied directly to customer understanding.",
    stat: { value: "18%", label: "reduction in early-stage churn" },
  },
  {
    tag: "Ops",
    title: "Enterprise Meetings",
    desc: "Transform high-stakes meetings into measurable knowledge events. Know what decisions were understood, what actions were internalized, what needs follow-up.",
    stat: { value: "72%", label: "of meetings currently produce zero retention" },
  },
];

const UC_INTERVAL = 4200;

function UseCases() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRaf = useRef<number>(0);
  const progressStart = useRef<number>(0);

  // Animate content out → swap → in
  const goTo = useCallback((i: number) => {
    setVisible(false);
    setProgress(0);
    setTimeout(() => {
      setActive(i);
      setVisible(true);
      progressStart.current = performance.now();
    }, 180);
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (paused) { cancelAnimationFrame(progressRaf.current); return; }
    progressStart.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - progressStart.current;
      const pct = Math.min(elapsed / UC_INTERVAL, 1);
      setProgress(pct);
      if (pct < 1) {
        progressRaf.current = requestAnimationFrame(tick);
      } else {
        goTo((active + 1) % USE_CASES.length);
      }
    };
    progressRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progressRaf.current);
  }, [active, paused, goTo]);

  const handleManualSelect = (i: number) => {
    cancelAnimationFrame(progressRaf.current);
    if (i !== active) goTo(i);
  };

  return (
    <section
      aria-labelledby="heading-use-cases"
      className="py-22 border-t"
      id="use-cases"
      ref={sectionRef}
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#000" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Use Cases</div>
          <h2 id="heading-use-cases" className="section-h2 mb-5">
            Built for enterprise scale.
          </h2>
          <p className="section-sub mb-14">
            MIRA transforms how enterprise teams measure learning, communication and knowledge transfer across every function.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-start">

          {/* ── Left: navigation rail ── */}
          <nav aria-label="Use case navigation">
            {USE_CASES.map((c, i) => {
              const isActive = active === i;
              return (
                <button
                  key={i}
                  onClick={() => handleManualSelect(i)}
                  className="w-full text-left relative flex items-center gap-5 group"
                  style={{
                    padding: "20px 0 20px 24px",
                    borderBottom: i < USE_CASES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  {/* Left track + fill line */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    {isActive ? (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${progress * 100}%`,
                          background: "#FFD400",
                          transition: "height 0.05s linear",
                        }}
                      />
                    ) : (
                      // Past items: full gold line; future: nothing
                      i < active && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,212,0,0.22)" }} />
                      )
                    )}
                  </div>

                  {/* Index */}
                  <span
                    className="font-mono tabular-nums flex-shrink-0"
                    style={{
                      fontSize: 11,
                      color: isActive ? "rgba(255,212,0,0.7)" : "rgba(255,255,255,0.18)",
                      transition: "color 0.24s ease",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Title + tag */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold leading-snug"
                      style={{
                        fontSize: 15,
                        color: isActive ? "white" : "rgba(255,255,255,0.36)",
                        transition: "color 0.24s ease",
                      }}
                    >
                      {c.title}
                    </div>
                    {isActive && (
                      <div
                        className="text-[11px] mt-1 font-medium"
                        style={{
                          color: "rgba(255,212,0,0.55)",
                          animation: "fade-in-up 0.22s ease both",
                        }}
                      >
                        {c.tag}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={13}
                    className="flex-shrink-0"
                    style={{
                      color: isActive ? "#FFD400" : "rgba(255,255,255,0.12)",
                      transform: isActive ? "translateX(0)" : "translateX(-4px)",
                      opacity: isActive ? 1 : 0,
                      transition: "color 0.24s ease, transform 0.24s ease, opacity 0.24s ease",
                    }}
                  />
                </button>
              );
            })}
          </nav>

          {/* ── Right: content panel ── */}
          <div className="lg:sticky lg:top-28">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "#0d0d0d",
                borderColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              {/* Card top chrome */}
              <div
                className="flex items-center justify-between px-8 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "#090909" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="text-[9px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border"
                    style={{
                      color: "#FFD400",
                      borderColor: "rgba(255,212,0,0.22)",
                      background: "rgba(255,212,0,0.06)",
                      transition: "all 0.24s ease",
                      opacity: visible ? 1 : 0,
                    }}
                  >
                    {USE_CASES[active].tag}
                  </div>
                </div>
                <div
                  className="font-mono text-[11px]"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  {String(active + 1).padStart(2, "0")} / {String(USE_CASES.length).padStart(2, "0")}
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-10">
                <div
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <h3
                    className="font-black text-white leading-[1.1] mb-6"
                    style={{
                      fontSize: "clamp(1.75rem, 2.8vw, 2.4rem)",
                      letterSpacing: "-0.032em",
                    }}
                  >
                    {USE_CASES[active].title}
                  </h3>
                  <p
                    className="leading-[1.82] mb-8"
                    style={{ fontSize: 15.5, color: "rgba(255,255,255,0.5)" }}
                  >
                    {USE_CASES[active].desc}
                  </p>

                  {/* Stat callout */}
                  <div
                    className="rounded-xl px-5 py-4 mb-8 border"
                    style={{
                      background: "rgba(255,212,0,0.04)",
                      borderColor: "rgba(255,212,0,0.14)",
                    }}
                  >
                    <div
                      className="font-black leading-none mb-1.5"
                      style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", color: "#FFD400", letterSpacing: "-0.03em" }}
                    >
                      {USE_CASES[active].stat.value}
                    </div>
                    <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                      {USE_CASES[active].stat.label}
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 font-semibold group/link"
                    style={{ fontSize: 14, color: "#FFD400" }}
                  >
                    <span className="link-arrow">
                      Book a Demo <ArrowRight size={13} />
                    </span>
                  </a>
                </div>
              </div>

              {/* Bottom progress strip */}
              <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, rgba(255,212,0,0.4), #FFD400)",
                    width: `${((active + progress) / USE_CASES.length) * 100}%`,
                    transition: paused ? "none" : "width 0.05s linear",
                  }}
                />
              </div>
            </div>

            {/* Dot nav */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {USE_CASES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleManualSelect(i)}
                  className="rounded-full"
                  style={{
                    width: active === i ? 20 : 6,
                    height: 6,
                    background: active === i ? "#FFD400" : "rgba(255,255,255,0.15)",
                    transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.24s ease",
                  }}
                  aria-label={USE_CASES[i].title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Security ─── */
const securityItems = [
  {
    Icon: Shield,
    tag: "Compliance",
    title: "Enterprise Ready",
    desc: "SOC 2 Type II aligned infrastructure and controls. Built for the procurement requirements of global enterprises from day one.",
    points: [
      "SOC 2 Type II aligned controls",
      "Enterprise procurement ready",
      "Audit-ready documentation",
      "Role-based access controls",
    ],
  },
  {
    Icon: Lock,
    tag: "Data",
    title: "Privacy First",
    desc: "Your recordings never leave your designated infrastructure. Zero data sharing across organizations, with full data sovereignty and residency controls.",
    points: [
      "No cross-org data sharing",
      "Full data sovereignty",
      "On-premises deployment option",
      "GDPR & CCPA aligned",
    ],
  },
  {
    Icon: Server,
    tag: "Infrastructure",
    title: "Secure Infrastructure",
    desc: "End-to-end encryption, isolated processing environments, and fully auditable data flows with a complete chain of custody for every recording.",
    points: [
      "End-to-end encryption at rest & in transit",
      "Isolated processing environments",
      "Complete chain of custody",
      "99.9% uptime SLA",
    ],
  },
  {
    Icon: Eye,
    tag: "AI",
    title: "Responsible AI",
    desc: "Explainable intelligence outputs — no black boxes. Every score is auditable, traceable, and anchored to observable, human-verifiable signals.",
    points: [
      "Fully explainable scoring",
      "No black-box outputs",
      "Human-verifiable signals",
      "Bias monitoring & audits",
    ],
  },
];

function SecurityCard({
  Icon, tag, title, desc, points, index,
}: {
  Icon: React.ElementType; tag: string; title: string;
  desc: string; points: string[]; index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useInView(0.08);
  const [done, setDone] = useState(false);
  const delay = index * 80;
  useEffect(() => {
    if (visible) {
      const id = setTimeout(() => setDone(true), 700 + delay);
      return () => clearTimeout(id);
    }
  }, [visible, delay]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border flex flex-col cursor-default relative overflow-hidden"
      style={{
        /* Reveal animation — applied directly so card IS the grid item */
        opacity: visible ? 1 : 0,
        transform: visible
          ? (hovered ? "translateY(-3px)" : "translateY(0)")
          : "translateY(16px)",
        filter: visible ? "blur(0px)" : "blur(2px)",
        transition: [
          `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          `transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          `filter 0.6s ease ${delay}ms`,
          "border-color 0.26s ease",
          "background 0.26s ease",
          "box-shadow 0.26s ease",
        ].join(", "),
        willChange: done ? "auto" : "opacity, transform, filter",
        /* Card chrome */
        background: hovered ? "#111" : "#0c0c0c",
        borderColor: hovered ? "rgba(255,212,0,0.2)" : "rgba(255,255,255,0.07)",
        boxShadow: hovered
          ? "0 20px 56px rgba(0,0,0,0.55), 0 0 64px rgba(255,212,0,0.06)"
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line — hidden at rest, gold on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, #FFD400 50%, transparent)",
          opacity: hovered ? 0.55 : 0,
          transition: "opacity 0.26s ease",
        }}
      />

      {/* Ambient glow — hover only */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,212,0,0.05) 0%, transparent 100%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* ── Card content — identical padding for every card ── */}
      <div className="flex flex-col flex-1 relative" style={{ padding: "36px 36px 44px" }}>

        {/* Row 1: icon + tag */}
        <div className="flex items-start justify-between mb-7">
          <div
            className="rounded-xl flex items-center justify-center border flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              background: hovered ? "rgba(255,212,0,0.08)" : "rgba(255,255,255,0.04)",
              borderColor: hovered ? "rgba(255,212,0,0.24)" : "rgba(255,255,255,0.08)",
              transition: "background 0.26s ease, border-color 0.26s ease",
            }}
          >
            <Icon
              size={20}
              style={{
                color: hovered ? "#FFD400" : "rgba(255,255,255,0.48)",
                transition: "color 0.26s ease, transform 0.26s ease",
                transform: hovered ? "scale(1.1)" : "scale(1)",
              }}
            />
          </div>

          <div
            className="uppercase font-semibold rounded-md border"
            style={{
              fontSize: 9,
              letterSpacing: "0.18em",
              padding: "4px 9px",
              color: "rgba(255,255,255,0.28)",
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {tag}
          </div>
        </div>

        {/* Row 2: title */}
        <h3
          className="font-bold leading-[1.22] mb-3"
          style={{
            fontSize: "1.2rem",
            letterSpacing: "-0.022em",
            color: hovered ? "#fff" : "rgba(255,255,255,0.88)",
            transition: "color 0.26s ease",
          }}
        >
          {title}
        </h3>

        {/* Row 3: description */}
        <p
          className="leading-[1.78] mb-7"
          style={{
            fontSize: 14,
            color: hovered ? "rgba(255,255,255,0.58)" : "rgba(255,255,255,0.44)",
            transition: "color 0.26s ease",
          }}
        >
          {desc}
        </p>

        {/* Row 4: divider */}
        <div
          className="mb-6"
          style={{
            height: 1,
            background: hovered ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
            transition: "background 0.26s ease",
          }}
        />

        {/* Row 5: feature list — pushed to bottom */}
        <div className="flex flex-col gap-3 mt-auto">
          {points.map((pt, j) => (
            <div key={j} className="flex items-center gap-3">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  background: hovered ? "rgba(255,212,0,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${hovered ? "rgba(255,212,0,0.22)" : "rgba(255,255,255,0.09)"}`,
                  transition: `background 0.26s ease ${j * 0.03}s, border-color 0.26s ease ${j * 0.03}s`,
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1.5 4L3.2 5.7L6.5 2.5"
                    stroke={hovered ? "#FFD400" : "rgba(255,255,255,0.3)"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: `stroke 0.26s ease ${j * 0.03}s` }}
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: hovered ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.44)",
                  transition: `color 0.26s ease ${j * 0.03}s`,
                }}
              >
                {pt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Security() {
  return (
    <section
      aria-labelledby="heading-security"
      className="py-22 border-t"
      id="security"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#040404" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Security &amp; Compliance</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <h2 id="heading-security" className="section-h2 max-w-xl">
              Enterprise-grade<br />from day one.
            </h2>
            <p className="section-sub max-w-sm lg:text-right">
              Built with the security posture and compliance readiness that enterprise procurement and legal teams require.
            </p>
          </div>
        </Reveal>

        <div
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{ gap: 32, alignItems: "stretch" }}
        >
          {securityItems.map((item, i) => (
            <SecurityCard key={i} {...item} index={i} />
          ))}
        </div>

        {/* Bottom trust strip */}
        <Reveal delay={200}>
          <div
            className="mt-5 rounded-2xl border flex flex-wrap items-center gap-6 justify-between"
            style={{
              background: "#090909",
              borderColor: "rgba(255,255,255,0.07)",
              padding: "22px 32px",
            }}
          >
            <div
              className="leading-relaxed"
              style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 400 }}
            >
              MIRA is built with enterprise security requirements in mind and undergoes regular security reviews. Compliance documentation available on request.
            </div>
            <div className="flex flex-wrap items-center gap-8">
              {["SOC 2 Aligned", "GDPR Ready", "End-to-End Encrypted", "Audit Logging"].map((badge) => (
                <div key={badge} className="flex items-center gap-2.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="rgba(255,212,0,0.4)" />
                    <path d="M3.5 6L5.2 7.7L8.5 4.5" stroke="#FFD400" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium" style={{ fontSize: 12, color: "rgba(255,255,255,0.52)" }}>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const FAQ_ITEMS = [
  {
    q: "How does MIRA handle data security?",
    a: "All data is processed in isolated, encrypted environments with end-to-end encryption in transit and at rest. MIRA is SOC 2 aligned and supports on-premises deployment for enterprises with strict data residency or compliance requirements.",
  },
  {
    q: "How is participant privacy protected?",
    a: "MIRA analyzes at the group and process level — not individual surveillance. Participant data is anonymized before analysis, never shared across organizations, and never used to train shared models.",
  },
  {
    q: "Which platforms does MIRA integrate with?",
    a: "MIRA connects to Zoom, Microsoft Teams, Webex, and most enterprise LMS and video library systems. Recordings can also be ingested via API or secure file transfer without requiring live meeting access.",
  },
  {
    q: "How accurate are MIRA's understanding scores?",
    a: "In pilot programs, MIRA's understanding scores correlated with post-session assessments at 94% accuracy. Scores are calibrated against domain-specific knowledge frameworks configured by your organization.",
  },
  {
    q: "How do we start a pilot?",
    a: "Request a demo below. We run a short discovery call to assess fit, then onboard qualified organizations into a structured enterprise pilot with dedicated implementation support. We accept a limited number of pilots each quarter.",
  },
];

function FAQItem({ item, value }: { item: { q: string; a: string }; value: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Accordion.Item
      value={value}
      className="border-b group/item"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      <Accordion.Trigger
        className="w-full flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]/50 focus-visible:rounded-sm"
        style={{ padding: "28px 0", gap: 24 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          className="font-semibold leading-snug"
          style={{
            fontSize: 17,
            color: hovered ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.78)",
            transition: "color 0.22s ease",
          }}
        >
          {item.q}
        </span>

        {/* Plus / minus icon that morphs */}
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-full border relative"
          style={{
            width: 32,
            height: 32,
            borderColor: hovered ? "rgba(255,212,0,0.3)" : "rgba(255,255,255,0.1)",
            background: hovered ? "rgba(255,212,0,0.06)" : "transparent",
            transition: "border-color 0.22s ease, background 0.22s ease",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            {/* Horizontal bar — always visible */}
            <line
              x1="1" y1="6" x2="11" y2="6"
              stroke={hovered ? "#FFD400" : "rgba(255,255,255,0.4)"}
              strokeWidth="1.4"
              strokeLinecap="round"
              style={{ transition: "stroke 0.22s ease" }}
            />
            {/* Vertical bar — collapses when open */}
            <line
              x1="6" y1="1" x2="6" y2="11"
              stroke={hovered ? "#FFD400" : "rgba(255,255,255,0.4)"}
              strokeWidth="1.4"
              strokeLinecap="round"
              className="group-data-[state=open]/item:opacity-0"
              style={{
                transformOrigin: "6px 6px",
                transition: "stroke 0.22s ease, opacity 0.22s ease",
              }}
            />
          </svg>
        </span>
      </Accordion.Trigger>

      <Accordion.Content
        className="accordion-content overflow-hidden"
        style={{ overflow: "hidden" }}
      >
        <div style={{ paddingBottom: 28 }}>
          <p
            className="leading-[1.82] max-w-2xl"
            style={{ fontSize: 15.5, color: "rgba(255,255,255,0.54)" }}
          >
            {item.a}
          </p>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function FAQSection() {
  return (
    <section
      aria-labelledby="heading-faq"
      className="py-22 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#000" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">FAQ</div>
          <h2 id="heading-faq" className="section-h2 mb-5">
            Common Questions.
          </h2>
          <p className="section-sub mb-14">
            Everything you need to know before getting started with MIRA.
          </p>
        </Reveal>

        <Reveal>
          <Accordion.Root
            type="single"
            collapsible
            className="max-w-3xl w-full"
            aria-label="Frequently asked questions about MIRA"
          >
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={i} item={item} value={`q${i}`} />
              ))}
            </div>
          </Accordion.Root>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Contact ─── */
type FormState = { name: string; email: string; company: string; message: string };

function contactInputBase(hasErr: boolean): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${hasErr ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.09)"}`,
    color: "white",
    outline: "none",
    transition: "border-color 0.18s ease, background 0.18s ease",
  };
}

function ContactField({
  id, label, type, placeholder, value, onChange, hasError, disabled,
}: {
  id: string; label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  hasError?: boolean; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] text-white/30 uppercase tracking-[0.18em] font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/16"
        style={contactInputBase(!!hasError)}
        onFocus={(e) => {
          if (!hasError) e.target.style.borderColor = "rgba(255,212,0,0.35)";
          e.target.style.background = "rgba(255,255,255,0.045)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.09)";
          e.target.style.background = "rgba(255,255,255,0.03)";
        }}
      />
    </div>
  );
}

function Contact() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", company: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});
  const { status, errorMsg, submit } = useFormSubmit();

  const set = (k: keyof FormState) => (v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = (): Partial<FormState> => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.company.trim()) errs.company = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid work email";
    if (!form.message.trim()) errs.message = "Required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    submit(form);
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <section
      aria-labelledby="heading-contact"
      className="py-22 border-t"
      id="contact"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#040404" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-20 lg:gap-28 items-start">

          {/* ── Left ── */}
          <Reveal>
            <div>
              {/* Scarcity badge */}
              <div className="flex items-center gap-2.5 mb-6 self-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: "rgba(255,212,0,0.28)",
                    background: "rgba(255,212,0,0.06)",
                  }}
                >
                  {/* Pulsing dot */}
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full"
                      style={{ background: "#FFD400", opacity: 0.5, animation: "live-dot 2s ease-in-out infinite" }}
                    />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#FFD400" }} />
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#FFD400" }}>
                    Only 5 Design Partners
                  </span>
                </div>
              </div>

              <div className="eyebrow mb-3">Contact</div>
              <h2 id="heading-contact" className="section-h2 mb-6">
                Ready to see<br />MIRA in action?
              </h2>
              <p className="section-sub max-w-[360px] mb-8">
                We onboard a limited number of design partners each quarter. Request a personalized demo — our team responds within 24 hours.
              </p>

              {/* Urgency signals */}
              <div className="flex flex-col gap-3 mb-12">
                {[
                  { icon: "◆", text: "Personalized 30-minute product walkthrough" },
                  { icon: "◆", text: "Live analysis of your own meeting recordings" },
                  { icon: "◆", text: "Custom ROI assessment for your organization" },
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[5px] mt-[7px] flex-shrink-0" style={{ color: "#FFD400" }}>◆</span>
                    <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>{pt.text}</span>
                  </div>
                ))}
              </div>

              {/* Demo routing notice */}
              <div
                className="rounded-xl px-5 py-4 border mb-8"
                style={{ background: "rgba(255,212,0,0.04)", borderColor: "rgba(255,212,0,0.14)" }}
              >
                <div className="text-[9px] tracking-[0.18em] text-white/28 uppercase font-semibold mb-2.5">
                  Demo requests
                </div>
                <a
                  href="mailto:hello@ai-mira.tech"
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FFD400" }} />
                  <span className="text-sm text-white/55 group-hover:text-white transition-colors duration-200 font-medium">
                    hello@ai-mira.tech
                  </span>
                </a>
              </div>

              {/* Support */}
              <div>
                <div className="text-[9px] tracking-[0.18em] text-white/22 uppercase font-semibold mb-3">
                  Technical support
                </div>
                <a
                  href="mailto:support@ai-mira.tech"
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white/18" />
                  <span className="text-sm text-white/35 group-hover:text-white/70 transition-colors duration-200">
                    support@ai-mira.tech
                  </span>
                </a>
                <p className="text-[11px] text-white/20 mt-2 ml-4 leading-relaxed">
                  For product and integration questions only.
                </p>
              </div>
            </div>
          </Reveal>

          {/* ── Right: form or success ── */}
          <Reveal delay={100}>
            {isSuccess ? (
              /* ── Success state ── */
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: "#0d0d0d", borderColor: "rgba(255,212,0,0.2)" }}
              >
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #FFD400 40%, transparent)" }} />

                <div className="flex flex-col items-center text-center px-10 py-16">
                  <div className="relative mb-8">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center border"
                      style={{ background: "rgba(255,212,0,0.07)", borderColor: "rgba(255,212,0,0.25)" }}
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path d="M6 14.5L11.5 20L22 9" stroke="#FFD400" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round"
                          style={{ strokeDasharray: 28, strokeDashoffset: 0,
                            animation: "dash-in 0.45s cubic-bezier(0.4,0,0.2,1) 0.1s both" }}/>
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
                    Thank you!
                  </h3>
                  <p className="leading-relaxed mb-10 max-w-xs" style={{ fontSize: 15, color: "rgba(255,255,255,0.48)" }}>
                    Your demo request has been received. Our team will contact you within 24 hours.
                  </p>

                  <div className="w-full rounded-xl px-5 py-4 border text-left"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="text-[9px] tracking-[0.18em] text-white/22 uppercase font-semibold mb-3">Sent to</div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FFD400" }} />
                      <span className="text-sm text-white/50 font-medium">hello@ai-mira.tech</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 mt-10 pt-7 border-t w-full" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {[
                      { label: "Response time", value: "≤ 24 hours" },
                      { label: "Demo format",   value: "30 min video call" },
                      { label: "Availability",  value: "Q3 2026" },
                    ].map((item, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className="text-[9px] text-white/20 uppercase tracking-widest mb-1">{item.label}</div>
                        <div className="text-xs font-semibold text-white/48">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label="Request early access to MIRA — demo request form"
                className="rounded-2xl border flex flex-col gap-5 overflow-hidden"
                style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.08)" }}
              >
                {/* Form header */}
                <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="text-[9px] tracking-[0.2em] text-white/22 uppercase font-semibold mb-1.5">
                    Demo request
                  </div>
                  <div className="text-xs text-white/30 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full" style={{ background: "#FFD400" }} />
                    Routed to hello@ai-mira.tech
                  </div>
                </div>

                <div className="px-8 flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <ContactField id="contact-name" label="Full Name" type="text" placeholder="Your full name"
                        value={form.name} onChange={set("name")}
                        hasError={!!fieldErrors.name} disabled={isLoading} />
                      {fieldErrors.name && <p className="text-[10px]" style={{ color: "rgba(239,68,68,0.8)" }}>{fieldErrors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <ContactField id="contact-company" label="Company" type="text" placeholder="Company name"
                        value={form.company} onChange={set("company")}
                        hasError={!!fieldErrors.company} disabled={isLoading} />
                      {fieldErrors.company && <p className="text-[10px]" style={{ color: "rgba(239,68,68,0.8)" }}>{fieldErrors.company}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <ContactField id="contact-email" label="Work Email" type="email" placeholder="you@company.com"
                      value={form.email} onChange={set("email")}
                      hasError={!!fieldErrors.email} disabled={isLoading} />
                    {fieldErrors.email && <p className="text-[10px]" style={{ color: "rgba(239,68,68,0.8)" }}>{fieldErrors.email}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-message" className="text-[10px] text-white/30 uppercase tracking-[0.18em] font-semibold">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Tell us about your team, use case, or the communication workflows you want to analyze..."
                      value={form.message}
                      onChange={(e) => set("message")(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/16 resize-none"
                      style={contactInputBase(!!fieldErrors.message)}
                      onFocus={(e) => {
                        if (!fieldErrors.message) e.target.style.borderColor = "rgba(255,212,0,0.35)";
                        e.target.style.background = "rgba(255,255,255,0.045)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = fieldErrors.message ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.09)";
                        e.target.style.background = "rgba(255,255,255,0.03)";
                      }}
                    />
                    {fieldErrors.message && <p className="text-[10px]" style={{ color: "rgba(239,68,68,0.8)" }}>{fieldErrors.message}</p>}
                  </div>
                </div>

                {/* Network error */}
                {status === "error" && (
                  <div className="mx-8 rounded-lg px-4 py-3 text-[12px] leading-relaxed"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.9)" }}>
                    {errorMsg || "Something went wrong.\nPlease try again or email us at hello@ai-mira.tech"}
                  </div>
                )}

                {/* Submit + footer */}
                <div className="px-8 pb-8 flex flex-col gap-3 mt-1">
                  <button
                    type="submit"
                    className="btn-primary justify-center w-full"
                    disabled={isLoading}
                    style={{
                      opacity: isLoading ? 0.7 : undefined,
                      cursor: isLoading ? "not-allowed" : undefined,
                      animation: isLoading ? "none" : "btn-breathe 3s ease-in-out infinite",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5"/>
                          <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>Request Early Access <ArrowRight size={14} /></>
                    )}
                  </button>
                  <p className="text-[10px] text-white/18 text-center leading-relaxed">
                    Only 5 design partner slots available this quarter.
                  </p>
                </div>
              </form>
            )}
          </Reveal>

        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
/* ─── Leadership ─── */
function Leadership() {
  return (
    <section
      id="about"
      aria-labelledby="heading-leadership"
      className="py-22 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#000" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="eyebrow mb-3">Leadership</div>
          <h2 id="heading-leadership" className="section-h2 mb-14">
            Built by founders who understand enterprise.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          {/* Portrait sits left as a supporting credential; text is the primary focus */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16 lg:gap-24 items-center max-w-4xl">

            {/* Left: Portrait — 240×300 (~20% reduction), vertically centered */}
            <div className="flex items-center justify-center lg:justify-start">
              <div
                style={{
                  width: 240,
                  height: 300,
                  borderRadius: 16,
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <img
                  src={founderPhoto}
                  alt="Sergei Kofanov, Founder and CEO of MIRA"
                  loading="lazy"
                  className="img-interactive"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    objectPosition: "center 10%",
                  }}
                />
              </div>
            </div>

            {/* Right: Content — text-led, editorial spacing */}
            <div className="flex flex-col">

              {/* Founder badge */}
              <div
                className="inline-flex items-center self-start px-3 py-1.5 rounded-md border text-[10px] font-semibold uppercase tracking-[0.18em] mb-7"
                style={{
                  color: "#FFD400",
                  borderColor: "rgba(255,212,0,0.22)",
                  background: "rgba(255,212,0,0.05)",
                }}
              >
                Founder
              </div>

              {/* Name + title */}
              <div className="mb-5">
                <h3
                  className="text-white font-black leading-[1.05] mb-2.5"
                  style={{ fontSize: "clamp(1.75rem, 2.6vw, 2.375rem)", letterSpacing: "-0.03em" }}
                >
                  Sergei Kofanov
                </h3>
                <div className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.005em" }}>
                  Founder &amp; CEO, MIRA
                </div>
              </div>

              {/* Divider */}
              <div className="mb-6" style={{ width: 28, height: 1, background: "rgba(255,212,0,0.25)" }} />

              {/* Bio — text is the primary focus */}
              <p
                className="leading-[1.82] mb-8"
                style={{ fontSize: 15.5, color: "rgba(255,255,255,0.52)", maxWidth: "46ch" }}
              >
                20+ years helping companies build scalable operational systems,
                business intelligence and enterprise transformation. Building AI
                that measures understanding, knowledge transfer and business
                outcomes for enterprise organizations.
              </p>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/sergeikofanov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start text-[13px] font-medium"
                style={{
                  color: "rgba(255,255,255,0.36)",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#5fa8f5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.36)"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>

            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-1.5 w-fit"
      style={{
        fontSize: 13.5,
        color: hovered ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.44)",
        transform: hovered ? "translateX(2px)" : "translateX(0)",
        transition: "color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

function Footer() {
  const colHead = (label: string) => (
    <div style={{
      fontSize: 10,
      letterSpacing: "0.2em",
      color: "rgba(255,255,255,0.24)",
      marginBottom: 24,
      textTransform: "uppercase" as const,
      fontWeight: 600,
    }}>
      {label}
    </div>
  );

  return (
    <footer
      className="border-t"
      style={{ borderColor: "rgba(255,255,255,0.07)", background: "#000" }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-14">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[2.4fr_1fr_1fr_1fr_1fr] gap-x-10 gap-y-16 mb-20">

          {/* Brand block */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <img
              src={logoFull}
              alt="MIRA — AI Intelligence Layer for Enterprise Conversations"
              className="h-7 w-auto mb-7"
              style={{ objectFit: "contain" }}
              loading="lazy"
              width={105}
              height={28}
            />
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.36)", lineHeight: 1.72, maxWidth: 210 }}>
              The intelligence layer for enterprise communication.
            </p>
          </div>

          {/* Platform */}
          <div>
            {colHead("Platform")}
            <div className="flex flex-col gap-[18px]">
              {[
                { label: "Technology", href: "#technology" },
                { label: "Use Cases",  href: "#use-cases" },
                { label: "About",      href: "#about" },
                { label: "Security",   href: "#security" },
              ].map((l) => (
                <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            {colHead("Legal")}
            <div className="flex flex-col gap-[18px]">
              {[
                { label: "Privacy Policy",   href: "mailto:hello@ai-mira.tech?subject=Privacy%20Policy%20Request" },
                { label: "Terms of Service", href: "mailto:hello@ai-mira.tech?subject=Terms%20of%20Service%20Request" },
              ].map((l) => (
                <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            {colHead("Contact")}
            <div className="flex flex-col gap-[18px]">
              <FooterLink href="mailto:hello@ai-mira.tech">hello@ai-mira.tech</FooterLink>
              <FooterLink href="mailto:support@ai-mira.tech">support@ai-mira.tech</FooterLink>
            </div>
          </div>

          {/* Leadership */}
          <div>
            {colHead("Leadership")}
            <FooterLink href="https://www.linkedin.com/in/sergeikofanov" external>
              <span
                className="flex items-center justify-center rounded border flex-shrink-0"
                style={{
                  width: 26,
                  height: 26,
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </span>
              Sergei Kofanov
            </FooterLink>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "0.01em" }}>
            © 2026 MIRA. All rights reserved.
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,212,0,0.55)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.02em" }}>
              Built for enterprise intelligence
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* ─── SEO head injection ─── */
function useSEO() {
  useEffect(() => {
    const SITE_URL = "https://ai-mira.tech";
    const TITLE = "MIRA — AI Intelligence Layer for Enterprise Conversations";
    const DESCRIPTION =
      "MIRA transforms enterprise conversations into measurable business intelligence with real-time understanding, knowledge transfer and AI-powered insights.";
    const KEYWORDS =
      "AI meeting intelligence, conversation intelligence, enterprise AI, meeting analytics, business intelligence, sales enablement, corporate learning analytics, training effectiveness, knowledge transfer, AI meeting assistant, meeting insights, communication intelligence, enterprise communication analytics, business communication AI";
    const OG_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;

    const setMeta = (sel: string, attr: string, val: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(sel);
      if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
      el.setAttribute(attr, val);
      el.setAttribute("content", content);
    };
    const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
      const sizesSel = extra?.sizes ? `[sizes="${extra.sizes}"]` : "";
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${sizesSel}`);
      if (!el) { el = document.createElement("link"); document.head.appendChild(el); }
      el.rel = rel;
      el.href = href;
      if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
    };

    // ── Title ──
    document.title = TITLE;

    // ── Canonical ──
    setLink("canonical", SITE_URL);

    // ── Sitemap discovery ──
    setLink("sitemap", `${SITE_URL}/sitemap.xml`);

    // ── Favicons ──
    setLink("shortcut icon", "/favicon.ico");
    setLink("icon", "/favicon.svg", { type: "image/svg+xml" });
    setLink("icon", "/favicon-32x32.png", { type: "image/png", sizes: "32x32" });
    setLink("icon", "/favicon-16x16.png", { type: "image/png", sizes: "16x16" });
    setLink("apple-touch-icon", "/apple-touch-icon.png", { sizes: "180x180" });
    setLink("manifest", "/site.webmanifest");

    // ── Core meta ──
    setMeta('meta[name="description"]',          "name", "description",          DESCRIPTION);
    setMeta('meta[name="keywords"]',             "name", "keywords",             KEYWORDS);
    setMeta('meta[name="robots"]',               "name", "robots",               "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    setMeta('meta[name="author"]',               "name", "author",               "MIRA Inc.");
    setMeta('meta[name="application-name"]',     "name", "application-name",     "MIRA");
    setMeta('meta[name="theme-color"]',          "name", "theme-color",          "#000000");
    setMeta('meta[name="viewport"]',             "name", "viewport",             "width=device-width, initial-scale=1");

    // ── Open Graph ──
    setMeta('meta[property="og:type"]',          "property", "og:type",          "website");
    setMeta('meta[property="og:url"]',           "property", "og:url",           SITE_URL);
    setMeta('meta[property="og:title"]',         "property", "og:title",         TITLE);
    setMeta('meta[property="og:description"]',   "property", "og:description",   DESCRIPTION);
    setMeta('meta[property="og:image"]',         "property", "og:image",         OG_IMAGE);
    setMeta('meta[property="og:image:width"]',   "property", "og:image:width",   "512");
    setMeta('meta[property="og:image:height"]',  "property", "og:image:height",  "512");
    setMeta('meta[property="og:image:alt"]',     "property", "og:image:alt",     "MIRA | Enterprise Conversation Intelligence Platform");
    setMeta('meta[property="og:site_name"]',     "property", "og:site_name",     "MIRA");
    setMeta('meta[property="og:locale"]',        "property", "og:locale",        "en_US");

    // ── Twitter Card ──
    setMeta('meta[name="twitter:card"]',         "name", "twitter:card",         "summary_large_image");
    setMeta('meta[name="twitter:title"]',        "name", "twitter:title",        TITLE);
    setMeta('meta[name="twitter:description"]',  "name", "twitter:description",  DESCRIPTION);
    setMeta('meta[name="twitter:image"]',        "name", "twitter:image",        OG_IMAGE);
    setMeta('meta[name="twitter:image:alt"]',    "name", "twitter:image:alt",    "MIRA | Enterprise Conversation Intelligence Platform");
    setMeta('meta[name="twitter:site"]',         "name", "twitter:site",         "@ai_mira");
    setMeta('meta[name="twitter:creator"]',      "name", "twitter:creator",      "@ai_mira");

    // ── Schema.org JSON-LD ──
    document.getElementById("schema-org")?.remove();
    document.getElementById("schema-software")?.remove();

    const logoUrl        = `${SITE_URL}/android-chrome-512x512.png`;
    const founderLI      = "https://www.linkedin.com/in/sergeikofanov";
    const today          = new Date().toISOString().split("T")[0];

    const graph = {
      "@context": "https://schema.org",
      "@graph": [

        /* ── Brand ── */
        {
          "@type": "Brand",
          "@id": `${SITE_URL}/#brand`,
          "name": "MIRA",
          "description": "Enterprise AI platform for conversation intelligence",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "@id": `${SITE_URL}/#logo`,
            "url": logoUrl,
            "width": 512,
            "height": 512,
            "caption": "MIRA logo"
          }
        },

        /* ── Person — Founder ── */
        {
          "@type": "Person",
          "@id": `${SITE_URL}/#founder`,
          "name": "Sergei Kofanov",
          "givenName": "Sergei",
          "familyName": "Kofanov",
          "jobTitle": "Founder & CEO",
          "description": "20+ years helping companies build scalable operational systems, business intelligence and enterprise transformation.",
          "url": founderLI,
          "sameAs": [founderLI],
          "worksFor": { "@id": `${SITE_URL}/#organization` }
        },

        /* ── ContactPoint — Sales ── */
        {
          "@type": "ContactPoint",
          "@id": `${SITE_URL}/#contact-sales`,
          "contactType": "sales",
          "email": "hello@ai-mira.tech",
          "availableLanguage": "English",
          "areaServed": "Worldwide"
        },

        /* ── ContactPoint — Support ── */
        {
          "@type": "ContactPoint",
          "@id": `${SITE_URL}/#contact-support`,
          "contactType": "customer support",
          "email": "support@ai-mira.tech",
          "availableLanguage": "English",
          "areaServed": "Worldwide"
        },

        /* ── Organization ── */
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          "name": "MIRA",
          "legalName": "MIRA Inc.",
          "url": SITE_URL,
          "logo": { "@id": `${SITE_URL}/#logo` },
          "brand": { "@id": `${SITE_URL}/#brand` },
          "description": DESCRIPTION,
          "foundingDate": "2024",
          "founder": { "@id": `${SITE_URL}/#founder` },
          "employee": [{ "@id": `${SITE_URL}/#founder` }],
          "contactPoint": [
            { "@id": `${SITE_URL}/#contact-sales` },
            { "@id": `${SITE_URL}/#contact-support` }
          ],
          "sameAs": [founderLI],
          "knowsAbout": [
            "AI Meeting Intelligence",
            "Conversation Intelligence",
            "Enterprise Communication Analytics",
            "Corporate Learning Analytics",
            "Knowledge Transfer Measurement",
            "Sales Enablement AI"
          ]
        },

        /* ── SoftwareApplication ── */
        {
          "@type": "SoftwareApplication",
          "@id": `${SITE_URL}/#software`,
          "name": "MIRA",
          "alternateName": "MIRA Conversation Intelligence",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Conversation Intelligence",
          "operatingSystem": "Web",
          "url": SITE_URL,
          "description": DESCRIPTION,
          "screenshot": logoUrl,
          "softwareVersion": "1.0",
          "releaseNotes": "Early access — enterprise pilot program",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Enterprise pilot program — apply for early access",
            "seller": { "@id": `${SITE_URL}/#organization` }
          },
          "featureList": [
            "AI meeting analysis and transcription",
            "Understanding Score measurement",
            "Engagement and attention tracking",
            "Knowledge Transfer analytics",
            "Learning Quality assessment",
            "Business Outcomes reporting",
            "AI-generated coaching recommendations",
            "Executive summary reports",
            "CRM and LMS integrations"
          ],
          "audience": {
            "@type": "BusinessAudience",
            "audienceType": "Enterprise",
            "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 500 }
          },
          "provider": { "@id": `${SITE_URL}/#organization` }
        },

        /* ── WebSite ── */
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          "url": SITE_URL,
          "name": "MIRA",
          "description": DESCRIPTION,
          "inLanguage": "en-US",
          "publisher": { "@id": `${SITE_URL}/#organization` },
          "copyrightYear": 2026,
          "copyrightHolder": { "@id": `${SITE_URL}/#organization` }
        },

        /* ── WebPage ── */
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/#webpage`,
          "url": SITE_URL,
          "name": TITLE,
          "description": DESCRIPTION,
          "inLanguage": "en-US",
          "isPartOf": { "@id": `${SITE_URL}/#website` },
          "about": { "@id": `${SITE_URL}/#software` },
          "author": { "@id": `${SITE_URL}/#organization` },
          "datePublished": "2024-01-01",
          "dateModified": today,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_URL
              }
            ]
          },
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": logoUrl,
            "width": 512,
            "height": 512
          },
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", "h2", ".section-sub"]
          }
        }

      ]
    };

    const schemaScript = document.createElement("script");
    schemaScript.id = "schema-org";
    schemaScript.type = "application/ld+json";
    schemaScript.textContent = JSON.stringify(graph, null, 2);
    document.head.appendChild(schemaScript);

    // ── Preconnect hints for Google Fonts (Core Web Vitals) ──
    const preconnectFonts = (href: string, crossOrigin?: string) => {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      const el = document.createElement("link");
      el.rel = "preconnect";
      el.href = href;
      if (crossOrigin) el.crossOrigin = crossOrigin;
      document.head.prepend(el);
    };
    preconnectFonts("https://fonts.googleapis.com");
    preconnectFonts("https://fonts.gstatic.com", "anonymous");

    // ── lang attribute ──
    document.documentElement.lang = "en";
  }, []);
}

/* ─── App ─── */
export default function App() {
  useSEO();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div
        className="bg-background text-foreground"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Header />
        <main>
          <Hero />
          <ProblemSection />
          <IntroducingMira />
          <IntelligenceLayer />
          <DashboardPreview />
          <RequestDemoCTA />
          <WhyMira />
          <UseCases />
          <Security />
          <FAQSection />
          <Leadership />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
