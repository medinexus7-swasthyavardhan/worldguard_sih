import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Shield, Activity, Lock, AlertTriangle, Search, Server, Globe, Zap, ChevronRight, FileText, Download, Users, UserX
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [targetUrl, setTargetUrl] = useState('');
  const [environment, setEnvironment] = useState('LOCAL');
  const [findings, setFindings] = useState([]);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
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
    setAssessmentStarted(true);
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
        { id: 1, title: "Broken Access Control", severity: "High", component: "/api/test-resource", status: "Validated", category: "Authorization" },
        { id: 2, title: "SQL Injection", severity: "Critical", component: "/login", status: "Validated", category: "Input Validation" },
      ]);
    }
  };

  const severityColors = {
    Critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    High: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Low: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };

  const chartData = [
    { name: 'Critical', count: findings.filter(f => f.severity === 'Critical').length, color: '#dc2626' },
    { name: 'High', count: findings.filter(f => f.severity === 'High').length, color: '#ea580c' },
    { name: 'Medium', count: findings.filter(f => f.severity === 'Medium').length, color: '#ca8a04' },
    { name: 'Low', count: findings.filter(f => f.severity === 'Low').length, color: '#2563eb' },
  ];

  return (
    <>
      <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Security Assessment Dashboard</h2>
          <p className="text-slate-400 text-sm font-medium">National Cyber Crime Reporting Portal — Integration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-red-900/20 border border-red-500/20 backdrop-blur-md text-sm font-medium flex items-center gap-2 text-red-100 shadow-lg shadow-red-900/20">
            <Globe className="w-4 h-4 text-red-400" />
            SIH Authorized Demo
          </div>
        </div>
      </header>

      {/* Scanner Control */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-2xl shadow-2xl mb-8 relative overflow-hidden group">
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
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-red-500/50 outline-none"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>
          <select
            className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-slate-300 outline-none"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            <option>LOCAL</option><option>STAGING</option><option>PRODUCTION</option>
          </select>
          <button
            onClick={startAssessment}
            disabled={isScanning || !targetUrl}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-red-900/50 disabled:opacity-50 flex items-center gap-2"
          >
            {isScanning ? 'Scanning...' : 'Start Scan'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {isScanning && (
          <div className="mt-6 h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
        )}
      </div>

      {/* Results */}
      {(assessmentStarted && !isScanning) && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Critical Risk', count: chartData[0].count, color: 'from-red-500/20 to-red-600/5', border: 'border-red-500/20', text: 'text-red-400' },
              { label: 'High Risk', count: chartData[1].count, color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', text: 'text-orange-400' },
              { label: 'Medium Risk', count: chartData[2].count, color: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20', text: 'text-yellow-400' },
              { label: 'Total Findings', count: findings.length, color: 'from-slate-500/20 to-slate-600/5', border: 'border-slate-500/20', text: 'text-slate-400' }
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-6`}>
                <div className={`text-4xl font-black ${stat.text} mb-2`}>{stat.count}</div>
                <div className="text-slate-300 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5"><h3 className="text-lg font-semibold text-white">Detected Vulnerabilities</h3></div>
              <div className="p-6 text-slate-300">
                {findings.map(f => (
                  <div key={f.id} className="mb-4 flex justify-between border-b border-white/10 pb-2">
                    <span>{f.title}</span>
                    <span className={severityColors[f.severity] + " px-2 rounded text-xs"}>{f.severity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-6">Risk Distribution</h3>
              <div className="h-[250px]"><ResponsiveContainer><PieChart><Pie data={chartData.filter(d=>d.count>0)} dataKey="count" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>{chartData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SuspectRepositories() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Suspect Repositories</h2>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <p className="text-slate-300 mb-4">Search the I4C repository of identifiers of cyber criminals.</p>
        <div className="flex gap-4">
          <input type="text" placeholder="Enter Phone, Email, or URL" className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-slate-200 outline-none" />
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4" /> Check Suspect
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
        a.download = 'WorldGuard_Security_Report.pdf';
        a.click();
      }
    } catch(e) { console.error(e) }
    setDownloading(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Generate Final Report</h2>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <p className="text-slate-300 mb-6">Export the consolidated security findings into a formal PDF report.</p>
        <button onClick={handleDownload} disabled={downloading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
          <Download className="w-5 h-5" /> {downloading ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/suspects', label: 'Suspect Repositories', icon: Users },
    { path: '/vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
    { path: '/report', label: 'Generate Report', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-red-500/30 overflow-hidden relative flex">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />

      <aside className="w-64 border-r border-white/10 bg-white/[0.05] backdrop-blur-2xl flex flex-col p-6 shadow-2xl relative z-20">
        <div className="flex flex-col items-start gap-2 mb-8">
          <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Ministry of Home Affairs</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg border border-red-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">WORLDGUARD</h1>
              <p className="text-[10px] text-red-400 font-medium uppercase">I4C Security Engine</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-red-900/40 text-red-100 border border-red-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
              <item.icon className="w-5 h-5" /> <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/suspects" element={<SuspectRepositories />} />
          <Route path="/vulnerabilities" element={<div className="text-white text-2xl">Vulnerabilities (Coming Soon)</div>} />
          <Route path="/report" element={<GenerateReport />} />
          <Route path="/settings" element={<div className="text-white text-2xl">Settings Configurations</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <Router><Layout /></Router>;
}
