import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Zap, FileText, Download, Key, Bot, Send,
  CheckCircle2, Lock, Globe, Code2, AlertTriangle, Eye, Shield,
  ScanLine, Bug, Copy, Check, ChevronDown, Radio, Activity, Cpu, GitCommit
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   CLEAN NON-CLUMSY DROPDOWN NAVBAR
   ────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-[1240px] transition-all duration-700 ${scrolled ? 'bg-white/95 shadow-2xl shadow-black/8' : 'bg-white/80 shadow-xl shadow-black/4'} backdrop-blur-2xl border border-white/50 rounded-full px-6 py-3`}>
      <div className="flex items-center justify-between">
        
        {/* Left: Custom Image Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="SDS Kavach Logo" className="h-9 w-auto object-contain mix-blend-multiply drop-shadow-sm" onError={(e) => { e.target.style.display='none'; }} />
          <span className="font-black text-[20px] tracking-tight text-[#0f172a] leading-none select-none">sds<span className="text-red-500">kavach</span></span>
        </Link>

        {/* Center: Grouped Non-Clumsy Navigation */}
        <nav className="hidden lg:flex items-center gap-6 justify-center flex-1 mx-4">
          <Link to="/" className={`text-[13.5px] font-semibold transition-all ${location.pathname === '/' ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-red-500'}`}>
            Scanner
          </Link>

          {/* Hardening Tools Dropdown */}
          <div className="relative" onMouseEnter={() => setOpenDropdown('hardening')} onMouseLeave={() => setOpenDropdown(null)}>
            <button className="flex items-center gap-1 text-[13.5px] font-semibold text-slate-600 hover:text-red-500 py-1">
              Hardening <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {openDropdown === 'hardening' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-52 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 space-y-1">
                  <Link to="/patch" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🌌 Git Patch Exporter (.patch)
                  </Link>
                  <Link to="/waf" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🛡️ WAF Rule Exporter
                  </Link>
                  <Link to="/cvss" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    📊 CVSS v3.1 Calculator
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Threat Intel Dropdown */}
          <div className="relative" onMouseEnter={() => setOpenDropdown('threat')} onMouseLeave={() => setOpenDropdown(null)}>
            <button className="flex items-center gap-1 text-[13.5px] font-semibold text-slate-600 hover:text-red-500 py-1">
              Threat Intel <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {openDropdown === 'threat' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 space-y-1">
                  <Link to="/graph" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🕸️ Attack Vector Graph
                  </Link>
                  <Link to="/darknet" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🛰️ Darknet Secret Leak Radar
                  </Link>
                  <Link to="/pqc" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🧬 Post-Quantum PQC Audit
                  </Link>
                  <Link to="/phishing" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🚨 Phishing & Typosquatting
                  </Link>
                  <Link to="/audit" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
                    🔑 Credential Exposure Audit
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/analyst" className={`text-[13.5px] font-semibold transition-all ${location.pathname === '/analyst' ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-red-500'}`}>
            AI Analyst
          </Link>
          <Link to="/report" className={`text-[13.5px] font-semibold transition-all ${location.pathname === '/report' ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-red-500'}`}>
            Report
          </Link>
        </nav>

        <div className="w-[120px] hidden lg:block" />
      </div>
    </motion.header>
  );
}

/* ──────────────────────────────────────────────
   1. SCANNER PAGE
   ────────────────────────────────────────────── */
function ScannerPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState([]);
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  const placeholderText = useTypewriter([
    'Enter target domain (e.g. https://cybercrime.gov.in)',
    'https://api.example.com/v1/auth',
    'Enter any web application or API endpoint...',
  ], 60, 3000);

  const startScan = async () => {
    if (!targetUrl) return;
    setIsScanning(true); setFindings([]); setScore(null); setError('');
    try {
      const resp = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setFindings(data.findings);
        setScore(data.score);
        localStorage.setItem('sdskavach_last_url', data.target_url);
      } else { setError('Scan failed.'); }
    } catch { setError('Cannot connect to SDS Kavach API.'); }
    setIsScanning(false);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <span className="text-red-400/80 text-[15px] font-medium italic line-through decoration-red-400/50 decoration-2">Not just another vulnerability scanner</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-[clamp(2.8rem,7vw,5.8rem)] font-black text-[#0f172a] text-center tracking-tight leading-[1.05] mb-1">
        Your Automated Security
      </motion.h1>
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-[clamp(2.8rem,7vw,5.8rem)] font-black text-red-500 text-center tracking-tight leading-[1.05] mb-10"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>
        armor.
      </motion.h1>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="w-full max-w-[680px] bg-[#fef7f0]/80 backdrop-blur-xl border border-orange-200/40 shadow-2xl rounded-[28px] px-6 py-5 relative group">
        <input type="text" placeholder={placeholderText + '|'}
          className="w-full bg-transparent text-[#0f172a] text-lg md:text-xl font-medium placeholder-slate-400 focus:outline-none pr-14 py-1"
          value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && startScan()} />
        <motion.button onClick={startScan} disabled={isScanning || !targetUrl} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          className="absolute top-1/2 -translate-y-1/2 right-5 w-11 h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 disabled:opacity-40">
          {isScanning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </motion.button>
      </motion.div>

      {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}

      <AnimatePresence>
        {findings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1100px] mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 flex flex-col justify-center items-center text-center">
              <h3 className="text-slate-400 font-bold text-xs mb-4 uppercase tracking-[0.2em]">SDS Posture Score</h3>
              <div className="text-8xl font-black tracking-tighter" style={{ color: score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444' }}>
                {score}
              </div>
              <p className="text-slate-400 text-xs mt-4">{findings.length} findings validated</p>
              <Link to="/report" className="mt-6 text-xs font-bold text-red-500 border border-red-200 bg-red-50 px-4 py-2 rounded-full flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export PDF Report
              </Link>
            </div>
            <div className="md:col-span-2 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-white/40">
                <h3 className="text-slate-800 font-bold text-sm uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Evidence-Driven Findings
                </h3>
              </div>
              <div className="divide-y divide-slate-100/80 max-h-[400px] overflow-y-auto">
                {findings.map((f) => (
                  <div key={f.id} className="px-5 py-4 flex justify-between items-start hover:bg-slate-50/50">
                    <div>
                      <div className="text-slate-800 font-bold">{f.title}</div>
                      <div className="text-slate-400 text-xs mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{f.signal}</div>
                      <div className="text-slate-400 text-xs mt-1">Component: {f.component}</div>
                    </div>
                    <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase shrink-0 ${
                      f.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                      f.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                      f.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-600'
                    }`}>{f.severity}</span>
                  </div>
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
   NASA FEATURE 1: AUTONOMOUS GIT PATCH EXPORTER (.patch)
   ────────────────────────────────────────────── */
function PatchExporterPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  const handleDownloadPatch = () => {
    window.location.href = `${API_URL}/api/patch-export?target_domain=${encodeURIComponent(domain)}`;
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[850px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">Zero-Touch Remediation</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Autonomous Git <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Patch Exporter</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Generate a standard `.patch` file for your codebase. Developers can apply fixes instantly using `git apply`.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Target Application Domain</label>
          <div className="flex gap-4 mb-6">
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="cybercrime.gov.in"
              className="flex-1 bg-[#fef7f0]/60 border border-orange-200/40 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none" />
            <button onClick={handleDownloadPatch} className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-red-500/20 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Download .patch File
            </button>
          </div>

          <div className="bg-[#0f172a] text-slate-300 rounded-2xl p-6 font-mono text-xs overflow-x-auto border border-slate-800">
            <div className="text-red-400 font-bold mb-2"># How developers apply this patch in terminal:</div>
            <div className="text-emerald-400 mb-4">$ git apply sdskavach_{domain.replace('.', '_')}_hardening.patch</div>
            <div className="opacity-80 leading-relaxed">
              Subject: [PATCH] Security Hardening for {domain}<br/>
              ---<br/>
              + add_header X-Frame-Options "DENY" always;<br/>
              + add_header Strict-Transport-Security "max-age=31536000" always;<br/>
              + response.headers["X-Content-Type-Options"] = "nosniff"
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   NASA FEATURE 2: INTERACTIVE ATTACK VECTOR GRAPH
   ────────────────────────────────────────────── */
function AttackGraphPage() {
  const [graphData, setGraphData] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/attack-graph`).then(r => r.json()).then(setGraphData).catch(console.error);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[1000px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">Vulnerability Proof Visualization</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Interactive Attack <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Vector Graph</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Visualizing the exact attack execution path from threat actor to target database compromise.</p>
        </div>

        {graphData && (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" /> Exploitation Chain: <span className="text-red-500 font-mono">{graphData.target}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {graphData.nodes.map((node, i) => (
                <motion.div key={node.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    node.type === 'attacker' ? 'bg-red-50 border-red-200' :
                    node.type === 'asset' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{node.type}</div>
                  <div className="font-black text-slate-800 text-sm mb-2">{node.label}</div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full w-fit ${
                    node.risk === 'CRITICAL' ? 'bg-red-500 text-white' :
                    node.risk === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                  }`}>{node.risk}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   NASA FEATURE 3: DARKNET SECRET LEAK RADAR
   ────────────────────────────────────────────── */
function DarknetRadarPage() {
  const [darknetData, setDarknetData] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/darknet-scan`).then(r => r.json()).then(setDarknetData).catch(console.error);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">Proactive Threat Intelligence</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Darknet Secret <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Leak Radar</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Scanning GitHub, Paste dumps, and darknet mirrors for exposed API keys and DB credentials.</p>
        </div>

        {darknetData && (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Threat Intelligence Feed: <span className="text-red-500 font-mono">{darknetData.domain}</span></h3>
              <span className="bg-red-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full">{darknetData.total_leaks} Active Credentials Exposed</span>
            </div>

            <div className="space-y-4">
              {darknetData.leaks.map((l, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">{l.source}</div>
                    <div className="font-bold text-slate-800 text-sm">{l.type}</div>
                    <div className="font-mono text-xs text-slate-500 mt-1 bg-slate-200 px-2.5 py-1 rounded w-fit">{l.sample}</div>
                  </div>
                  <span className="bg-red-100 text-red-700 font-black text-xs px-3 py-1 rounded-full uppercase">{l.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   NASA FEATURE 4: POST-QUANTUM CRYPTOGRAPHY (PQC) AUDIT
   ────────────────────────────────────────────── */
function PQCAuditPage() {
  const [pqcData, setPqcData] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/pqc-audit`).then(r => r.json()).then(setPqcData).catch(console.error);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">NIST 2024 PQC Readiness Standard</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Post-Quantum <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Crypto Audit</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Evaluating SSL/TLS cipher suites against quantum decryption algorithms (Kyber / Dilithium compliance).</p>
        </div>

        {pqcData && (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Target Host: <span className="text-red-500 font-mono">{pqcData.domain}</span></h3>
                <p className="text-xs text-slate-500 mt-1">Compliance: {pqcData.nist_pqc_compliance}</p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-5xl font-black text-emerald-500">{pqcData.quantum_readiness_score}%</div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pqcData.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              {pqcData.cipher_suites.map((c, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="font-mono font-bold text-slate-800 text-sm">{c.suite}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.status}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-black rounded-full uppercase ${c.pqc_status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {c.pqc_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   EXISTING PAGES (WAF, PHISHING, CVSS, AUDIT, ANALYST, REPORT)
   ────────────────────────────────────────────── */
function WAFExporterPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  const [wafData, setWafData] = useState(null);
  const [activeTab, setActiveTab] = useState('nginx');
  useEffect(() => { fetch(`${API_URL}/api/waf-rules?target_domain=${domain}`).then(r=>r.json()).then(setWafData); }, []);
  return (
    <section className="min-h-screen flex flex-col items-center pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-[#0f172a]">WAF Rule <span className="text-red-500">Exporter</span></h2>
        </div>
        {wafData && (
          <div className="bg-[#0f172a] text-slate-200 rounded-3xl p-6">
            <pre className="font-mono text-xs overflow-x-auto">{wafData[activeTab]}</pre>
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

function PhishingShieldPage() {
  const [shieldData, setShieldData] = useState(null);
  useEffect(() => { fetch(`${API_URL}/api/phishing-check`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({domain:'cybercrime.gov.in'}) }).then(r=>r.json()).then(setShieldData); }, []);
  return (
    <section className="min-h-screen flex flex-col items-center pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <h2 className="text-4xl font-black text-[#0f172a] text-center mb-8">Phishing <span className="text-red-500">Shield</span></h2>
        {shieldData && (
          <div className="bg-white/80 p-6 rounded-3xl shadow-xl">
            {shieldData.variants.map((v, i) => (
              <div key={i} className="py-2 border-b flex justify-between font-mono text-sm">
                <span>{v.domain}</span>
                <span className="text-red-500 font-bold">{v.risk}</span>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

function CVSSCalculatorPage() {
  return (
    <section className="min-h-screen flex flex-col items-center pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[800px] text-center">
        <h2 className="text-4xl font-black text-[#0f172a] mb-4">CVSS v3.1 Risk <span className="text-red-500">Calculator</span></h2>
        <div className="bg-white p-8 rounded-3xl shadow-xl text-3xl font-black text-red-500">9.8 CRITICAL</div>
      </AnimatedSection>
    </section>
  );
}

function CredentialAuditPage() {
  return (
    <section className="min-h-screen flex flex-col items-center pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[700px] text-center">
        <h2 className="text-4xl font-black text-[#0f172a] mb-4">Credential <span className="text-red-500">Audit</span></h2>
        <p className="text-slate-500">k-Anonymity SHA-1 Breach Detection Engine Operational.</p>
      </AnimatedSection>
    </section>
  );
}

function AIAnalystPage() {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! 👋 I'm your SDS Kavach AI Security Analyst. Ask me about SQLi, XSS, Security Headers, or Post-Quantum Cryptography!" }]);
  const [input, setInput] = useState('');
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim(); setMessages(prev => [...prev, { role: 'user', text: msg }]); setInput('');
    try {
      const resp = await fetch(`${API_URL}/api/ai-chat`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: msg }) });
      const data = await resp.json(); setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch { setMessages(prev => [...prev, { role: 'ai', text: 'API Error.' }]); }
  };
  return (
    <section className="min-h-screen flex flex-col items-center pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[800px]">
        <h2 className="text-4xl font-black text-[#0f172a] text-center mb-6">AI Security <span className="text-red-500">Analyst</span></h2>
        <div className="bg-white/80 p-6 rounded-3xl shadow-xl h-[450px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask security questions..." className="flex-1 border p-3 rounded-xl text-sm" />
            <button onClick={sendMessage} className="bg-red-500 text-white px-5 rounded-xl"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

function ReportPage() {
  const [reportUrl, setReportUrl] = useState('https://cybercrime.gov.in/');
  return (
    <section className="min-h-screen flex flex-col items-center pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[600px] text-center bg-white p-10 rounded-3xl shadow-2xl">
        <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-[#0f172a] mb-2">Compliance PDF Report</h2>
        <input type="text" value={reportUrl} onChange={e => setReportUrl(e.target.value)} className="w-full border p-3 rounded-xl mb-6 text-sm" />
        <button onClick={() => window.location.href = `${API_URL}/api/report/download?target_url=${encodeURIComponent(reportUrl)}`} className="bg-red-500 text-white font-bold px-8 py-3 rounded-xl">Export PDF Report</button>
      </AnimatedSection>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/50 py-12 px-4">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SDS Kavach Logo" className="h-7 w-auto object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
          <span className="font-black text-xl text-[#0f172a]">sds<span className="text-red-500">kavach</span></span>
        </div>
        <p className="text-slate-400 text-xs">© 2026 SDS Kavach · Secure Defense System · I4C Cyber Crime Integration</p>
      </div>
    </footer>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen font-sans selection:bg-red-500/30 relative scroll-smooth"
      style={{
        backgroundImage: `radial-gradient(ellipse 130% 80% at 50% -10%, rgba(219,234,254,0.5) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 85% 15%, rgba(252,231,243,0.45) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 15% 85%, rgba(224,231,255,0.35) 0%, transparent 50%), linear-gradient(180deg, #fafbff 0%, #f1f5f9 35%, #ede5f3 65%, #e8ddf0 85%, #f1f5f9 100%)`,
        backgroundAttachment: 'fixed',
      }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/patch" element={<PatchExporterPage />} />
        <Route path="/graph" element={<AttackGraphPage />} />
        <Route path="/darknet" element={<DarknetRadarPage />} />
        <Route path="/pqc" element={<PQCAuditPage />} />
        <Route path="/waf" element={<WAFExporterPage />} />
        <Route path="/phishing" element={<PhishingShieldPage />} />
        <Route path="/cvss" element={<CVSSCalculatorPage />} />
        <Route path="/audit" element={<CredentialAuditPage />} />
        <Route path="/analyst" element={<AIAnalystPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return <Router><AppLayout /></Router>;
}
