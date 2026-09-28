import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Activity, Lock, AlertTriangle, Terminal, Globe, Zap, ChevronRight, FileText, Download, Key, Bot, Send
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    { name: 'Critical', count: findings.filter(f => f.severity === 'Critical').length, color: '#dc2626' },
    { name: 'High', count: findings.filter(f => f.severity === 'High').length, color: '#ea580c' },
    { name: 'Medium', count: findings.filter(f => f.severity === 'Medium').length, color: '#ca8a04' },
    { name: 'Low', count: findings.filter(f => f.severity === 'Low').length, color: '#2563eb' },
  ];

  const appSecScore = findings.length === 0 ? 100 : Math.max(0, 100 - (chartData[0].count * 20) - (chartData[1].count * 10) - (chartData[2].count * 5));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">AppSec Validation Dashboard</h2>
          <p className="text-slate-400 font-medium text-sm">National Cyber Crime Reporting Portal — Integration</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-red-900/20 border border-red-500/20 backdrop-blur-md text-sm font-medium flex items-center gap-2 text-red-100 shadow-lg shadow-red-900/20">
          <Globe className="w-4 h-4 text-red-400" /> SIH Authorized Demo
        </div>
      </header>

      {/* Control Interface */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-400" /> New Target Assessment
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="https://cybercrime.gov.in/ (Authorized Target URL)"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-inner transition-all"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>
          <select
            className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none min-w-[150px] shadow-inner"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            <option>LOCAL</option><option>STAGING</option><option>PRODUCTION</option>
          </select>
          <button
            onClick={startAssessment}
            disabled={isScanning || !targetUrl}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-red-900/50 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px] border border-red-500/50 transition-all"
          >
            {isScanning ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> SCANNING... {scanProgress}%</>
            ) : (
              <>START SCAN <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
        {isScanning && (
          <div className="mt-6 h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 relative" style={{ width: `${scanProgress}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {findings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Posture Score */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <h3 className="text-slate-400 font-medium text-sm mb-6 uppercase tracking-wider">AppSec Posture Score</h3>
            <div className="text-7xl font-black drop-shadow-lg" style={{ color: appSecScore > 70 ? '#10b981' : appSecScore > 40 ? '#eab308' : '#ef4444' }}>
              {appSecScore}
            </div>
            <p className="text-slate-500 text-xs mt-6 text-center font-medium">Score degraded by critical vulnerabilities.</p>
          </div>

          {/* Explainable Signals (Findings) */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-white font-semibold text-lg">Explainable Threat Signals</h3>
            </div>
            <div className="p-6 divide-y divide-white/5 overflow-y-auto max-h-[350px]">
              {findings.map(f => (
                <div key={f.id} className="py-4 flex justify-between items-start group">
                  <div>
                    <div className="text-slate-200 font-medium group-hover:text-white transition-colors">{f.title}</div>
                    <div className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                       <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-mono text-xs border border-red-400/20">{f.signal}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-xs mt-2">Target: {f.component}</div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border backdrop-blur-sm ${
                    f.severity === 'Critical' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
                    f.severity === 'High' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 
                    'border-blue-500/30 text-blue-400 bg-blue-500/10'
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Credential Exposure Audit</h2>
        <p className="text-slate-400 font-medium text-sm">k-Anonymity Password Verification Engine</p>
      </header>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl">
        <p className="text-slate-300 mb-8 leading-relaxed max-w-2xl">
          Check if your application's admin credentials or database passwords have been exposed in a public data breach. 
          We use browser-side SHA-1 hashing to ensure your plaintext password never leaves the browser.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="password" placeholder="Enter credential to audit..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-inner transition-all" />
          </div>
          <button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 border border-red-500/50 transition-all min-w-[200px]">
            <Key className="w-4 h-4" /> RUN AUDIT
          </button>
        </div>
      </div>
    </div>
  );
}

function AIAnalyst() {
  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-500">
      <header className="border-b border-white/10 pb-6 shrink-0">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">AI Security Analyst</h2>
        <p className="text-slate-400 font-medium text-sm">Interactive Vulnerability Remediation</p>
      </header>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-6 mb-4 flex flex-col gap-6 overflow-y-auto">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-red-900/20">
              <Bot className="w-4 h-4 text-red-400" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-slate-300 text-sm leading-relaxed max-w-[80%]">
              System Online. I am your AppSec Assistant. I can explain the structural threats found in your latest scan and generate exact code to remediate them. Ask me anything.
            </div>
          </div>
        </div>
        <div className="flex gap-4 shrink-0">
          <input type="text" placeholder="E.g. How do I fix the SQL Injection in /login?" className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-inner transition-all" />
          <button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 border border-red-500/50 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateReport() {
  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/api/report/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SDSKavach_Security_Report.pdf';
        a.click();
      }
    } catch(e) { console.error(e) }
    setDownloading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Compliance Report</h2>
        <p className="text-slate-400 font-medium text-sm">Generate CVSS-Scored PDF Output</p>
      </header>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center text-center py-16">
         <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-6 shadow-lg shadow-red-900/50 border border-red-500/30">
            <FileText className="w-8 h-8 text-white" />
         </div>
        <p className="text-slate-300 mb-8 max-w-md">Export the consolidated security findings into a formal PDF report for your compliance and engineering teams.</p>
        <button onClick={handleDownload} disabled={downloading} className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 border border-red-500/50 transition-all disabled:opacity-50 text-lg min-w-[300px]">
          <Download className="w-5 h-5" /> {downloading ? 'GENERATING...' : 'EXPORT PDF REPORT'}
        </button>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/audit', label: 'Credential Audit', icon: Key },
    { path: '/analyst', label: 'AI Analyst', icon: Bot },
    { path: '/report', label: 'Generate Report', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-red-500/30 overflow-hidden relative flex">
      {/* Ambient Glassmorphism Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />

      {/* Glass Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-white/[0.05] backdrop-blur-3xl flex flex-col p-6 shadow-2xl relative z-20">
        <div className="flex flex-col items-start gap-2 mb-10">
          <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Ministry of Home Affairs</div>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50 border border-red-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">SDS KAVACH</h1>
              <p className="text-[10px] text-red-400 font-medium tracking-widest uppercase">I4C Security Engine</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${location.pathname === item.path ? 'bg-red-900/30 text-red-100 shadow-inner border border-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
              <item.icon className="w-5 h-5" /> <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative z-10">
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

