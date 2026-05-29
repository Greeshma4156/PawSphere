import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { ShieldCheck, Users, Heart, Activity, TrendingUp, AlertTriangle, MapPin, Sparkles } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

// Mock analytics data for premium admin dashboard
const rescuesByMonth = [
  { month: 'Jan', cases: 12, resolved: 10 },
  { month: 'Feb', cases: 19, resolved: 15 },
  { month: 'Mar', cases: 24, resolved: 22 },
  { month: 'Apr', cases: 31, resolved: 28 },
  { month: 'May', cases: 27, resolved: 25 },
  { month: 'Jun', cases: 38, resolved: 33 },
];

const speciesBreakdown = [
  { name: 'Dogs', value: 45, color: '#7C5CFC' },
  { name: 'Cats', value: 30, color: '#F59E6C' },
  { name: 'Birds', value: 15, color: '#6EE7B7' },
  { name: 'Other', value: 10, color: '#CBD5E1' },
];

const donationTrend = [
  { week: 'W1', amount: 320 },
  { week: 'W2', amount: 580 },
  { week: 'W3', amount: 450 },
  { week: 'W4', amount: 720 },
  { week: 'W5', amount: 640 },
  { week: 'W6', amount: 890 },
  { week: 'W7', amount: 1100 },
  { week: 'W8', amount: 950 },
];

const volunteerLeaderboard = [
  { name: 'John Doe', rescues: 14, points: 450, badge: '🥇' },
  { name: 'Alice Cooper', rescues: 9, points: 310, badge: '🥈' },
  { name: 'Raj Patel', rescues: 7, points: 280, badge: '🥉' },
  { name: 'Maya Singh', rescues: 5, points: 190, badge: '⭐' },
  { name: 'Carlos M.', rescues: 3, points: 120, badge: '⭐' },
];

const recentAuditLogs = [
  { id: 1, action: 'RESCUE_STATUS_UPDATED', details: 'Case #case_id_3 moved to "sheltered"', actor: 'Hope Animal Shelter', time: '2 min ago' },
  { id: 2, action: 'DONATION_RECEIVED', details: '$120 donated to Bruno Surgery Fund', actor: 'Sarah Connor', time: '15 min ago' },
  { id: 3, action: 'VOLUNTEER_VERIFIED', details: 'Alice Cooper identity documents approved', actor: 'Admin Commander', time: '1 hour ago' },
  { id: 4, action: 'CAMPAIGN_CREATED', details: 'New campaign "Vaccine Drive Phase 2" published', actor: 'Hope Animal Shelter', time: '3 hours ago' },
  { id: 5, action: 'ADOPTION_APPLICATION', details: 'Adoption application for Bella submitted', actor: 'Sarah Connor', time: '5 hours ago' },
];

