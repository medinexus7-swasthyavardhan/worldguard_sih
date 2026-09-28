import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Zap, FileText, Download, Key, Bot, Send,
  CheckCircle2, Lock, Globe, Server, Code2, AlertTriangle, Eye, Shield,
  ChevronRight, Sparkles, ScanLine, Bug, FileWarning
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ──────────────────────────────────────────────
   FLOATING NAVBAR (Deskfirst pill style)
   ────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[1100px] transition-all duration-500 ${
        scrolled ? 'bg-white/90 shadow-2xl shadow-black/10' : 'bg-white/70 shadow-xl shadow-black/5'
      } backdrop-blur-2xl border border-white/60 rounded-full px-8 py-3.5 flex items-center justify-between`}
    >
      {/* Left Links */}
      <nav className="flex items-center gap-7 w-1/3">
        {['Features', 'Validation', 'Risk Assessment', 'Pricing'].map((label) => (
          <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
             className="text-[13px] font-semibold text-slate-700 hover:text-red-500 transition-colors hidden md:block">
            {label}
          </a>
        ))}
      </nav>

      {/* Center Logo */}
      <Link to="/" className="flex items-center justify-center gap-2.5 w-1/3">
        <ShieldCheck className="w-7 h-7 text-[#0f172a]" strokeWidth={2.5} />
        <span className="font-black text-[22px] tracking-tight text-[#0f172a] leading-none">
          sds<span className="text-red-500">kavach</span>
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center justify-end gap-3 w-1/3">
        <a href="#" className="text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors hidden sm:block">
          Sign in
        </a>
        <a href="#" className="text-[13px] font-bold text-red-500 border-2 border-red-500/30 hover:border-red-500 px-5 py-2 rounded-full transition-all hidden sm:block">
          Start Free Scan
        </a>
        <a href="#" className="bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/25 transition-all active:scale-95">
          Book a Demo
        </a>
      </div>
    </motion.header>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION (Pixel-perfect Deskfirst clone)
   ────────────────────────────────────────────── */
function HeroSection() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [findings, setFindings] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            fetchFindings();
            return 100;
          }
          return prev + 4;
        });
      }, 120);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const startScan = () => {
    if (!targetUrl) return;
    setIsScanning(true);
    setScanProgress(0);
    setFindings([]);
    setShowResults(false);
  };

  const fetchFindings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/findings`);
      if (response.ok) {
        const data = await response.json();
        setFindings(data);
      }
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

  const chartData = [
    { name: 'Critical', count: findings.filter(f => f.severity === 'Critical').length, color: '#dc2626' },
    { name: 'High', count: findings.filter(f => f.severity === 'High').length, color: '#ea580c' },
    { name: 'Medium', count: findings.filter(f => f.severity === 'Medium').length, color: '#ca8a04' },
    { name: 'Low', count: findings.filter(f => f.severity === 'Low').length, color: '#2563eb' },
  ];
  const appSecScore = findings.length === 0 ? 100 : Math.max(0, 100 - (chartData[0].count * 25) - (chartData[1].count * 15) - (chartData[2].count * 8) - (chartData[3].count * 3));

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4 overflow-hidden">

      {/* Strikethrough Tag */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-6"
      >
        <span className="relative text-red-400/80 text-[15px] font-medium italic">
          <span className="line-through decoration-red-400/60">Not just another vulnerability scanner</span>
        </span>
      </motion.div>

      {/* Hero Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(3rem,8vw,6.5rem)] font-black text-[#0f172a] text-center tracking-tight leading-[1.05] mb-1"
      >
        Your Automated Security
      </motion.h1>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(3rem,8vw,6.5rem)] font-black text-red-500 text-center tracking-tight leading-[1.05] mb-10"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
      >
        armor.
      </motion.h1>

      {/* Large Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[680px] bg-[#fef7f0]/80 backdrop-blur-xl border border-orange-200/50 shadow-2xl shadow-orange-900/5 rounded-[28px] p-5 relative group transition-all duration-300 hover:shadow-red-500/10 hover:bg-[#fef7f0]/95"
      >
        <input
          type="text"
          placeholder="Enter your domain or API endpoint to assess..."
          className="w-full bg-transparent text-[#0f172a] text-lg md:text-xl font-medium placeholder-[#94a3b8] focus:outline-none pr-16 py-2"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && startScan()}
        />

        <button
          onClick={startScan}
          disabled={isScanning || !targetUrl}
          className="absolute top-1/2 -translate-y-1/2 right-5 w-11 h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-all active:scale-90 disabled:opacity-40"
        >
          {isScanning ? <Zap className="w-5 h-5 animate-pulse" /> : <ArrowRight className="w-5 h-5" />}
        </button>

        {isScanning && (
          <div className="absolute bottom-0 left-8 right-20 h-[3px] bg-red-100 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="flex gap-4 items-center mt-8"
      >
        <button
          onClick={startScan}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/25 transition-all active:scale-95 text-[15px]"
        >
          Start Free Scan
        </button>
        <button className="bg-white/80 hover:bg-white text-[#0f172a] px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-black/5 transition-all backdrop-blur-md border border-slate-200/80 text-[15px]">
          Book a Demo
        </button>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && findings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[1100px] mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Posture Score Card */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-black/5 rounded-3xl p-8 flex flex-col justify-center items-center">
              <h3 className="text-slate-400 font-bold text-xs mb-6 uppercase tracking-[0.2em]">SDS Posture Score</h3>
              <div className="text-8xl font-black tracking-tighter leading-none" style={{ color: appSecScore > 70 ? '#10b981' : appSecScore > 40 ? '#f59e0b' : '#ef4444' }}>
                {appSecScore}
              </div>
              <p className="text-slate-400 text-xs mt-6 font-medium">Based on {findings.length} findings</p>
            </div>

            {/* Findings Table */}
            <div className="md:col-span-2 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-black/5 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-white/40">
                <h3 className="text-slate-800 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Detected Vulnerabilities
                </h3>
              </div>
              <div className="divide-y divide-slate-100/80">
                {findings.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="px-6 py-4 flex justify-between items-start hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <div className="text-slate-800 font-bold">{f.title}</div>
                      <div className="text-slate-400 text-sm mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded text-xs">
                        {f.signal}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">Target: {f.component}</div>
                    </div>
                    <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase whitespace-nowrap ${
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
    <section id="features" className="py-32 px-4">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Why SDS Kavach?</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">
            Security that <span className="text-red-500 italic" style={{ fontFamily: 'Georgia, serif' }}>explains</span> itself.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/5 rounded-3xl p-8 group hover:shadow-red-500/10 transition-shadow duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                <f.icon className="w-6 h-6 text-red-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-[#0f172a] font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   VALIDATION SECTION
   ────────────────────────────────────────────── */
function ValidationSection() {
  const steps = [
    { num: "01", title: "Discover", desc: "Automatically map attack surfaces—endpoints, headers, authentication flows, and session tokens.", icon: Globe },
    { num: "02", title: "Validate", desc: "Execute safe proof-of-concept payloads to confirm each vulnerability with hard evidence.", icon: CheckCircle2 },
    { num: "03", title: "Remediate", desc: "Get AI-generated code patches, configuration fixes, and deployment-ready security hardening.", icon: Code2 },
  ];

  return (
    <section id="validation" className="py-32 px-4">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">How it works</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">
            Discover. Validate. <span className="text-red-500 italic" style={{ fontFamily: 'Georgia, serif' }}>Remediate.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/5 rounded-3xl p-10 text-center relative overflow-hidden group"
            >
              <div className="absolute top-4 right-6 text-[80px] font-black text-slate-100 leading-none select-none group-hover:text-red-100 transition-colors duration-500">
                {s.num}
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 transition-all duration-300">
                  <s.icon className="w-8 h-8 text-red-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[#0f172a] font-black text-xl mb-3">{s.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   CTA SECTION
   ────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-[900px] mx-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[40px] p-16 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTJ2LTZoMnptMC0yaDJ2MmgtMnYtMnptLTIgMGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Ready to secure your stack?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Start a free assessment of your application today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-red-500/25 transition-all active:scale-95 text-[15px]">
              Start Free Scan
            </button>
            <button
              onClick={() => window.location.href = `${API_URL}/api/report/download`}
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-bold border border-white/20 transition-all text-[15px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Sample Report
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FOOTER
   ────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-slate-200/60 py-12 px-4">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-[#0f172a]" strokeWidth={2.5} />
          <span className="font-black text-xl tracking-tight text-[#0f172a]">
            sds<span className="text-red-500">kavach</span>
          </span>
        </div>
        <div className="flex items-center gap-8">
          {['Features', 'Validation', 'Risk Assessment', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-slate-400 text-xs">© 2026 SDS Kavach. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   MAIN APP LAYOUT
   ────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <div
        className="min-h-screen font-sans selection:bg-red-500/30 relative"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(219, 234, 254, 0.6) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 80% 20%, rgba(252, 231, 243, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(224, 231, 255, 0.4) 0%, transparent 50%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #e8e0f0 70%, #ddd6fe20 100%)
          `,
          backgroundAttachment: 'fixed',
        }}
      >
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
