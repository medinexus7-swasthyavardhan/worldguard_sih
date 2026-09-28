import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Zap, FileText, Download, Key, Bot, Send,
  CheckCircle2, Lock, Globe, Code2, AlertTriangle, Eye, Shield,
  ScanLine, Bug, Copy, Check, ExternalLink, Calculator, Layers, Cpu
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
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   NAVBAR (With Custom Logo Image & Centered Menu)
   ────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Scanner' },
    { to: '/waf', label: 'WAF Exporter' },
    { to: '/phishing', label: 'Phishing Shield' },
    { to: '/cvss', label: 'CVSS Calculator' },
    { to: '/audit', label: 'Credential Audit' },
    { to: '/analyst', label: 'AI Analyst' },
    { to: '/report', label: 'Report' },
  ];

  return (
    <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-[1240px] transition-all duration-700 ${scrolled ? 'bg-white/95 shadow-2xl shadow-black/8' : 'bg-white/75 shadow-xl shadow-black/4'} backdrop-blur-2xl border border-white/50 rounded-full px-6 py-3`}>
      <div className="flex items-center justify-between">
        
        {/* Left: Custom Image Logo from E:\midsem\Untitled design.png */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="SDS Kavach Logo" className="h-9 w-auto object-contain drop-shadow-sm" onError={(e) => { e.target.style.display='none'; }} />
          <span className="font-black text-[20px] tracking-tight text-[#0f172a] leading-none select-none">sds<span className="text-red-500">kavach</span></span>
        </Link>

        {/* Center: Aligned Menu Links */}
        <nav className="hidden lg:flex items-center gap-5 justify-center flex-1 mx-4">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`text-[13px] font-semibold transition-all duration-200 ${location.pathname === l.to ? 'text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-full border border-red-200/50' : 'text-slate-600 hover:text-red-500'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Balance Spacer */}
        <div className="w-[140px] hidden lg:block" />
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
      } else { setError('Scan failed. Check backend connection.'); }
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
   FEATURE 1: ONE-CLICK WAF & FIREWALL EXPORTER
   ────────────────────────────────────────────── */
function WAFExporterPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  const [wafData, setWafData] = useState(null);
  const [activeTab, setActiveTab] = useState('nginx');
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchWAFRules(domain); }, []);

  const fetchWAFRules = async (d) => {
    try {
      const r = await fetch(`${API_URL}/api/waf-rules?target_domain=${encodeURIComponent(d)}`);
      if (r.ok) setWafData(await r.json());
    } catch (e) { console.error(e); }
  };

  const copyRule = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">Firewall Automation</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">One-Click WAF <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Exporter</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Instantly generate copy-paste security rules for Nginx, Apache, Cloudflare WAF, and AWS WAF.</p>
        </div>

        {/* Input Bar */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-xl rounded-2xl p-4 mb-6 flex gap-4">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="Target domain (e.g. cybercrime.gov.in)"
            className="flex-1 bg-[#fef7f0]/60 border border-orange-200/40 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none" />
          <button onClick={() => fetchWAFRules(domain)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md">
            Generate WAF Rules
          </button>
        </div>

        {/* Code Tabs */}
        {wafData && (
          <div className="bg-[#0f172a] text-slate-200 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex border-b border-slate-800 bg-[#070d19] px-4 pt-3 gap-2 overflow-x-auto">
              {[
                { id: 'nginx', label: 'Nginx (nginx.conf)' },
                { id: 'apache', label: 'Apache (.htaccess)' },
                { id: 'cloudflare', label: 'Cloudflare WAF' },
                { id: 'aws_waf', label: 'AWS WAF (JSON)' }
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${activeTab === t.id ? 'bg-[#0f172a] text-red-400 border-t-2 border-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 relative">
              <button onClick={() => copyRule(wafData[activeTab])} className="absolute top-8 right-8 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Rule'}
              </button>
              <pre className="font-mono text-xs md:text-sm text-slate-300 overflow-x-auto leading-relaxed max-h-[420px] p-2">
                <code>{wafData[activeTab]}</code>
              </pre>
            </div>
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FEATURE 2: TYPOSQUATTING & PHISHING SHIELD
   ────────────────────────────────────────────── */
function PhishingShieldPage() {
  const [domain, setDomain] = useState('cybercrime.gov.in');
  const [shieldData, setShieldData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPhishingCheck = async () => {
    if (!domain) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/phishing-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      if (r.ok) setShieldData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { runPhishingCheck(); }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">I4C Cyber Crime Prevention</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Phishing & Typosquatting <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Shield</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Detect imposter domains and lookalike phishing sites targeting government and enterprise portals.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-xl rounded-2xl p-4 mb-6 flex gap-4">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="Target domain (e.g. cybercrime.gov.in)"
            className="flex-1 bg-[#fef7f0]/60 border border-orange-200/40 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none" />
          <button onClick={runPhishingCheck} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md disabled:opacity-50">
            {loading ? 'Scanning Domain Space...' : 'Scan Domain Variants'}
          </button>
        </div>

        {shieldData && (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a]">Domain Intelligence Matrix: <span className="text-red-500 font-mono">{shieldData.target_domain}</span></h3>
                <p className="text-xs text-slate-500">Scanning lookalike variations across gTLDs and ccTLDs</p>
              </div>
              <span className="bg-red-100 text-red-600 font-black text-xs px-3.5 py-1.5 rounded-full border border-red-200">
                {shieldData.threats_found} Active Risk Variants
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                    <th className="pb-3">Imposter Domain Variant</th>
                    <th className="pb-3">Resolution Status</th>
                    <th className="pb-3">Threat Level</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shieldData.variants.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-mono font-bold text-slate-800">{v.domain}</td>
                      <td className="py-3.5 text-slate-600 font-medium">{v.status}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                          v.risk === 'CRITICAL' ? 'bg-red-100 text-red-600 border border-red-200' :
                          v.risk === 'HIGH' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                          'bg-emerald-100 text-emerald-600 border border-emerald-200'
                        }`}>{v.risk}</span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-400 text-xs">{v.checked_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FEATURE 3: INTERACTIVE CVSS v3.1 RISK CALCULATOR
   ────────────────────────────────────────────── */
function CVSSCalculatorPage() {
  const [metrics, setMetrics] = useState({
    AV: 'N', // Network
    AC: 'L', // Low
    PR: 'N', // None
    UI: 'N', // None
    S: 'U',  // Unchanged
    C: 'H',  // High
    I: 'H',  // High
    A: 'H',  // High
  });

  const vectorString = `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`;

  // Approximate NIST CVSS Base Score calculation algorithm
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
  const severityColor = score >= 9.0 ? '#dc2626' : score >= 7.0 ? '#ea580c' : score >= 4.0 ? '#f59e0b' : '#2563eb';

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[950px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">CVSS v3.1 NIST Calculator</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Interactive Risk <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Calculator</span></h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Calculate CVSS v3.1 base metrics, risk severity levels, and vector strings dynamically.</p>
        </div>

        {/* Live Vector & Score Widget */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">CVSS v3.1 Vector String</span>
            <div className="font-mono text-sm md:text-base font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 select-all">
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

        {/* Metric Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div key={m.key} className="bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-2xl shadow-md">
              <h4 className="text-sm font-bold text-slate-800 mb-3">{m.title}</h4>
              <div className="flex gap-2 flex-wrap">
                {m.opts.map(o => (
                  <button key={o.v} onClick={() => setMetrics({ ...metrics, [m.key]: o.v })}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${metrics[m.key] === o.v ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {o.l} ({o.v})
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   CREDENTIAL AUDIT & AI ANALYST & REPORT
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
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[700px]">
        <div className="text-center mb-8">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-2 block">Credential Exposure Check</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Credential Audit <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Engine</span></h2>
        </div>
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8">
          <div className="flex gap-4">
            <input type="password" placeholder="Enter password to audit..." value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
              className="flex-1 bg-[#fef7f0]/60 border border-orange-200/40 rounded-2xl py-3.5 px-4 text-[#0f172a] font-medium text-sm focus:outline-none" />
            <button onClick={checkPassword} disabled={loading || !password} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg disabled:opacity-50">
              {loading ? 'Auditing...' : 'Audit Password'}
            </button>
          </div>
          {result && (
            <div className="mt-6">
              {result.breached ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
                  <h3 className="font-bold text-lg mb-1">⚠️ BREACHED CREDENTIAL</h3>
                  <p className="text-sm">Found in <strong>{result.count.toLocaleString()}</strong> data breaches. Change password immediately!</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-700">
                  <h3 className="font-bold text-lg mb-1">✅ NOT EXPOSED</h3>
                  <p className="text-sm">Not found in any public breach databases.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </AnimatedSection>
    </section>
  );
}

function AIAnalystPage() {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! 👋 I'm your SDS Kavach AI Security Analyst. Ask me about SQL Injection, XSS, Headers, HSTS, or CORS for instant remediation guidance." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput(''); setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch { setMessages(prev => [...prev, { role: 'ai', text: 'Error: Could not reach API.' }]); }
    setLoading(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[800px]">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">AI Security <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Analyst</span></h2>
        </div>
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '480px' }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white/60 flex gap-3">
            <input type="text" placeholder="Ask about SQL Injection, XSS, Headers..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-[#fef7f0]/60 border border-orange-200/40 rounded-2xl py-3 px-4 text-sm focus:outline-none" />
            <button onClick={sendMessage} className="bg-red-500 hover:bg-red-600 text-white w-11 h-11 rounded-full flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

function ReportPage() {
  const [reportUrl, setReportUrl] = useState(() => localStorage.getItem('sdskavach_last_url') || 'https://cybercrime.gov.in/');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = `${API_URL}/api/report/download?target_url=${encodeURIComponent(reportUrl)}`;
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-36 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[600px]">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-10 text-center">
          <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-[#0f172a] mb-2">Compliance PDF Report</h2>
          <input type="text" value={reportUrl} onChange={e => setReportUrl(e.target.value)} placeholder="Target URL..."
            className="w-full bg-[#fef7f0]/60 border border-orange-200/40 rounded-2xl py-3 px-4 text-sm mb-6" />
          <button onClick={handleDownload} disabled={downloading} className="bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-4 rounded-xl shadow-lg">
            {downloading ? 'Generating...' : 'Export PDF Report'}
          </button>
        </div>
      </AnimatedSection>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/50 py-12 px-4">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SDS Kavach Logo" className="h-7 w-auto object-contain" onError={(e) => e.target.style.display='none'} />
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