export default function AdminPanel() {
  const { user } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');

  const statCards = useMemo(() => [
    { label: 'Total Rescues', value: '151', delta: '+12%', icon: Activity, color: 'lavender', bg: 'lavender/10' },
    { label: 'Active Volunteers', value: '34', delta: '+8%', icon: Users, color: 'peach', bg: 'peach/10' },
    { label: 'Funds Raised', value: '$4,820', delta: '+23%', icon: Heart, color: 'mint', bg: 'mint/15' },
    { label: 'Pending Cases', value: '7', delta: '-3', icon: AlertTriangle, color: 'red-500', bg: 'red-500/10' },
  ], []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rescues', label: 'Rescue Analytics' },
    { id: 'finances', label: 'Financial Ledger' },
    { id: 'audit', label: 'Audit Logs' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender/10 border border-lavender/20 rounded-full text-[10px] font-extrabold text-lavender uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Command Center
          </div>
          <h1 className="mt-3 font-extrabold font-outfit text-3xl md:text-4xl text-dark dark:text-cream">
            PawSphere Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time platform intelligence, volunteer coordination, and financial transparency dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/70 dark:bg-dark/70 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-2xl px-4 py-2.5 shadow-md">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-dark dark:text-cream">All systems operational</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-lavender text-white shadow-md'
                : 'bg-white/50 dark:bg-dark/50 border border-lavender/15 text-gray-600 dark:text-gray-300 hover:bg-lavender/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-[1.5rem] p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-${stat.bg}`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <span className={`text-[10px] font-extrabold ${
                stat.delta.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stat.delta}
              </span>
            </div>
            <p className="text-2xl font-extrabold font-outfit text-dark dark:text-cream">{stat.value}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area based on tab */}
      {(activeTab === 'overview' || activeTab === 'rescues') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Rescue Cases Bar Chart */}
          <div className="lg:col-span-8 bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-[2rem] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold font-outfit text-lg text-dark dark:text-cream flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-lavender" /> Monthly Rescue Operations
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Cases reported vs. successfully resolved per month</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rescuesByMonth} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(124,92,252,0.2)',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="cases" fill="#7C5CFC" radius={[8, 8, 0, 0]} name="Reported" />
                <Bar dataKey="resolved" fill="#6EE7B7" radius={[8, 8, 0, 0]} name="Resolved" />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Species Pie Chart */}
          <div className="lg:col-span-4 bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-[2rem] p-6 shadow-lg">
            <h3 className="font-extrabold font-outfit text-base text-dark dark:text-cream mb-4">Species Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={speciesBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {speciesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(124,92,252,0.2)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {speciesBreakdown.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                  {s.name} ({s.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'overview' || activeTab === 'finances') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donation Trend Area Chart */}
          <div className="lg:col-span-7 bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-[2rem] p-6 shadow-lg">
            <h3 className="font-extrabold font-outfit text-lg text-dark dark:text-cream flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-peach" /> Weekly Donation Inflow
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={donationTrend}>
                <defs>
                  <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.06)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(124,92,252,0.2)',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                  formatter={(value) => [`$${value}`, 'Donations']}
                />
                <Area type="monotone" dataKey="amount" stroke="#7C5CFC" strokeWidth={2.5} fill="url(#donationGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volunteer Leaderboard */}
          <div className="lg:col-span-5 bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-[2rem] p-6 shadow-lg">
            <h3 className="font-extrabold font-outfit text-base text-dark dark:text-cream flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-peach" /> Volunteer Leaderboard
            </h3>
            <div className="space-y-3">
              {volunteerLeaderboard.map((vol, idx) => (
                <div key={idx} className="flex items-center justify-between bg-beige/20 dark:bg-white/5 p-3 rounded-xl border border-lavender/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{vol.badge}</span>
                    <div>
                      <p className="text-xs font-bold text-dark dark:text-cream">{vol.name}</p>
                      <p className="text-[9px] text-gray-400">{vol.rescues} rescues completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold font-outfit text-lavender">{vol.points}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Section */}
      {(activeTab === 'overview' || activeTab === 'audit') && (
        <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/20 dark:border-white/5 rounded-[2rem] p-6 shadow-lg">
          <h3 className="font-extrabold font-outfit text-lg text-dark dark:text-cream flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Platform Audit Trail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-lavender/10">
                  <th className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pb-3 pr-4">Action</th>
                  <th className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pb-3 pr-4">Details</th>
                  <th className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pb-3 pr-4">Actor</th>
                  <th className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAuditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-lavender/5 last:border-0">
                    <td className="py-3 pr-4">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        log.action.includes('RESCUE') ? 'bg-lavender/10 text-lavender' :
                        log.action.includes('DONATION') ? 'bg-mint/15 text-emerald-600' :
                        log.action.includes('VOLUNTEER') ? 'bg-peach/15 text-peach' :
                        log.action.includes('ADOPTION') ? 'bg-pink-500/10 text-pink-500' :
                        'bg-gray-100 dark:bg-white/5 text-gray-500'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 pr-4 text-xs font-bold text-dark dark:text-cream">{log.actor}</td>
                    <td className="py-3 text-[10px] text-gray-400">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Platform Health Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'API Uptime', value: '99.97%', icon: '🟢' },
          { label: 'Avg. Response', value: '142ms', icon: '⚡' },
          { label: 'Socket Connections', value: '28 active', icon: '🔌' },
          { label: 'DB Mode', value: 'In-Memory', icon: '💾' },
        ].map((item, idx) => (
          <div key={idx} className="bg-beige/20 dark:bg-white/5 border border-lavender/10 rounded-2xl p-4 text-center">
            <span className="text-lg block">{item.icon}</span>
            <p className="text-sm font-extrabold font-outfit text-dark dark:text-cream mt-1">{item.value}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
