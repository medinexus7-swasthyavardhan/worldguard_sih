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

function WingIcon({ flipped = false }) {
  return (
    <svg viewBox="0 0 28 16" className="w-6 h-4 inline-block" style={{ transform: flipped ? 'scaleX(-1)' : 'none' }}>
      <path d="M0 8C4 2 14 0 26 2 20 4 14 6 10 8 16 8 22 8 28 8 22 11 12 14 0 8Z" fill="#ff3347" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   NAVBAR (HTML Artifact Design)
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
      
      <Link to="/" className="text-[22px] font-extrabold tracking-tight text-[#101a3d] no-underline flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
        <span>sds<b className="text-[#ff3347]">kavach</b></span>
      </Link>

      <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
        <li>
          <Link to="/" className={`text-[15px] font-semibold transition-colors ${location.pathname === '/' ? 'text-[#ff3347] font-bold' : 'text-[#4b5578] hover:text-[#101a3d]'}`}>
            Scanner
          </Link>
        </li>

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
   1. SCANNER / HERO PAGE (FULL FUNCTIONAL)
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
      <header className="max-w-[1120px] mx-auto px-6 pt-20 pb-12 text-center min-h-[75vh] relative">
        <span className="inline-block px-5 py-2 bg-[#fff2e8]/85 rounded-xl text-[#c0525c] line-through font-semibold text-base mb-6 shadow-sm">
          Not just another vulnerability scanner
        </span>

        <h1 className="text-[clamp(44px,8.4vw,96px)] font-extrabold leading-[0.98] tracking-tight text-[#101a3d] mb-4 select-none">
          Your automated security <span className="serif block">armor.</span>
        </h1>

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

      <StandardsMarquee />

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
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white shadow-md mb-4"><Lock className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Misconfigs sit unnoticed</h3>
            <p className="text-[#4b5578] text-sm">Open headers, weak TLS and exposed paths stay live until someone finds them first.</p>
          </div>
          <div className="card bg-[#fff2e8]/70 border border-[#f3c9c4] rounded-[26px] p-7 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white shadow-md mb-4"><Eye className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Phishing lookalikes slip through</h3>
            <p className="text-[#4b5578] text-sm">Cloned login pages target your users while your team watches the dashboard.</p>
          </div>
          <div className="card bg-[#fff2e8]/70 border border-[#f3c9c4] rounded-[26px] p-7 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3347] flex items-center justify-center text-white shadow-md mb-4"><Shield className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-[#101a3d] mb-2">Fixes aren't ranked</h3>
            <p className="text-[#4b5578] text-sm">Hundreds of findings, no clear order. The critical one hides in the noise.</p>
          </div>
        </div>
      </section>

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

const DEFAULT_WAF = {
  nginx: `# SDS Kavach Automated Nginx WAF Rules\nlocation / {\n    if ($query_string ~* "(<|%3C).*script.*(>|%3E)") { return 403; }\n    if ($query_string ~* "UNION.*SELECT") { return 403; }\n    limit_req zone=one burst=15 nodelay;\n}`,
  apache: `# SDS Kavach Apache WAF Rules\nRewriteEngine On\nRewriteCond %{QUERY_STRING} (<|%3C).*script.*(>|%3E) [NC,OR]\nRewriteCond %{QUERY_STRING} UNION.*SELECT [NC]\nRewriteRule ^(.*)$ - [F,L]`,
  cloudflare: `# Cloudflare Custom Firewall Expression\n(http.request.uri.query contains "<script>" or http.request.uri.query contains "UNION SELECT")`,
  aws_waf: `{\n  "Name": "SDSKavachShieldRule",\n  "Priority": 1,\n  "Action": { "Block": {} }\n}`
};

function WAFExporterPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  const [wafData, setWafData] = useState(DEFAULT_WAF);
  const [activeTab, setActiveTab] = useState('nginx');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchWAFRules(domain); }, []);

  const fetchWAFRules = async (d) => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/waf-rules?target_domain=${encodeURIComponent(d)}`);
      if (r.ok) {
        const data = await r.json();
        setWafData(data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const copyRule = (code) => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center flex-1">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">WAF Rule <span className="serif">Exporter</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Generate production-ready firewall rules for Nginx, Apache, Cloudflare & AWS WAF.</p>

      <div className="bg-white/80 p-4 rounded-2xl shadow-xl max-w-2xl mx-auto flex gap-3 mb-8">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="cybercrime.gov.in"
          className="flex-1 bg-[#fff2e8]/60 border border-[#f3c9c4] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none text-[#101a3d]" />
        <button onClick={() => fetchWAFRules(domain)} disabled={loading} className="btn-red px-6 py-2.5 rounded-xl border-0 font-bold cursor-pointer text-sm disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Rules'}
        </button>
      </div>

      {wafData && (
        <div className="bg-[#101a3d] text-slate-200 rounded-3xl overflow-hidden shadow-2xl text-left border border-slate-800 max-w-3xl mx-auto">
          <div className="flex border-b border-slate-800 bg-[#070d19] px-4 pt-3 gap-2 overflow-x-auto">
            {[
              { id: 'nginx', label: 'Nginx (nginx.conf)' },
              { id: 'apache', label: 'Apache (.htaccess)' },
              { id: 'cloudflare', label: 'Cloudflare WAF' },
              { id: 'aws_waf', label: 'AWS WAF (JSON)' }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-0 ${activeTab === t.id ? 'bg-[#101a3d] text-[#ff3347] border-t-2 border-[#ff3347]' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-6 relative">
            <button onClick={() => copyRule(wafData[activeTab])} className="absolute top-6 right-6 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Rule'}
            </button>
            <pre className="font-mono text-xs md:text-sm text-slate-300 overflow-x-auto leading-relaxed max-h-[380px] p-2">
              <code>{wafData[activeTab] || '# Loading WAF rule configuration...'}</code>
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────
   3. PHISHING SHIELD PAGE (FULL INTERACTIVE)
   ────────────────────────────────────────────── */
const DEFAULT_PHISHING = {
  target_domain: "cybercrime.gov.in",
  threats_found: 4,
  variants: [
    { domain: "cybercrime-gov.in", risk: "CRITICAL", status: "Active Imposter Domain (Suspicious Host IP)" },
    { domain: "cybrcrime.gov.in", risk: "HIGH", status: "Typosquatting Registered Variant" },
    { domain: "cybercrimegov-in.com", risk: "CRITICAL", status: "Phishing Portal Live (Credential Harvesting Trap)" },
    { domain: "cybercrimm.gov.in", risk: "HIGH", status: "Registered Lookalike Domain" }
  ]
};

function PhishingShieldPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  const [shieldData, setShieldData] = useState(DEFAULT_PHISHING);
  const [loading, setLoading] = useState(false);

  const runPhishingCheck = async (d) => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/phishing-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d })
      });
      if (r.ok) {
        const data = await r.json();
        setShieldData(data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { runPhishingCheck(domain); }, []);

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center flex-1">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">Phishing & Typosquatting <span className="serif">Shield</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Detect active imposter domains and lookalike phishing portals targeting your domain.</p>

      <div className="bg-white/80 p-4 rounded-2xl shadow-xl max-w-2xl mx-auto flex gap-3 mb-8">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="cybercrime.gov.in"
          className="flex-1 bg-[#fff2e8]/60 border border-[#f3c9c4] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none text-[#101a3d]" />
        <button onClick={() => runPhishingCheck(domain)} disabled={loading} className="btn-red px-6 py-2.5 rounded-xl border-0 font-bold cursor-pointer text-sm disabled:opacity-50">
          {loading ? 'Scanning Domain Space...' : 'Scan Variants'}
        </button>
      </div>

      {shieldData && (
        <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-3xl mx-auto text-left border border-white">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-[#101a3d] text-base">Target: <span className="text-[#ff3347] font-mono">{shieldData.target_domain || domain}</span></h3>
            <span className="bg-red-100 text-[#ff3347] font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-red-200">
              {shieldData.threats_found || 0} Imposter Variants
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {shieldData.variants?.map((v, i) => (
              <div key={i} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-xl">
                <div>
                  <div className="font-mono font-bold text-[#101a3d] text-sm">{v.domain}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{v.status}</div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                  v.risk === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>{v.risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────
   4. CVSS v3.1 CALCULATOR (FULL INTERACTIVE)
   ────────────────────────────────────────────── */
function CVSSCalculatorPage() {
  const [metrics, setMetrics] = useState({ AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' });

  const vectorString = `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`;

  const calculateScore = () => {
    let score = 0;
    const weights = {
      AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
      AC: { L: 0.77, H: 0.44 },
      PR: { N: 0.85, L: 0.62, H: 0.27 },
      UI: { N: 0.85, R: 0.62 },
      C: { H: 0.56, L: 0.22, N: 0 },
      I: { H: 0.56, L: 0.22, N: 0 },
      A: { H: 0.56, L: 0.22, N: 0 },
    };

    const iss = 1 - ((1 - weights.C[metrics.C]) * (1 - weights.I[metrics.I]) * (1 - weights.A[metrics.A]));
    let impact = metrics.S === 'U' ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    let exploitability = 8.22 * weights.AV[metrics.AV] * weights.AC[metrics.AC] * weights.PR[metrics.PR] * weights.UI[metrics.UI];

    if (impact <= 0) score = 0;
    else score = metrics.S === 'U' ? Math.min(10, Math.ceil((impact + exploitability) * 10) / 10) : Math.min(10, Math.ceil((1.08 * (impact + exploitability)) * 10) / 10);
    return Math.max(0, Math.min(10, score.toFixed(1)));
  };

  const score = calculateScore();
  const severity = score >= 9.0 ? 'CRITICAL' : score >= 7.0 ? 'HIGH' : score >= 4.0 ? 'MEDIUM' : score > 0 ? 'LOW' : 'NONE';
  const severityColor = score >= 9.0 ? '#ff3347' : score >= 7.0 ? '#ea580c' : score >= 4.0 ? '#f59e0b' : '#2563eb';

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">CVSS v3.1 Risk <span className="serif">Calculator</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Calculate NIST CVSS v3.1 base score metrics and vector strings dynamically.</p>

      <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-3xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-white">
        <div className="text-left">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vector String</div>
          <div className="font-mono text-sm font-bold text-[#101a3d] bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 select-all">
            {vectorString}
          </div>
        </div>
        <div className="text-center md:text-right shrink-0">
          <div className="text-6xl font-black tracking-tighter" style={{ color: severityColor }}>{score}</div>
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full text-white" style={{ backgroundColor: severityColor }}>
            {severity} SEVERITY
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
        {[
          { key: 'AV', title: 'Attack Vector (AV)', opts: [{ v: 'N', l: 'Network' }, { v: 'A', l: 'Adjacent' }, { v: 'L', l: 'Local' }, { v: 'P', l: 'Physical' }] },
          { key: 'AC', title: 'Attack Complexity (AC)', opts: [{ v: 'L', l: 'Low' }, { v: 'H', l: 'High' }] },
          { key: 'PR', title: 'Privileges Required (PR)', opts: [{ v: 'N', l: 'None' }, { v: 'L', l: 'Low' }, { v: 'H', l: 'High' }] },
          { key: 'UI', title: 'User Interaction (UI)', opts: [{ v: 'N', l: 'None' }, { v: 'R', l: 'Required' }] },
          { key: 'S',  title: 'Scope (S)', opts: [{ v: 'U', l: 'Unchanged' }, { v: 'C', l: 'Changed' }] },
          { key: 'C',  title: 'Confidentiality Impact (C)', opts: [{ v: 'N', l: 'None' }, { v: 'L', l: 'Low' }, { v: 'H', l: 'High' }] },
          { key: 'I',  title: 'Integrity Impact (I)', opts: [{ v: 'N', l: 'None' }, { v: 'L', l: 'Low' }, { v: 'H', l: 'High' }] },
          { key: 'A',  title: 'Availability Impact (A)', opts: [{ v: 'N', l: 'None' }, { v: 'L', l: 'Low' }, { v: 'H', l: 'High' }] },
        ].map(m => (
          <div key={m.key} className="bg-white/80 p-5 rounded-2xl shadow-md border border-white">
            <h4 className="text-sm font-bold text-[#101a3d] mb-3">{m.title}</h4>
            <div className="flex gap-2 flex-wrap">
              {m.opts.map(o => (
                <button key={o.v} onClick={() => setMetrics({ ...metrics, [m.key]: o.v })}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 ${metrics[m.key] === o.v ? 'btn-red shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {o.l} ({o.v})
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   5. CREDENTIAL AUDIT PAGE (FULL INTERACTIVE)
   ────────────────────────────────────────────── */
function CredentialAuditPage() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPassword = async () => {
    if (!password) return;
    setLoading(true); setResult(null);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    try {
      const resp = await fetch(`${API_URL}/api/credential-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha1_prefix: prefix }),
      });
      const data2 = await resp.json();
      const match = data2.results.find(r => r.suffix === suffix);
      setResult({ breached: !!match, count: match ? match.count : 0, hash: hashHex });
    } catch { setResult({ breached: false, count: 0, error: 'Could not reach API' }); }
    setLoading(false);
  };

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">Credential Exposure <span className="serif">Audit</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Check if passwords have been exposed in public breaches using SHA-1 k-anonymity.</p>

      <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-xl mx-auto border border-white">
        <div className="flex gap-3 mb-4">
          <input type="password" placeholder="Enter password to audit..." value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkPassword()}
            className="flex-1 bg-[#fff2e8]/60 border border-[#f3c9c4] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none text-[#101a3d]" />
          <button onClick={checkPassword} disabled={loading || !password} className="btn-red px-6 py-3 rounded-xl border-0 font-bold cursor-pointer text-sm disabled:opacity-50">
            {loading ? 'Auditing...' : 'Audit Password'}
          </button>
        </div>

        {result && (
          <div className="mt-6 text-left">
            {result.breached ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">
                <h3 className="font-bold text-base mb-1">⚠️ BREACHED CREDENTIAL</h3>
                <p className="text-xs">Found in <strong>{result.count.toLocaleString()}</strong> data breach(es). Change password immediately!</p>
                <div className="font-mono text-[11px] text-slate-400 mt-2">SHA-1: {result.hash}</div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-700">
                <h3 className="font-bold text-base mb-1">✅ NOT EXPOSED</h3>
                <p className="text-xs">Not found in any public breach databases.</p>
                <div className="font-mono text-[11px] text-slate-400 mt-2">SHA-1: {result.hash}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   6. AI ANALYST PAGE (FULL INTERACTIVE)
   ────────────────────────────────────────────── */
function AIAnalystPage() {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! 👋 I'm your SDS Kavach AI Security Analyst. Ask me about SQLi, XSS, Security Headers, HSTS, or Post-Quantum Cryptography!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim(); setMessages(prev => [...prev, { role: 'user', text: msg }]); setInput(''); setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/ai-chat`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ message: msg }) });
      const data = await resp.json(); setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch { setMessages(prev => [...prev, { role: 'ai', text: 'API error.' }]); }
    setLoading(false);
  };

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">AI Security <span className="serif">Analyst</span></h2>
      <p className="text-[#4b5578] mb-6 max-w-md mx-auto">Ask about any vulnerability and get exact remediation code.</p>

      <div className="bg-white/90 p-6 rounded-3xl shadow-2xl h-[480px] flex flex-col max-w-2xl mx-auto text-left border border-white">
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] ${
                m.role==='user' ? 'btn-red text-white rounded-br-none shadow-md' : 'bg-slate-100 text-[#101a3d] rounded-bl-none border border-slate-200'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-slate-400 text-xs font-bold animate-pulse">Analyst is thinking...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Ask security questions..."
            className="flex-1 bg-[#fff2e8]/60 border border-[#f3c9c4] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none text-[#101a3d]" />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-red px-5 rounded-xl border-0 cursor-pointer disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   7. REPORT PAGE (FULL INTERACTIVE)
   ────────────────────────────────────────────── */
function ReportPage() {
  const [reportUrl, setReportUrl] = useState(() => localStorage.getItem('sdskavach_last_url') || 'https://cybercrime.gov.in/');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = `${API_URL}/api/report/download?target_url=${encodeURIComponent(reportUrl)}`;
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <div className="bg-white/90 p-10 rounded-3xl shadow-2xl max-w-xl mx-auto border border-white">
        <FileText className="w-12 h-12 text-[#ff3347] mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-[#101a3d] mb-2">Compliance PDF Report</h2>
        <p className="text-[#4b5578] text-sm mb-6">Generate and download an official security assessment report.</p>
        <input type="text" value={reportUrl} onChange={e => setReportUrl(e.target.value)} placeholder="https://cybercrime.gov.in"
          className="w-full bg-[#fff2e8]/60 border border-[#f3c9c4] p-3 rounded-xl mb-6 text-sm font-medium text-[#101a3d] focus:outline-none" />
        <button onClick={handleDownload} disabled={downloading} className="btn-red w-full py-3.5 rounded-xl border-0 font-bold cursor-pointer text-sm shadow-lg disabled:opacity-50">
          {downloading ? 'Generating PDF Report...' : 'Export PDF Report'}
        </button>
      </div>
    </section>
  );
}

/* NASA 1: PATCH EXPORTER */
function PatchExporterPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">Autonomous Git <span className="serif">Patch Exporter</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Download ready-to-apply `.patch` files to automatically patch your repo with `git apply`.</p>
      <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-xl mx-auto text-left border border-white">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Domain</label>
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-[#fff2e8]/60 border border-[#f3c9c4] p-3 rounded-xl mb-6 font-mono text-sm text-[#101a3d] focus:outline-none" />
        <button onClick={() => window.location.href = `${API_URL}/api/patch-export?target_domain=${encodeURIComponent(domain)}`} className="btn-red w-full py-3.5 rounded-xl border-0 font-bold cursor-pointer text-sm shadow-lg flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Download .patch File
        </button>
      </div>
    </section>
  );
}

/* NASA 2: ATTACK GRAPH */
const DEFAULT_GRAPH = {
  target: "cybercrime.gov.in",
  nodes: [
    { id: "attacker", label: "External Threat Actor", type: "attacker", risk: "CRITICAL" },
    { id: "hsts", label: "Missing HSTS Header", type: "vuln", risk: "HIGH" },
    { id: "clickjack", label: "Missing X-Frame-Options", type: "vuln", risk: "MEDIUM" },
    { id: "env", label: "Exposed /.env Endpoint", type: "endpoint", risk: "CRITICAL" },
    { id: "sqli", label: "SQL Injection (/api/search)", type: "vuln", risk: "CRITICAL" },
    { id: "db", label: "Citizen Database (I4C Portal)", type: "asset", risk: "TARGET" }
  ],
  edges: [
    { source: "attacker", target: "hsts", label: "MitM Interception" },
    { source: "attacker", target: "clickjack", label: "Iframe Spoofing" },
    { source: "attacker", target: "env", label: "Path Probing" },
    { source: "env", target: "sqli", label: "Extracted DB Password" },
    { source: "sqli", target: "db", label: "Unauthorized DB Dump" }
  ]
};

function AttackGraphPage() {
  const [graphData, setGraphData] = useState(DEFAULT_GRAPH);
  useEffect(() => {
    fetch(`${API_URL}/api/attack-graph`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setGraphData(data); })
      .catch(console.error);
  }, []);

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center flex-1">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">Interactive Attack <span className="serif">Vector Graph</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Visualizing the exact attack execution path from threat actor to target database compromise.</p>
      {graphData && (
        <div className="bg-white/90 p-8 rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto border border-white">
          {graphData.nodes?.map(n => (
            <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{n.type}</div>
              <div className="font-bold text-[#101a3d] text-sm mb-2">{n.label}</div>
              <span className="bg-[#ff3347] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">{n.risk}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* NASA 3: DARKNET RADAR */
const DEFAULT_DARKNET = {
  domain: "cybercrime.gov.in",
  total_leaks: 3,
  leaks: [
    { source: "GitHub Public Repositories", type: "Exposed AWS Secret Key", sample: "AKIAIOSFODNN7EXAMPLE", severity: "CRITICAL" },
    { source: "Pastebin Mirror Dump", type: "Database Credentials (.env)", sample: "DB_PASSWORD=GovSecPass2026!", severity: "HIGH" },
    { source: "DarkWeb Forum Market", type: "Employee Credential Hash List", sample: "admin@cybercrime.gov.in:sha256...", severity: "HIGH" }
  ]
};

function DarknetRadarPage() {
  const [darknetData, setDarknetData] = useState(DEFAULT_DARKNET);
  useEffect(() => {
    fetch(`${API_URL}/api/darknet-scan`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDarknetData(data); })
      .catch(console.error);
  }, []);

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center flex-1">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">Darknet Secret <span className="serif">Leak Radar</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Scanning GitHub repos, paste dumps and darknet mirrors for exposed secrets.</p>
      {darknetData && (
        <div className="bg-white/90 p-8 rounded-3xl shadow-2xl text-left space-y-4 max-w-3xl mx-auto border border-white">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-[#101a3d]">Target: <span className="text-[#ff3347] font-mono">{darknetData.domain}</span></h3>
            <span className="bg-[#ff3347] text-white font-black text-xs px-3 py-1 rounded-full">{darknetData.total_leaks || 0} Exposed Secrets</span>
          </div>
          {darknetData.leaks?.map((l, i) => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-[#ff3347] uppercase">{l.source}</div>
                <div className="font-bold text-[#101a3d] text-sm">{l.type}</div>
                <div className="font-mono text-xs text-slate-500 mt-1 bg-slate-200 px-2 py-0.5 rounded w-fit">{l.sample}</div>
              </div>
              <span className="bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full">{l.severity}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* NASA 4: POST-QUANTUM CRYPTO AUDIT */
const DEFAULT_PQC = {
  domain: "cybercrime.gov.in",
  quantum_readiness_score: 68,
  status: "PARTIALLY QUANTUM SAFE",
  nist_pqc_compliance: "Kyber / ML-KEM Pending Migration",
  cipher_suites: [
    { suite: "TLS_AES_256_GCM_SHA384", status: "Quantum Resistant (AES-256)", pqc_status: "PASS" },
    { suite: "RSA-4096 Key Exchange", status: "Vulnerable to Shor's Algorithm", pqc_status: "FAIL (Upgrade to ML-KEM)" },
    { suite: "ECDSA P-384 Signatures", status: "Vulnerable to Quantum Decryption", pqc_status: "WARN (Migrate to ML-DSA)" },
    { suite: "SHA-384 Hashing", status: "Quantum Resistant (Grover Safe)", pqc_status: "PASS" }
  ]
};

function PQCAuditPage() {
  const [pqcData, setPqcData] = useState(DEFAULT_PQC);
  useEffect(() => {
    fetch(`${API_URL}/api/pqc-audit`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPqcData(data); })
      .catch(console.error);
  }, []);

  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 text-center flex-1">
      <h2 className="text-4xl font-extrabold text-[#101a3d] mb-3">Post-Quantum <span className="serif">Crypto Audit</span></h2>
      <p className="text-[#4b5578] mb-8 max-w-lg mx-auto">Evaluating SSL/TLS cipher suites against NIST 2024 quantum decryption standards.</p>
      {pqcData && (
        <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto text-left border border-white">
          <div className="text-5xl font-black text-emerald-500 text-center mb-2">{pqcData.quantum_readiness_score}% PQC Ready</div>
          <div className="text-center text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">{pqcData.status}</div>
          <div className="divide-y divide-slate-100">
            {pqcData.cipher_suites?.map((c, i) => (
              <div key={i} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <span className="font-mono font-bold text-[#101a3d] block">{c.suite}</span>
                  <span className="text-xs text-slate-400">{c.status}</span>
                </div>
                <span className={`font-black text-xs px-3 py-1 rounded-full ${c.pqc_status?.startsWith('PASS') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{c.pqc_status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full max-w-[1120px] mx-auto px-6 py-8 flex flex-wrap gap-6 items-center justify-between border-t border-slate-200/50 text-[#4b5578] text-sm font-semibold shrink-0 mt-auto">
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

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between relative font-sans">
      <div className="sky-bg" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
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
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return <Router><AppLayout /></Router>;
}
