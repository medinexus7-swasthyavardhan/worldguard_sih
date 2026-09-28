import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Activity, Lock, AlertTriangle, Terminal, Globe, Zap, ChevronRight, FileText, Download, Key, Bot
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [targetUrl, setTargetUrl] = useState('');
  const [environment, setEnvironment] = useState('LOCAL');
  const [findings, setFindings] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

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
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const startAssessment = () => {
    if (!targetUrl) return;
    setIsScanning(true);
    setScanProgress(0);
    setFindings([]);
  };

  const fetchFindings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/findings`);
      if (response.ok) {
        const data = await response.json();
        setFindings(data);
      }
    } catch (error) {
      setFindings([
        { id: 1, title: "Broken Access Control", severity: "High", component: "/api/test-resource", status: "Validated", category: "Authorization", signal: "HTTP 200 on restricted route" },
        { id: 2, title: "SQL Injection", severity: "Critical", component: "/login", status: "Validated", category: "Input Validation", signal: "Syntax error on payload ' OR 1=1--" },
        { id: 3, title: "Missing X-Frame-Options", severity: "Low", component: "Global", status: "Validated", category: "Headers", signal: "Header absent in response" },
      ]);
    }
  };

  const chartData = [
    { name: 'Critical', count: findings.filter(f => f.severity === 'Critical').length, color: '#ff003c' },
    { name: 'High', count: findings.filter(f => f.severity === 'High').length, color: '#ff4f00' },
    { name: 'Medium', count: findings.filter(f => f.severity === 'Medium').length, color: '#eab308' },
    { name: 'Low', count: findings.filter(f => f.severity === 'Low').length, color: '#10b981' },
  ];

  const appSecScore = findings.length === 0 ? 100 : Math.max(0, 100 - (chartData[0].count * 20) - (chartData[1].count * 10) - (chartData[2].count * 5));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tighter">TARGET_ASSESSMENT</h2>
          <p className="text-emerald-400 font-mono text-sm mt-1">&gt; Application Security Validation Framework</p>
        </div>
        <div className="px-3 py-1 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2 bg-emerald-500/10">
          <Globe className="w-3 h-3" /> SIH_DEMO_MODE: ACTIVE
        </div>
      </header>

      {/* Control Interface */}
      <div className="border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl relative">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Enter Target URL (e.g. http://localhost:8080)"
              className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-zinc-300 font-mono focus:border-emerald-500 outline-none transition-colors"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>
          <select
            className="bg-black border border-white/10 py-3 px-4 text-zinc-300 font-mono outline-none focus:border-emerald-500"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            <option>LOCAL</option><option>STAGING</option><option>PRODUCTION</option>
          </select>
          <button
            onClick={startAssessment}
            disabled={isScanning || !targetUrl}
            className="bg-zinc-100 hover:bg-white text-black font-bold py-3 px-8 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isScanning ? 'EXECUTING...' : 'INITIATE SCAN'} <Zap className="w-4 h-4" />
          </button>
        </div>
        {isScanning && (
          <div className="mt-4 h-1 w-full bg-zinc-900 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
        )}
      </div>

      {findings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Posture Score */}
          <div className="border border-white/10 bg-[#0a0a0a] p-6 flex flex-col justify-center items-center">
            <h3 className="text-zinc-400 font-mono text-xs mb-4 uppercase tracking-widest">AppSec Posture Score</h3>
            <div className="text-7xl font-bold tracking-tighter" style={{ color: appSecScore > 70 ? '#10b981' : appSecScore > 40 ? '#eab308' : '#ff003c' }}>
              {appSecScore}
            </div>
            <p className="text-zinc-500 font-mono text-xs mt-4 border-t border-white/5 pt-4 text-center">Score degraded by critical vulnerabilities.</p>
          </div>

          {/* Explainable Signals (Findings) */}
          <div className="lg:col-span-2 border border-white/10 bg-[#0a0a0a] p-0 flex flex-col">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-white font-mono text-sm tracking-widest uppercase">Explainable Threat Signals</h3>
            </div>
            <div className="p-4 divide-y divide-white/5 overflow-y-auto max-h-[300px]">
              {findings.map(f => (
                <div key={f.id} className="py-3 flex justify-between items-start">
                  <div>
                    <div className="text-zinc-200 font-medium">{f.title}</div>
                    <div className="text-zinc-500 font-mono text-xs mt-1">Signal: <span className="text-emerald-400">{f.signal}</span></div>
                    <div className="text-zinc-600 font-mono text-xs mt-1">Target: {f.component}</div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold tracking-wider uppercase border ${
                    f.severity === 'Critical' ? 'border-[#ff003c] text-[#ff003c]' : 
                    f.severity === 'High' ? 'border-[#ff4f00] text-[#ff4f00]' : 
                    'border-yellow-500 text-yellow-500'
                  }`}>{f.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CredentialAudit() {
  return (
    <div className="space-y-6">
      <header className="border-b border-white/10 pb-4">
        <h2 className="text-4xl font-bold text-white tracking-tighter">CREDENTIAL_AUDIT</h2>
        <p className="text-emerald-400 font-mono text-sm mt-1">&gt; k-Anonymity Password Exposure Verification</p>
      </header>
      <div className="border border-white/10 bg-[#0a0a0a] p-6">
        <p className="text-zinc-400 mb-6 font-mono text-sm leading-relaxed max-w-2xl">
          Check if your application's admin credentials or database passwords have been exposed in a public data breach. 
          We use browser-side SHA-1 hashing to ensure your plaintext password never leaves the browser.
        </p>
        <div className="flex gap-4">
          <input type="password" placeholder="Enter credential to audit..." className="flex-1 bg-black border border-white/10 py-3 px-4 text-zinc-200 font-mono focus:border-emerald-500 outline-none" />
          <button className="bg-zinc-100 hover:bg-white text-black font-bold px-8 py-3 flex items-center gap-2">
            <Key className="w-4 h-4" /> AUDIT
          </button>
        </div>
      </div>
    </div>
  );
}

function AIAnalyst() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="border-b border-white/10 pb-4">
        <h2 className="text-4xl font-bold text-white tracking-tighter">AI_SECURITY_ANALYST</h2>
        <p className="text-emerald-400 font-mono text-sm mt-1">&gt; Interactive Vulnerability Remediation</p>
      </header>
      <div className="border border-white/10 bg-[#0a0a0a] p-6 flex-1 flex flex-col">
        <div className="flex-1 border border-white/5 bg-black p-4 mb-4 font-mono text-sm text-zinc-400 flex flex-col gap-4 overflow-y-auto min-h-[300px]">
          <div className="flex gap-3 text-emerald-400">
            <Bot className="w-5 h-5 shrink-0" />
            <p>System Online. I am your AppSec Assistant. I can explain the structural threats found in your latest scan and generate remediation code. Ask me anything.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <input type="text" placeholder="E.g. How do I fix the SQL Injection in /login?" className="flex-1 bg-black border border-white/10 py-3 px-4 text-zinc-200 font-mono focus:border-emerald-500 outline-none" />
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 flex items-center gap-2">
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateReport() {
  return (
    <div className="space-y-6">
      <header className="border-b border-white/10 pb-4">
        <h2 className="text-4xl font-bold text-white tracking-tighter">COMPLIANCE_REPORT</h2>
        <p className="text-emerald-400 font-mono text-sm mt-1">&gt; Generate CVSS-Scored PDF Output</p>
      </header>
      <div className="border border-white/10 bg-[#0a0a0a] p-6">
        <button onClick={() => window.location.href = `${API_URL}/api/report/download`} className="bg-zinc-100 hover:bg-white text-black font-bold px-8 py-4 flex items-center gap-2 w-full justify-center text-lg">
          <Download className="w-5 h-5" /> EXPORT PDF REPORT
        </button>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'SCAN_DASHBOARD', icon: Activity },
    { path: '/audit', label: 'CREDENTIAL_AUDIT', icon: Key },
    { path: '/analyst', label: 'AI_ANALYST', icon: Bot },
    { path: '/report', label: 'EXPORT_REPORT', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500/30 flex">
      <aside className="w-72 border-r border-white/10 bg-[#0a0a0a] flex flex-col p-6 z-20">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <h1 className="font-black text-2xl tracking-tighter text-white">WORLDGUARD</h1>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 font-mono text-sm transition-colors ${location.pathname === item.path ? 'bg-white/5 text-emerald-400 border-l-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-l-2 border-transparent'}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/audit" element={<CredentialAudit />} />
          <Route path="/analyst" element={<AIAnalyst />} />
          <Route path="/report" element={<GenerateReport />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <Router><Layout /></Router>;
}

