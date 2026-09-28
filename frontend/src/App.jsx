import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Activity, Lock, Terminal, Globe, Zap, FileText, Download, Key, Bot, Send, Search
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [targetUrl, setTargetUrl] = useState('');
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Search className="w-5 h-5 text-emerald-400" /> Target Assessment Engine
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Enter Target URL (e.g. https://cybercrime.gov.in)"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>
          <button
            onClick={startAssessment}
            disabled={isScanning || !targetUrl}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-w-[160px]"
          >
            {isScanning ? 'SCANNING...' : 'SCAN'} <Zap className="w-4 h-4" />
          </button>
        </div>
        {isScanning && (
          <div className="mt-4 h-1 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
        )}
      </div>

      {findings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center">
            <h3 className="text-zinc-400 font-mono text-xs mb-4 uppercase tracking-wider">SDS Posture Score</h3>
            <div className="text-6xl font-bold font-mono tracking-tighter" style={{ color: appSecScore > 70 ? '#10b981' : appSecScore > 40 ? '#eab308' : '#ef4444' }}>
              {appSecScore}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 bg-[#161616]">
              <h3 className="text-white font-mono text-sm tracking-wider uppercase">Detected Vulnerabilities</h3>
            </div>
            <div className="p-4 divide-y divide-white/5 overflow-y-auto max-h-[300px]">
              {findings.map(f => (
                <div key={f.id} className="py-3 flex justify-between items-start">
                  <div>
                    <div className="text-zinc-200 font-medium">{f.title}</div>
                    <div className="text-zinc-500 text-xs mt-1 font-mono">Signal: <span className="text-emerald-400">{f.signal}</span></div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border ${
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
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 animate-in fade-in duration-500">
      <h3 className="text-lg font-semibold text-white mb-2 font-mono uppercase tracking-wider flex items-center gap-2">
        <Key className="w-5 h-5 text-emerald-400" /> Credential Exposure Audit
      </h3>
      <p className="text-zinc-400 mb-6 text-sm">Verify if database passwords have been exposed in a public data breach using browser-side k-anonymity hashing.</p>
      <div className="flex gap-4">
        <input type="password" placeholder="Enter credential to audit..." className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-sm" />
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-lg transition-colors">
          AUDIT
        </button>
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
    <div className="bg-[#111] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center py-16 animate-in fade-in duration-500">
       <FileText className="w-12 h-12 text-emerald-500 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2 font-mono uppercase tracking-wider">Compliance Report</h3>
      <p className="text-zinc-400 mb-8 max-w-md text-sm">Export the consolidated security findings into a formal PDF report for compliance teams.</p>
      <button onClick={handleDownload} disabled={downloading} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-10 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
        <Download className="w-4 h-4" /> {downloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
      </button>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'SCAN', icon: Activity },
    { path: '/audit', label: 'AUDIT', icon: Key },
    { path: '/report', label: 'REPORT', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-emerald-500/30 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0a0a0a] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h1 className="font-bold text-xl tracking-tight text-white uppercase font-mono">SDS Kavach</h1>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-colors ${location.pathname === item.path ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2 bg-emerald-500/10 rounded-full">
            <Globe className="w-3 h-3" /> DEMO
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column: Routes */}
        <div className="flex-1 overflow-y-auto min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/audit" element={<CredentialAudit />} />
            <Route path="/report" element={<GenerateReport />} />
          </Routes>
        </div>

        {/* Right Column: Persistent AI Assistant */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden h-[calc(100vh-120px)] sticky top-[88px]">
          <div className="p-4 border-b border-white/10 bg-[#111] flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-mono text-sm uppercase tracking-wider">SDS AI Analyst</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
             <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-sm text-zinc-300 font-mono leading-relaxed">
               <span className="text-emerald-400 font-bold">AI:</span> System Online. I can explain the structural threats found in your latest scan and generate exact code to remediate them. Ask me anything.
             </div>
          </div>
          <div className="p-4 border-t border-white/10 bg-[#111]">
            <div className="flex gap-2 relative">
              <input type="text" placeholder="Message AI..." className="flex-1 bg-[#050505] border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-mono" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <Router><Layout /></Router>;
}

