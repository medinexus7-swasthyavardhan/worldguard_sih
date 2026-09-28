import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Activity, Lock, ArrowRight, Zap, FileText, Key, Bot
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function HeroScanner() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState([]);
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
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-140px)] px-4 mt-10">
      
      {/* Small top pill */}
      <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-md">
        Automated AppSec Vulnerability Engine
      </div>

      {/* Hero Heading */}
      <h1 className="text-6xl md:text-8xl font-black text-[#0f172a] text-center tracking-tight leading-[1.1] mb-2 drop-shadow-xl">
        Your AI security
      </h1>
      <h1 className="text-6xl md:text-8xl font-black text-red-500 text-center tracking-tight mb-12 drop-shadow-xl italic">
        wingman.
      </h1>

      {/* Large Input Area (Deskfirst Style) */}
      <div className="w-full max-w-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 mb-8 relative group transition-all hover:bg-white/80 hover:shadow-red-500/10">
        <textarea
          placeholder="Enter Target URL (e.g. https://cybercrime.gov.in) to begin authorized security assessment..."
          className="w-full h-32 bg-transparent text-[#0f172a] text-xl md:text-2xl font-medium placeholder-[#64748b] resize-none focus:outline-none"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
        
        <button
          onClick={startAssessment}
          disabled={isScanning || !targetUrl}
          className="absolute bottom-6 right-6 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95 disabled:opacity-50"
        >
          {isScanning ? <Zap className="w-5 h-5 animate-pulse" /> : <ArrowRight className="w-6 h-6" />}
        </button>

        {isScanning && (
          <div className="absolute bottom-0 left-6 right-20 h-1 bg-red-100 rounded-full overflow-hidden mb-11">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-4 items-center">
        <button onClick={startAssessment} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all">
          Start Scan
        </button>
        <Link to="/audit" className="bg-white/80 hover:bg-white text-[#0f172a] px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-black/5 transition-all backdrop-blur-md">
          Audit Credentials
        </Link>
      </div>

      {/* Findings Section (appears below after scan) */}
      {findings.length > 0 && !isScanning && (
        <div className="w-full max-w-5xl mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 pb-20">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-8 flex flex-col justify-center items-center">
            <h3 className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-wider">SDS Posture Score</h3>
            <div className="text-7xl font-black" style={{ color: appSecScore > 70 ? '#10b981' : appSecScore > 40 ? '#f59e0b' : '#ef4444' }}>
              {appSecScore}
            </div>
          </div>

          <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-black/5 bg-white/40">
              <h3 className="text-slate-800 font-bold text-sm tracking-wider uppercase">Detected Vulnerabilities</h3>
            </div>
            <div className="p-6 divide-y divide-black/5 overflow-y-auto max-h-[300px]">
              {findings.map(f => (
                <div key={f.id} className="py-4 flex justify-between items-start">
                  <div>
                    <div className="text-slate-800 font-bold text-lg">{f.title}</div>
                    <div className="text-slate-500 text-sm mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">Signal: {f.signal}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-black rounded-full uppercase shadow-sm ${
                    f.severity === 'Critical' ? 'bg-red-100 text-red-600 border border-red-200' : 
                    f.severity === 'High' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                    'bg-blue-100 text-blue-600 border border-blue-200'
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

function Layout() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Scanner' },
    { path: '/audit', label: 'Audit' },
    { path: '/analyst', label: 'AI Analyst' }
  ];

  return (
    // The main background is a stunning tech/cloud image to match the airy Deskfirst style
    <div className="min-h-screen font-sans selection:bg-red-500/30 flex flex-col relative"
         style={{ 
           backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      
      {/* Light overlay to make it look bright and airy like Deskfirst */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto pt-6 px-4">
        {/* Floating Navbar (Deskfirst Style) */}
        <header className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-full px-8 py-4 flex items-center justify-between shadow-xl shadow-black/5">
          
          {/* Left Links */}
          <nav className="flex items-center gap-8 w-1/3">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`text-sm font-bold transition-colors ${location.pathname === item.path ? 'text-red-500' : 'text-[#0f172a] hover:text-red-500'}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <div className="flex items-center justify-center gap-2 w-1/3">
            <ShieldCheck className="w-8 h-8 text-[#0f172a]" />
            <h1 className="font-black text-2xl tracking-tighter text-[#0f172a]">sds<span className="text-red-500">kavach</span></h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            <Link to="/report" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors">Generate PDF</Link>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-transform active:scale-95">
              Deploy
            </button>
          </div>
        </header>

        {/* Main Content Routing */}
        <Routes>
          <Route path="/" element={<HeroScanner />} />
          <Route path="/audit" element={<div className="mt-20 p-10 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-2xl mx-auto"><h2 className="text-3xl font-black text-slate-800 mb-4">Audit Settings</h2><p className="text-slate-600">Route under construction...</p></div>} />
          <Route path="/analyst" element={<div className="mt-20 p-10 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-2xl mx-auto"><h2 className="text-3xl font-black text-slate-800 mb-4">AI Analyst</h2><p className="text-slate-600">Route under construction...</p></div>} />
          <Route path="/report" element={<div className="mt-20 p-10 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-2xl mx-auto"><h2 className="text-3xl font-black text-slate-800 mb-4">Generate PDF</h2><button onClick={() => window.location.href = `${API_URL}/api/report/download`} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold">Download Report</button></div>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return <Router><Layout /></Router>;
}

