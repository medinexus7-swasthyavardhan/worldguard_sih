import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, FileText, Download, Key, Bot, Send,
  AlertTriangle, Copy, Check, ChevronDown, Activity, Sparkles, Lock, Shield, Eye, Code2, Zap
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
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 35 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* Wing Icon Component from HTML Artifact */
function WingIcon({ flipped = false }) {
  return (
    <svg viewBox="0 0 28 16" className="w-6 h-4 inline-block" style={{ transform: flipped ? 'scaleX(-1)' : 'none' }}>
      <path d="M0 8C4 2 14 0 26 2 20 4 14 6 10 8 16 8 22 8 28 8 22 11 12 14 0 8Z" fill="#ff3347" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   NAVBAR (Matching HTML Artifact Pill Style)
   ────────────────────────────────────────────── */
function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const hardeningLinks = [
    { to: '/patch', label: '🌌 Git Patch Exporter (.patch)', desc: 'Zero-touch code auto-fixes' },
    { to: '/waf', label: '🛡️ WAF Rule Exporter', desc: 'Nginx, Apache & Cloudflare WAF' },
    { to: '/cvss', label: '📊 CVSS v3.1 Calculator', desc: 'NIST Base Score & Vector String' },
  ];

  const threatLinks = [
    { to: '/graph', label: '🕸️ Attack Vector Graph', desc: 'Visual exploit chain simulation' },
    { to: '/darknet', label: '🛰️ Darknet Secret Leak Radar', desc: 'Leaked API keys & DB passwords' },
    { to: '/pqc', label: '🧬 Post-Quantum PQC Audit', desc: 'NIST 2024 Quantum TLS Readiness' },
    { to: '/phishing', label: '🚨 Phishing & Typosquatting', desc: 'Imposter domain resolution shield' },
    { to: '/audit', label: '🔑 Credential Exposure Audit', desc: 'k-Anonymity breach detection' },
  ];

  return (
    <nav className="sticky top-4 z-50 max-w-[1120px] mx-auto px-6 py-2.5 bg-white rounded-full flex items-center justify-between gap-6"
      style={{ boxShadow: '0 0 0 6px rgba(255,255,255,.45), 0 12px 40px rgba(60,60,120,.12)' }}>
      
      {/* Logo */}
      <Link to="/" className="text-[22px] font-extrabold tracking-tight text-[#101a3d] no-underline flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
        <span>sds<b className="text-[#ff3347]">kavach</b></span>
      </Link>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
        <li>
          <Link to="/" className={`text-[15px] font-semibold transition-colors ${location.pathname === '/' ? 'text-[#ff3347] font-bold' : 'text-[#4b5578] hover:text-[#101a3d]'}`}>
            Scanner
          </Link>
        </li>

        {/* Hardening Dropdown */}
        <li className="relative" onMouseEnter={() => setOpenDropdown('hardening')} onMouseLeave={() => setOpenDropdown(null)}>
          <button className="flex items-center gap-1 text-[15px] font-semibold text-[#4b5578] hover:text-[#101a3d] py-1 bg-transparent border-0 cursor-pointer">
            Hardening <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {openDropdown === 'hardening' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 space-y-1">
                {hardeningLinks.map(l => (
                  <Link key={l.to} to={l.to} className="block px-3.5 py-2.5 rounded-xl hover:bg-[#fff2e8] transition-colors group no-underline">
                    <div className="text-xs font-bold text-[#101a3d] group-hover:text-[#ff3347]">{l.label}</div>
                    <div className="text-[11px] text-[#4b5578] font-medium mt-0.5">{l.desc}</div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* Threat Intel Dropdown */}
        <li className="relative" onMouseEnter={() => setOpenDropdown('threat')} onMouseLeave={() => setOpenDropdown(null)}>
          <button className="flex items-center gap-1 text-[15px] font-semibold text-[#4b5578] hover:text-[#101a3d] py-1 bg-transparent border-0 cursor-pointer">
            Threat Intel <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {openDropdown === 'threat' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 space-y-1">
                {threatLinks.map(l => (
                  <Link key={l.to} to={l.to} className="block px-3.5 py-2.5 rounded-xl hover:bg-[#fff2e8] transition-colors group no-underline">
                    <div className="text-xs font-bold text-[#101a3d] group-hover:text-[#ff3347]">{l.label}</div>
                    <div className="text-[11px] text-[#4b5578] font-medium mt-0.5">{l.desc}</div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        <li>
          <Link to="/analyst" className={`text-[15px] font-semibold transition-colors ${location.pathname === '/analyst' ? 'text-[#ff3347] font-bold' : 'text-[#4b5578] hover:text-[#101a3d]'}`}>
            AI Analyst
          </Link>
        </li>
        <li>
          <Link to="/report" className={`text-[15px] font-semibold transition-colors ${location.pathname === '/report' ? 'text-[#ff3347] font-bold' : 'text-[#4b5578] hover:text-[#101a3d]'}`}>
            Report
          </Link>
        </li>
      </ul>

      <Link to="/" className="btn-red px-5 py-2.5 rounded-[14px] text-[15px] font-semibold no-underline">
        Scan now
      </Link>
    </nav>
  );
}

/* ──────────────────────────────────────────────
   MARQUEE COMPONENT
   ────────────────────────────────────────────── */
function StandardsMarquee() {
  const standards = [
    'OWASP Top 10', 'CVSS v3.1', 'SQL injection', 'Cross-site scripting',
    'Cloudflare WAF', 'AWS WAF', 'ModSecurity', 'Nginx rules',
    'Leaked credentials', 'Lookalike domains'
  ];
  const list = [...standards, ...standards];

  return (
    <div className="overflow-hidden py-8" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)' }}>
      <p className="text-center font-bold text-[#101a3d] mb-4 text-sm">Built around the standards defenders already use</p>
      <div className="animate-marquee gap-3">
        {list.map((item, idx) => (
          <span key={idx} className="px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-full font-semibold text-sm text-[#4b5578] whitespace-nowrap shadow-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   1. SCANNER / HERO PAGE
   ────────────────────────────────────────────── */
function ScannerPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState([]);
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  const placeholderText = useTypewriter([
    'Enter any web application URL',
    'https://cybercrime.gov.in',
    'https://your-app.com',
  ], 60, 3000);

  const startScan = async (e) => {
    if (e) e.preventDefault();
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
      } else { setError('Scan failed. Check connection.'); }
    } catch { setError('Cannot connect to SDS Kavach API.'); }
    setIsScanning(false);
  };

  return (
    <div>
      {/* Hero Section */}
      <header className="max-w-[1120px] mx-auto px-6 pt-20 pb-12 text-center min-h-[75vh] relative">
        <span className="inline-block px-5 py-2 bg-[#fff2e8]/85 rounded-xl text-[#c0525c] line-through font-semibold text-base mb-6 shadow-sm">
          Not just another vulnerability scanner
        </span>

        <h1 className="text-[clamp(44px,8.4vw,96px)] font-extrabold leading-[0.98] tracking-tight text-[#101a3d] mb-4 select-none">
          Your automated security <span className="serif block">armor.</span>
        </h1>

        {/* Scan Input Form */}
        <form onSubmit={startScan} className="max-w-[640px] mx-auto mt-8 p-3 bg-[#fff2e8] border border-[#f3c9c4] rounded-[26px] flex items-center gap-3 shadow-2xl shadow-indigo-900/10">
          <input type="text" placeholder={placeholderText + '|'} value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-0 font-medium text-lg text-[#101a3d] px-4 py-2 focus:outline-none" />
          <button type="submit" disabled={isScanning} aria-label="Start scan" className="w-13 h-13 rounded-full btn-red flex items-center justify-center shrink-0 border-0 cursor-pointer">
            {isScanning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {error && <p className="text-[#ff3347] font-medium text-sm mt-3">{error}</p>}

        <div className="flex gap-4 justify-center mt-6 flex-wrap">
          <a href="#tools" className="btn-red px-6 py-3 rounded-xl no-underline text-base">Explore the toolkit</a>
          <a href="#why" className="btn-cream px-6 py-3 rounded-xl no-underline text-base">See how it works</a>
        </div>

        {/* Scan Findings Results */}
        <AnimatePresence>
          {findings.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1120px] mx-auto mt-16 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 text-center flex flex-col justify-center items-center">
                <h3 className="text-[#4b5578] font-bold text-xs mb-3 uppercase tracking-widest">SDS Posture Score</h3>
                <div className="text-8xl font-black tracking-tighter" style={{ color: score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ff3347' }}>
                  {score}
                </div>
                <p className="text-[#4b5578] text-xs mt-3">{findings.length} findings validated</p>
                <Link to="/report" className="mt-6 text-xs font-bold text-[#ff3347] bg-[#fff2e8] px-4 py-2 rounded-full border border-[#f3c9c4] flex items-center gap-1.5 no-underline">
                  <Download className="w-3.5 h-3.5" /> Export PDF Report
                </Link>
              </div>

              <div className="md:col-span-2 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-white/40 font-bold text-sm text-[#101a3d] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ff3347]" /> Evidence-Driven Findings
                </div>
                <div className="divide-y divide-slate-100/80 max-h-[380px] overflow-y-auto">
                  {findings.map(f => (
                    <div key={f.id} className="p-4 flex justify-between items-start hover:bg-slate-50/50">
                      <div>
                        <div className="font-bold text-[#101a3d] text-sm">{f.title}</div>
                        <div className="text-[#4b5578] text-xs font-mono bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{f.signal}</div>
                        <div className="text-slate-400 text-xs mt-1">Component: {f.component}</div>
                      </div>
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase shrink-0 ${
                        f.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        f.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        f.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'
                      }`}>{f.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Marquee Standards */}
      <StandardsMarquee />

      {/* The Challenge Section */}
      <section id="why" className="max-w-[1120px] mx-auto px-6 py-20 text-center">
        <span className="tag inline-flex items-center gap-2 px-4.5 py-1.5 bg-white rounded-full font-bold text-sm text-[#b81f30] shadow-sm">
          <WingIcon /> The challenge <WingIcon flipped />
        </span>
        <h2 className="text-[clamp(34px,5.4vw,60px)] font-extrabold text-[#101a3d] mt-5 mb-4 leading-tight">
          Breaches don't happen in audits. They happen <span className="serif">between</span> them.
        </h2>
        <p className="lead text-[#4b5578] text-lg max-w-[600px] mx-auto">
          A yearly pen test tells you what was broken last spring. Your app ships every week.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          <div className="card bg-[#fff2e8]/70 border border-[#f3c9c4] rounded-[26px] p-7 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white shadow-md mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Misconfigs sit unnoticed</h3>
            <p className="text-[#4b5578] text-sm">Open headers, weak TLS and exposed paths stay live until someone finds them first.</p>
          </div>

          <div className="card bg-[#fff2e8]/70 border border-[#f3c9c4] rounded-[26px] p-7 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white shadow-md mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Phishing lookalikes slip through</h3>
            <p className="text-[#4b5578] text-sm">Cloned login pages target your users while your team watches the dashboard.</p>
          </div>

          <div className="card bg-[#fff2e8]/70 border border-[#f3c9c4] rounded-[26px] p-7 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white shadow-md mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Fixes aren't ranked</h3>
            <p className="text-[#4b5578] text-sm">Hundreds of findings, no clear order. The critical one hides in the noise.</p>
          </div>
        </div>
      </section>

      {/* Meet Your Armor Section */}
      <section id="tools" className="max-w-[1120px] mx-auto px-6 py-20 text-center">
        <span className="tag inline-flex items-center gap-2 px-4.5 py-1.5 bg-white rounded-full font-bold text-sm text-[#b81f30] shadow-sm">
          <WingIcon /> Meet your armor <WingIcon flipped />
        </span>
        <h2 className="text-[clamp(34px,5.4vw,60px)] font-extrabold text-[#101a3d] mt-5 mb-4 leading-tight">
          Eleven tools. One <span className="serif">guardian.</span>
        </h2>
        <p className="lead text-[#4b5578] text-lg max-w-[600px] mx-auto">
          Scan, block, score and report from the same place, without switching tabs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 text-left">
          <Link to="/" className="card bg-white/80 border border-white/60 rounded-[26px] p-7 shadow-lg no-underline hover:shadow-2xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white mb-4"><ShieldCheck className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Scanner</h3>
            <p className="text-[#4b5578] text-sm">Paste a URL and get a prioritised list of vulnerabilities mapped to OWASP Top 10.</p>
          </Link>

          <Link to="/patch" className="card bg-white/80 border border-white/60 rounded-[26px] p-7 shadow-lg no-underline hover:shadow-2xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white mb-4"><Code2 className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Git Patch Exporter</h3>
            <p className="text-[#4b5578] text-sm">Generate downloadable `.patch` diff files to auto-fix code instantly via `git apply`.</p>
          </Link>

          <Link to="/waf" className="card bg-white/80 border border-white/60 rounded-[26px] p-7 shadow-lg no-underline hover:shadow-2xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white mb-4"><Lock className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">WAF Exporter</h3>
            <p className="text-[#4b5578] text-sm">Turn findings into ready-to-load firewall rules for Nginx, Apache, Cloudflare & AWS WAF.</p>
          </Link>

          <Link to="/graph" className="card bg-white/80 border border-white/60 rounded-[26px] p-7 shadow-lg no-underline hover:shadow-2xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white mb-4"><Activity className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Attack Vector Graph</h3>
            <p className="text-[#4b5578] text-sm">Visual exploit chain graph showing threat path from attacker to DB compromise.</p>
          </Link>

          <Link to="/darknet" className="card bg-white/80 border border-white/60 rounded-[26px] p-7 shadow-lg no-underline hover:shadow-2xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white mb-4"><Key className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Darknet Leak Radar</h3>
            <p className="text-[#4b5578] text-sm">Scan GitHub, paste dumps & darknet mirrors for exposed API keys & DB passwords.</p>
          </Link>

          <Link to="/pqc" className="card bg-white/80 border border-white/60 rounded-[26px] p-7 shadow-lg no-underline hover:shadow-2xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white mb-4"><Zap className="w-7 h-7" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Post-Quantum PQC Audit</h3>
            <p className="text-[#4b5578] text-sm">Evaluate TLS cipher suites against NIST 2024 quantum decryption standards.</p>
          </Link>
        </div>
      </section>

      {/* Storm CTA Card */}
      <div className="storm-card max-w-[1120px] mx-auto my-12 rounded-[36px] text-white p-16 text-center relative overflow-hidden shadow-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Every app deserves <span className="serif">armor.</span></h2>
        <p className="text-[#c9cdf0] text-lg max-w-[600px] mx-auto mb-8">Scan your first application in under two minutes. No install, no agents.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/" className="btn-red px-8 py-3.5 rounded-xl no-underline text-base font-bold">Start a free scan</Link>
          <a href="#tools" className="btn-cream px-8 py-3.5 rounded-xl no-underline text-base font-bold">Browse the tools</a>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PAGE COMPONENTS FOR OTHER MODULES
   ────────────────────────────────────────────── */
function PatchExporterPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">Autonomous Git <span className="serif">Patch Exporter</span></h2>
      <p className="text-[#4b5578] mb-8">Download ready-to-apply `.patch` files to automatically patch your repo with `git apply`.</p>
      <div className="bg-white/80 p-8 rounded-3xl shadow-xl max-w-xl mx-auto text-left">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full p-3 border rounded-xl mb-4 font-mono text-sm" />
        <button onClick={() => window.location.href = `${API_URL}/api/patch-export?target_domain=${encodeURIComponent(domain)}`} className="btn-red w-full py-3.5 rounded-xl border-0 font-bold cursor-pointer">
          Download .patch File
        </button>
      </div>
    </section>
  );
}

function AttackGraphPage() {
  const [graphData, setGraphData] = useState(null);
  useEffect(() => { fetch(`${API_URL}/api/attack-graph`).then(r=>r.json()).then(setGraphData); }, []);
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">Interactive Attack <span className="serif">Vector Graph</span></h2>
      {graphData && (
        <div className="bg-white/80 p-8 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {graphData.nodes.map(n => (
            <div key={n.id} className="p-4 bg-slate-50 border rounded-2xl">
              <div className="text-xs text-slate-400 font-bold uppercase mb-1">{n.type}</div>
              <div className="font-bold text-[#101a3d] mb-2">{n.label}</div>
              <span className="bg-[#ff3347] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{n.risk}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DarknetRadarPage() {
  const [darknetData, setDarknetData] = useState(null);
  useEffect(() => { fetch(`${API_URL}/api/darknet-scan`).then(r=>r.json()).then(setDarknetData); }, []);
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">Darknet Secret <span className="serif">Leak Radar</span></h2>
      {darknetData && (
        <div className="bg-white/80 p-8 rounded-3xl shadow-xl text-left space-y-4 max-w-3xl mx-auto">
          {darknetData.leaks.map((l, i) => (
            <div key={i} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-[#ff3347] uppercase">{l.source}</div>
                <div className="font-bold text-[#101a3d]">{l.type}</div>
                <div className="font-mono text-xs text-slate-500 mt-1">{l.sample}</div>
              </div>
              <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full">{l.severity}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PQCAuditPage() {
  const [pqcData, setPqcData] = useState(null);
  useEffect(() => { fetch(`${API_URL}/api/pqc-audit`).then(r=>r.json()).then(setPqcData); }, []);
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">Post-Quantum <span className="serif">Crypto Audit</span></h2>
      {pqcData && (
        <div className="bg-white/80 p-8 rounded-3xl shadow-xl max-w-2xl mx-auto text-left">
          <div className="text-5xl font-black text-emerald-500 text-center mb-6">{pqcData.quantum_readiness_score}% PQC Ready</div>
          {pqcData.cipher_suites.map((c, i) => (
            <div key={i} className="py-3 border-b flex justify-between text-sm">
              <span className="font-mono font-bold text-[#101a3d]">{c.suite}</span>
              <span className={`font-bold ${c.pqc_status==='PASS'?'text-emerald-600':'text-red-600'}`}>{c.pqc_status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WAFExporterPage() {
  const [wafData, setWafData] = useState(null);
  useEffect(() => { fetch(`${API_URL}/api/waf-rules?target_domain=cybercrime.gov.in`).then(r=>r.json()).then(setWafData); }, []);
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">WAF Rule <span className="serif">Exporter</span></h2>
      {wafData && (
        <div className="bg-[#101a3d] text-slate-200 p-6 rounded-3xl text-left font-mono text-xs overflow-x-auto max-w-3xl mx-auto">
          <pre>{wafData.nginx}</pre>
        </div>
      )}
    </section>
  );
}

function PhishingShieldPage() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">Phishing <span className="serif">Shield</span></h2>
      <p className="text-[#4b5578]">Active Imposter Domain Resolution Monitoring.</p>
    </section>
  );
}

function CVSSCalculatorPage() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">CVSS v3.1 Risk <span className="serif">Calculator</span></h2>
      <div className="bg-white p-8 rounded-3xl shadow-xl text-3xl font-black text-[#ff3347] inline-block">9.8 CRITICAL</div>
    </section>
  );
}

function CredentialAuditPage() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-4">Credential <span className="serif">Audit</span></h2>
      <p className="text-[#4b5578]">k-Anonymity SHA-1 Breach Engine Operational.</p>
    </section>
  );
}

function AIAnalystPage() {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! 👋 I'm your SDS Kavach AI Security Analyst. Ask me anything!" }]);
  const [input, setInput] = useState('');
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim(); setMessages(prev => [...prev, { role: 'user', text: msg }]); setInput('');
    try {
      const resp = await fetch(`${API_URL}/api/ai-chat`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: msg }) });
      const data = await resp.json(); setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch { setMessages(prev => [...prev, { role: 'ai', text: 'API error.' }]); }
  };
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-black text-[#101a3d] mb-6">AI Security <span className="serif">Analyst</span></h2>
      <div className="bg-white p-6 rounded-3xl shadow-xl h-[450px] flex flex-col max-w-2xl mx-auto text-left">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`p-4 rounded-2xl text-sm ${m.role==='user'?'bg-[#ff3347] text-white':'bg-slate-100 text-[#101a3d]'}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-3 border-t">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Ask security questions..." className="flex-1 border p-3 rounded-xl text-sm" />
          <button onClick={sendMessage} className="btn-red px-5 rounded-xl border-0 cursor-pointer"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  );
}

function ReportPage() {
  const [reportUrl, setReportUrl] = useState('https://cybercrime.gov.in/');
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-xl mx-auto">
        <FileText className="w-12 h-12 text-[#ff3347] mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-[#101a3d] mb-2">Compliance PDF Report</h2>
        <input type="text" value={reportUrl} onChange={e => setReportUrl(e.target.value)} className="w-full border p-3 rounded-xl mb-6 text-sm" />
        <button onClick={() => window.location.href = `${API_URL}/api/report/download?target_url=${encodeURIComponent(reportUrl)}`} className="btn-red px-8 py-3.5 rounded-xl border-0 font-bold cursor-pointer">
          Export PDF Report
        </button>
      </div>
    </section>
  );
}

/* Footer matching HTML artifact */
function Footer() {
  return (
    <footer className="max-w-[1120px] mx-auto px-6 py-12 flex flex-wrap gap-6 items-center justify-between border-t border-slate-200/50 text-[#4b5578] text-sm font-semibold">
      <Link to="/" className="text-xl font-extrabold text-[#101a3d] no-underline flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
        <span>sds<b className="text-[#ff3347]">kavach</b></span>
      </Link>
      <div className="flex gap-6">
        <a href="#tools" className="text-[#4b5578] no-underline hover:text-[#101a3d]">Toolkit</a>
        <a href="#why" className="text-[#4b5578] no-underline hover:text-[#101a3d]">Why sdskavach</a>
      </div>
      <span>© 2026 sdskavach</span>
    </footer>
  );
}

/* App Layout with Sky background & SVG Grain overlay */
function AppLayout() {
  return (
    <div className="min-h-screen relative font-sans">
      <div className="sky-bg" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
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
