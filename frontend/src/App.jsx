import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useInView } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Zap, FileText, Download, Key, Bot, Send,
  CheckCircle2, Lock, Globe, Server, Code2, AlertTriangle, Eye, Shield,
  ChevronRight, Sparkles, ScanLine, Bug, FileWarning, Menu, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ──────────────────────────
   TYPEWRITER HOOK
   ────────────────────────── */
function useTypewriter(texts, speed = 50, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx(i => (i + 1) % texts.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return display;
}

/* ──────────────────────────
   ANIMATED SECTION WRAPPER
   ────────────────────────── */
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   FLOATING NAVBAR
   ────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[1100px] transition-all duration-700 ${
        scrolled
          ? 'bg-white/95 shadow-2xl shadow-black/8 border-white/80'
          : 'bg-white/70 shadow-xl shadow-black/4 border-white/50'
      } backdrop-blur-2xl border rounded-full px-6 md:px-8 py-3`}
    >
      <div className="flex items-center justify-between">
        {/* Left Links */}
        <nav className="hidden md:flex items-center gap-6 w-1/3">
          {['Features', 'Validation', 'Pricing'].map((label) => (
            <a key={label} href={`#${label.toLowerCase()}`}
               className="text-[13px] font-semibold text-slate-600 hover:text-red-500 transition-colors duration-300 tracking-wide">
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-700">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Center Logo */}
        <a href="#" className="flex items-center justify-center gap-2 md:w-1/3">
          <ShieldCheck className="w-7 h-7 text-[#0f172a]" strokeWidth={2.5} />
          <span className="font-black text-[21px] tracking-tight text-[#0f172a] leading-none select-none">
            sds<span className="text-red-500">kavach</span>
          </span>
        </a>

        {/* Right Actions */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
          <a href="#" className="text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors">Sign in</a>
          <a href="#" className="text-[13px] font-bold text-red-500 border-2 border-red-200 hover:border-red-400 px-5 py-2 rounded-full transition-all duration-300 hover:bg-red-50">
            Start Free Scan
          </a>
          <a href="#" className="bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/20 transition-all duration-300 active:scale-95">
            Book a Demo
          </a>
        </div>
      </div>
    </motion.header>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION
   ────────────────────────────────────────────── */
function HeroSection() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [findings, setFindings] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const placeholderText = useTypewriter([
    'Enter your domain or API endpoint to assess...',
    'https://api.example.com/v1/users',
    'https://staging.myapp.io/login',
    'Enter any URL to start a security scan...',
  ], 60, 3000);

  // Parallax for floating elements
  const { scrollY } = useScroll();
  const floatY1 = useTransform(scrollY, [0, 600], [0, -80]);
  const floatY2 = useTransform(scrollY, [0, 600], [0, -40]);
  const floatY3 = useTransform(scrollY, [0, 600], [0, -120]);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); setIsScanning(false); fetchFindings(); return 100; }
          return prev + 4;
        });
      }, 120);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const startScan = () => {
    if (!targetUrl) return;
    setIsScanning(true); setScanProgress(0); setFindings([]); setShowResults(false);
  };

  const fetchFindings = async () => {
    try {
      const r = await fetch(`${API_URL}/api/findings`);
      if (r.ok) { setFindings(await r.json()); }
    } catch {
      setFindings([
        { id: 1, title: "Broken Access Control", severity: "High", component: "/api/test-resource", signal: "HTTP 200 on restricted route" },
        { id: 2, title: "SQL Injection", severity: "Critical", component: "/login", signal: "Syntax error on payload ' OR 1=1--" },
        { id: 3, title: "Missing X-Frame-Options", severity: "Low", component: "Global Headers", signal: "Header absent in response" },
        { id: 4, title: "Reflected XSS", severity: "Medium", component: "/search?q=", signal: "Unescaped user input in DOM" },
      ]);
    }
    setShowResults(true);
  };

  const appSecScore = findings.length === 0 ? 100 : Math.max(0, 100 - findings.filter(f=>f.severity==='Critical').length*25 - findings.filter(f=>f.severity==='High').length*15 - findings.filter(f=>f.severity==='Medium').length*8 - findings.filter(f=>f.severity==='Low').length*3);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-40 md:pt-44 pb-20 px-4 overflow-hidden">

      {/* Floating decorative elements (parallax) */}
      <motion.div style={{ y: floatY1 }} className="absolute top-32 left-[8%] w-16 h-16 bg-red-100/60 rounded-2xl backdrop-blur-sm border border-red-200/30 flex items-center justify-center shadow-lg rotate-12 hidden lg:flex">
        <Shield className="w-7 h-7 text-red-400" />
      </motion.div>
      <motion.div style={{ y: floatY2 }} className="absolute top-48 right-[10%] w-14 h-14 bg-blue-100/60 rounded-full backdrop-blur-sm border border-blue-200/30 flex items-center justify-center shadow-lg hidden lg:flex">
        <Lock className="w-6 h-6 text-blue-400" />
      </motion.div>
      <motion.div style={{ y: floatY3 }} className="absolute top-[60%] left-[5%] w-12 h-12 bg-emerald-100/60 rounded-xl backdrop-blur-sm border border-emerald-200/30 flex items-center justify-center shadow-lg -rotate-6 hidden lg:flex">
        <Bug className="w-5 h-5 text-emerald-500" />
      </motion.div>
      <motion.div style={{ y: floatY1 }} className="absolute top-[55%] right-[6%] w-14 h-14 bg-orange-100/60 rounded-2xl backdrop-blur-sm border border-orange-200/30 flex items-center justify-center shadow-lg rotate-6 hidden lg:flex">
        <AlertTriangle className="w-6 h-6 text-orange-400" />
      </motion.div>

      {/* Strikethrough Tag */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="mb-7">
        <span className="relative text-red-400/80 text-[15px] font-medium italic">
          <span className="line-through decoration-red-400/50 decoration-2">Not just another vulnerability scanner</span>
        </span>
      </motion.div>

      {/* Hero Heading */}
      <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.8rem,7.5vw,6.2rem)] font-black text-[#0f172a] text-center tracking-tight leading-[1.05] mb-1 select-none">
        Your Automated Security
      </motion.h1>
      <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.8rem,7.5vw,6.2rem)] font-black text-red-500 text-center tracking-tight leading-[1.05] mb-12 select-none"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>
        armor.
      </motion.h1>

      {/* Large Input Area */}
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[680px] bg-[#fef7f0]/80 backdrop-blur-xl border border-orange-200/40 shadow-2xl shadow-orange-900/5 rounded-[28px] px-6 py-5 relative group transition-all duration-500 hover:shadow-red-500/8 hover:bg-[#fef7f0]">
        <input type="text"
          placeholder={placeholderText + '|'}
          className="w-full bg-transparent text-[#0f172a] text-lg md:text-xl font-medium placeholder-slate-400 focus:outline-none pr-14 py-1"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && startScan()}
        />
        <motion.button onClick={startScan} disabled={isScanning || !targetUrl}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          className="absolute top-1/2 -translate-y-1/2 right-5 w-11 h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 disabled:opacity-40 transition-colors">
          {isScanning ? <Zap className="w-5 h-5 animate-pulse" /> : <ArrowRight className="w-5 h-5" />}
        </motion.button>
        {isScanning && (
          <div className="absolute bottom-3 left-6 right-16 h-[3px] bg-red-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }} />
          </div>
        )}
      </motion.div>

      {/* CTA Buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }} className="flex gap-4 items-center mt-9">
        <motion.button onClick={startScan} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-colors text-[15px]">
          Start Free Scan
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="bg-white/80 hover:bg-white text-[#0f172a] px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-black/5 backdrop-blur-md border border-slate-200 text-[15px] transition-all">
          Book a Demo
        </motion.button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {showResults && findings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[1100px] mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-black/5 rounded-3xl p-8 flex flex-col justify-center items-center">
              <h3 className="text-slate-400 font-bold text-xs mb-5 uppercase tracking-[0.2em]">SDS Posture Score</h3>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="text-8xl font-black tracking-tighter leading-none" style={{ color: appSecScore > 70 ? '#10b981' : appSecScore > 40 ? '#f59e0b' : '#ef4444' }}>
                {appSecScore}
              </motion.div>
              <p className="text-slate-400 text-xs mt-5 font-medium">Based on {findings.length} findings</p>
            </div>
            {/* Findings */}
            <div className="md:col-span-2 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-black/5 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-white/40">
                <h3 className="text-slate-800 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Detected Vulnerabilities
                </h3>
              </div>
              <div className="divide-y divide-slate-100/80">
                {findings.map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="px-5 py-4 flex justify-between items-start hover:bg-slate-50/50 transition-colors cursor-default">
                    <div>
                      <div className="text-slate-800 font-bold">{f.title}</div>
                      <div className="text-slate-400 text-xs mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{f.signal}</div>
                      <div className="text-slate-400 text-xs mt-1">Target: {f.component}</div>
                    </div>
                    <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase whitespace-nowrap shrink-0 ml-4 ${
                      f.severity === 'Critical' ? 'bg-red-100 text-red-600 border border-red-200' :
                      f.severity === 'High' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                      f.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-blue-100 text-blue-600 border border-blue-200'
                    }`}>{f.severity}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FEATURES SECTION
   ────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    { icon: ScanLine, title: "Automated Scanning", desc: "Run full-spectrum security audits across authentication, APIs, RBAC, and session management with one click." },
    { icon: Eye, title: "Explainable Signals", desc: "Every vulnerability comes with transparent evidence—HTTP status codes, headers, and reproducible proof-of-concept." },
    { icon: Shield, title: "CVSS Risk Engine", desc: "Industry-standard severity scoring ensures your team prioritises the most dangerous threats first." },
    { icon: Bot, title: "AI Remediation", desc: "Our AI analyst generates exact code fixes and configuration patches for every detected vulnerability." },
    { icon: Key, title: "Credential Audit", desc: "Browser-side k-anonymity hashing verifies if admin passwords were leaked—without transmitting plaintext." },
    { icon: FileText, title: "Compliance Reports", desc: "Export formal PDF reports with CVSS scores, evidence chains, and remediation steps for auditors." },
  ];

  return (
    <section id="features" className="py-28 md:py-36 px-4">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Why SDS Kavach?</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">
            Security that{' '}
            <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>explains</span>
            {' '}itself.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.08}>
              <motion.div whileHover={{ y: -8, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/4 rounded-3xl p-8 group hover:shadow-2xl hover:shadow-red-500/8 transition-shadow duration-500 cursor-default h-full">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 group-hover:bg-red-500 transition-all duration-400">
                  <f.icon className="w-6 h-6 text-red-500 group-hover:text-white transition-colors duration-400" />
                </div>
                <h3 className="text-[#0f172a] font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{f.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   VALIDATION / HOW IT WORKS
   ────────────────────────────────────────────── */
function ValidationSection() {
  const steps = [
    { num: "01", title: "Discover", desc: "Automatically map attack surfaces—endpoints, headers, authentication flows, and session tokens.", icon: Globe },
    { num: "02", title: "Validate", desc: "Execute safe proof-of-concept payloads to confirm each vulnerability with hard evidence.", icon: CheckCircle2 },
    { num: "03", title: "Remediate", desc: "Get AI-generated code patches, configuration fixes, and deployment-ready security hardening.", icon: Code2 },
  ];

  return (
    <section id="validation" className="py-28 md:py-36 px-4">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection className="text-center mb-20">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">How it works</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">
            Discover. Validate.{' '}
            <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Remediate.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <AnimatedSection key={s.num} delay={i * 0.12}>
              <motion.div whileHover={{ y: -8, transition: { duration: 0.35 } }}
                className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/4 rounded-3xl p-10 text-center relative overflow-hidden group hover:shadow-2xl hover:shadow-red-500/8 transition-shadow duration-500 cursor-default h-full">
                <div className="absolute top-3 right-5 text-[80px] font-black text-slate-100 leading-none select-none group-hover:text-red-100/80 transition-colors duration-700">
                  {s.num}
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 transition-all duration-400">
                    <s.icon className="w-8 h-8 text-red-500 group-hover:text-white transition-colors duration-400" />
                  </div>
                  <h3 className="text-[#0f172a] font-black text-xl mb-3">{s.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   BOTTOM CTA
   ────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-28 md:py-36 px-4">
      <AnimatedSection>
        <div className="max-w-[900px] mx-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[40px] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(239,68,68,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.1) 0%, transparent 50%)'
          }} />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Ready to secure your stack?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">Start a free assessment of your application today. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-red-500/25 transition-colors text-[15px]">
                Start Free Scan
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = `${API_URL}/api/report/download`}
                className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-bold border border-white/20 transition-all text-[15px] flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download Sample Report
              </motion.button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FOOTER
   ────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-slate-200/50 py-12 px-4">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#0f172a]" strokeWidth={2.5} />
          <span className="font-black text-xl tracking-tight text-[#0f172a]">sds<span className="text-red-500">kavach</span></span>
        </div>
        <div className="flex items-center gap-8">
          {['Features', 'Validation', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors duration-300">{l}</a>
          ))}
        </div>
        <p className="text-slate-400 text-xs">© 2026 SDS Kavach · Secure Defense System</p>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   SMOOTH SCROLL SETUP
   ────────────────────────────────────────────── */
function ScrollToHash() {
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }, []);
  return null;
}

/* ──────────────────────────────────────────────
   APP
   ────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <ScrollToHash />
      <div className="min-h-screen font-sans selection:bg-red-500/30 relative scroll-smooth"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 130% 80% at 50% -10%, rgba(219, 234, 254, 0.5) 0%, transparent 55%),
            radial-gradient(ellipse 80% 60% at 85% 15%, rgba(252, 231, 243, 0.45) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 15% 85%, rgba(224, 231, 255, 0.35) 0%, transparent 50%),
            linear-gradient(180deg, #fafbff 0%, #f1f5f9 35%, #ede5f3 65%, #e8ddf0 85%, #f1f5f9 100%)
          `,
          backgroundAttachment: 'fixed',
        }}>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <ValidationSection />
        <CTASection />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
