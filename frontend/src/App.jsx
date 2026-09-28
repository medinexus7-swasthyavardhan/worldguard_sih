import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ShieldCheck, ArrowRight, Zap, FileText, Download, Key, Bot, Send,
  CheckCircle2, Lock, Globe, Code2, AlertTriangle, Eye, Shield,
  ScanLine, Bug, Menu, X
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
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   NAVBAR
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
    { to: '/audit', label: 'Credential Audit' },
    { to: '/analyst', label: 'AI Analyst' },
    { to: '/report', label: 'Report' },
  ];

  return (
    <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[1100px] transition-all duration-700 ${scrolled ? 'bg-white/95 shadow-2xl shadow-black/8' : 'bg-white/70 shadow-xl shadow-black/4'} backdrop-blur-2xl border border-white/50 rounded-full px-6 md:px-8 py-3`}>
      <div className="flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-5 w-1/3">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`text-[13px] font-semibold transition-colors duration-300 ${location.pathname === l.to ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="flex items-center justify-center gap-2 md:w-1/3">
          <ShieldCheck className="w-7 h-7 text-[#0f172a]" strokeWidth={2.5} />
          <span className="font-black text-[21px] tracking-tight text-[#0f172a] leading-none select-none">sds<span className="text-red-500">kavach</span></span>
        </Link>
        <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
          <Link to="/report" className="text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors">Generate PDF</Link>
          <Link to="/" className="bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/20 transition-all active:scale-95">Start Scan</Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ──────────────────────────────────────────────
   HERO / SCANNER PAGE
   ────────────────────────────────────────────── */
function ScannerPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState([]);
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  const placeholderText = useTypewriter([
    'Enter your domain or API endpoint to assess...',
    'https://cybercrime.gov.in',
    'https://api.example.com/v1/users',
    'Enter any URL to start a real security scan...',
  ], 60, 3000);

  const { scrollY } = useScroll();
  const floatY1 = useTransform(scrollY, [0, 600], [0, -80]);
  const floatY2 = useTransform(scrollY, [0, 600], [0, -40]);

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
      } else {
        setError('Scan failed. Check if the backend is running.');
      }
    } catch (e) {
      setError('Cannot connect to SDS Kavach API. Make sure the backend is deployed.');
    }
    setIsScanning(false);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-40 md:pt-44 pb-20 px-4 overflow-hidden">
      {/* Floating Icons */}
      <motion.div style={{ y: floatY1 }} className="absolute top-32 left-[8%] w-16 h-16 bg-red-100/60 rounded-2xl backdrop-blur-sm border border-red-200/30 flex items-center justify-center shadow-lg rotate-12 hidden lg:flex">
        <Shield className="w-7 h-7 text-red-400" />
      </motion.div>
      <motion.div style={{ y: floatY2 }} className="absolute top-48 right-[10%] w-14 h-14 bg-blue-100/60 rounded-full backdrop-blur-sm border border-blue-200/30 flex items-center justify-center shadow-lg hidden lg:flex">
        <Lock className="w-6 h-6 text-blue-400" />
      </motion.div>

      {/* Tag */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="mb-7">
        <span className="text-red-400/80 text-[15px] font-medium italic line-through decoration-red-400/50 decoration-2">Not just another vulnerability scanner</span>
      </motion.div>

      {/* Heading */}
      <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.8rem,7.5vw,6.2rem)] font-black text-[#0f172a] text-center tracking-tight leading-[1.05] mb-1 select-none">
        Your Automated Security
      </motion.h1>
      <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.8rem,7.5vw,6.2rem)] font-black text-red-500 text-center tracking-tight leading-[1.05] mb-12 select-none"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>
        armor.
      </motion.h1>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
        className="w-full max-w-[680px] bg-[#fef7f0]/80 backdrop-blur-xl border border-orange-200/40 shadow-2xl shadow-orange-900/5 rounded-[28px] px-6 py-5 relative group transition-all duration-500 hover:shadow-red-500/8 hover:bg-[#fef7f0]">
        <input type="text" placeholder={placeholderText + '|'}
          className="w-full bg-transparent text-[#0f172a] text-lg md:text-xl font-medium placeholder-slate-400 focus:outline-none pr-14 py-1"
          value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && startScan()} />
        <motion.button onClick={startScan} disabled={isScanning || !targetUrl} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          className="absolute top-1/2 -translate-y-1/2 right-5 w-11 h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 disabled:opacity-40 transition-colors">
          {isScanning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </motion.button>
        {isScanning && (
          <div className="absolute bottom-3 left-6 right-16 h-[3px] bg-red-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full animate-pulse w-full" />
          </div>
        )}
      </motion.div>

      {/* Error */}
      {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}

      {/* Results */}
      <AnimatePresence>
        {findings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[1100px] mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 flex flex-col justify-center items-center">
              <h3 className="text-slate-400 font-bold text-xs mb-5 uppercase tracking-[0.2em]">SDS Posture Score</h3>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="text-8xl font-black tracking-tighter leading-none" style={{ color: score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444' }}>
                {score}
              </motion.div>
              <p className="text-slate-400 text-xs mt-5 font-medium">{findings.length} vulnerabilities found</p>
            </div>
            <div className="md:col-span-2 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-white/40">
                <h3 className="text-slate-800 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Real Scan Results
                </h3>
              </div>
              <div className="divide-y divide-slate-100/80 max-h-[400px] overflow-y-auto">
                {findings.map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="px-5 py-4 flex justify-between items-start hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0 pr-4">
                      <div className="text-slate-800 font-bold">{f.title}</div>
                      <div className="text-slate-400 text-xs mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded truncate max-w-full">{f.signal}</div>
                      <div className="text-slate-400 text-xs mt-1">Component: {f.component}</div>
                    </div>
                    <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase whitespace-nowrap shrink-0 ${
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
   CREDENTIAL AUDIT PAGE (REAL - uses HIBP)
   ────────────────────────────────────────────── */
function CredentialAuditPage() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPassword = async () => {
    if (!password) return;
    setLoading(true); setResult(null);

    // SHA-1 hash in browser (k-anonymity: only send first 5 chars)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
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
    } catch {
      setResult({ breached: false, count: 0, error: 'Could not reach API' });
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-40 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[700px]">
        <div className="text-center mb-10">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Credential Security</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Credential Exposure <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Audit</span></h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto">Check if passwords have been exposed in data breaches. Uses SHA-1 k-anonymity — your plaintext password <strong>never leaves the browser</strong>.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" placeholder="Enter password to audit..."
                className="w-full bg-[#fef7f0]/60 border border-orange-200/40 rounded-2xl py-3.5 pl-10 pr-4 text-[#0f172a] font-medium focus:outline-none focus:border-red-400 transition-colors"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPassword()} />
            </div>
            <motion.button onClick={checkPassword} disabled={loading || !password} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-red-500/20 disabled:opacity-50 transition-colors flex items-center gap-2">
              <Key className="w-4 h-4" /> {loading ? 'Checking...' : 'Audit'}
            </motion.button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              {result.error ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-yellow-800 text-sm">{result.error}</div>
              ) : result.breached ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-red-700 font-bold text-lg">COMPROMISED</h3>
                  </div>
                  <p className="text-red-600">This password has been found in <strong>{result.count.toLocaleString()}</strong> data breach(es). Change it immediately!</p>
                  <p className="text-slate-400 text-xs mt-3 font-mono">SHA-1: {result.hash}</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-emerald-700 font-bold text-lg">NOT FOUND IN BREACHES</h3>
                  </div>
                  <p className="text-emerald-600">This password was not found in any known data breaches. It may still be weak — use a password manager.</p>
                  <p className="text-slate-400 text-xs mt-3 font-mono">SHA-1: {result.hash}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   AI ANALYST PAGE (REAL - calls backend)
   ────────────────────────────────────────────── */
function AIAnalystPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "I'm your SDS Kavach Security Analyst. Ask me about any vulnerability — SQL Injection, XSS, Access Control, Headers, Cookies, HSTS — and I'll give you exact remediation code." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Could not reach the SDS Kavach API.' }]);
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-40 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[800px]">
        <div className="text-center mb-10">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">AI-Powered</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">Security <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>Analyst</span></h2>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-red-500 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-700 rounded-bl-md border border-slate-200'
                }`}>
                  {msg.role === 'ai' && <Bot className="w-4 h-4 text-red-400 mb-1 inline-block mr-1" />}
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 px-5 py-3 rounded-2xl rounded-bl-md text-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 bg-white/60">
            <div className="flex gap-3">
              <input type="text" placeholder="Ask about SQL Injection, XSS, Headers, Cookies..." value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-[#fef7f0]/60 border border-orange-200/40 rounded-2xl py-3 px-4 text-[#0f172a] font-medium focus:outline-none focus:border-red-400 transition-colors text-sm" />
              <motion.button onClick={sendMessage} disabled={loading || !input.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="bg-red-500 hover:bg-red-600 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 disabled:opacity-50 transition-colors shrink-0">
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   REPORT PAGE (REAL - downloads from backend)
   ────────────────────────────────────────────── */
function ReportPage() {
  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/api/report/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'SDSKavach_Security_Report.pdf'; a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-40 pb-20 px-4">
      <AnimatedSection className="w-full max-w-[600px]">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-[#0f172a] mb-2">Compliance Report</h2>
          <p className="text-slate-500 mb-8">Download a formal PDF report with all scan results, CVSS scores, and remediation steps.</p>
          <motion.button onClick={handleDownload} disabled={downloading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto text-[15px]">
            <Download className="w-5 h-5" /> {downloading ? 'Generating...' : 'Export PDF Report'}
          </motion.button>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FEATURES / HOW IT WORKS (kept from before)
   ────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    { icon: ScanLine, title: "Real-Time Scanning", desc: "Scans live URLs for missing security headers, exposed files, server info leaks, and cookie misconfigurations." },
    { icon: Eye, title: "Explainable Signals", desc: "Every vulnerability comes with transparent evidence—exact HTTP responses and reproducible proof." },
    { icon: Shield, title: "CVSS Risk Scoring", desc: "Industry-standard severity scoring calculates your overall security posture in real time." },
    { icon: Bot, title: "AI Remediation", desc: "Ask the AI analyst for exact code fixes for SQL Injection, XSS, broken access control, and more." },
    { icon: Key, title: "Credential Audit", desc: "Browser-side k-anonymity SHA-1 hashing verifies passwords against Have I Been Pwned—zero plaintext transmitted." },
    { icon: FileText, title: "PDF Reports", desc: "Export formal compliance PDFs with findings, severity scores, and remediation guidance for auditors." },
  ];
  return (
    <section id="features" className="py-28 md:py-36 px-4">
      <div className="max-w-[1100px] mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-red-500 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Why SDS Kavach?</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight">
            Security that <span className="text-red-500" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>explains</span> itself.
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.08}>
              <motion.div whileHover={{ y: -8, transition: { duration: 0.35 } }}
                className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/4 rounded-3xl p-8 group hover:shadow-2xl hover:shadow-red-500/8 transition-shadow duration-500 cursor-default h-full">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 group-hover:bg-red-500 transition-all duration-300">
                  <f.icon className="w-6 h-6 text-red-500 group-hover:text-white transition-colors duration-300" />
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
        <p className="text-slate-400 text-xs">© 2026 SDS Kavach · Secure Defense System</p>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   APP
   ────────────────────────────────────────────── */
function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className="min-h-screen font-sans selection:bg-red-500/30 relative scroll-smooth"
      style={{
        backgroundImage: `radial-gradient(ellipse 130% 80% at 50% -10%, rgba(219,234,254,0.5) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 85% 15%, rgba(252,231,243,0.45) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 15% 85%, rgba(224,231,255,0.35) 0%, transparent 50%), linear-gradient(180deg, #fafbff 0%, #f1f5f9 35%, #ede5f3 65%, #e8ddf0 85%, #f1f5f9 100%)`,
        backgroundAttachment: 'fixed',
      }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<><ScannerPage /><FeaturesSection /></>} />
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
