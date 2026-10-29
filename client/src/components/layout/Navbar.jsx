import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { Menu, LogOut, ShieldCheck, Briefcase, UserCheck, ChevronDown, Clock } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, quickLogin } = useAuth();
  const [time, setTime] = useState(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> HR Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <Briefcase className="w-3 h-3" /> Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3" /> Employee
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 rounded-lg hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {time.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100 cursor-pointer"
            title="Switch Persona"
          >
            <span>Role:</span>
            <span className="capitalize font-bold">{user?.role}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1-Click Switch Persona
              </div>
              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await quickLogin('hr');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                  user?.role === 'hr' ? 'bg-indigo-50/50 text-indigo-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <span>👑 Sarah Jenkins</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">HR Admin</span>
              </button>
              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await quickLogin('manager');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                  user?.role === 'manager' ? 'bg-indigo-50/50 text-indigo-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <span>👔 Marcus Vance</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Manager</span>
              </button>
              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await quickLogin('employee');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                  user?.role === 'employee' ? 'bg-indigo-50/50 text-indigo-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <span>💻 Alex Rivera</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Employee</span>
              </button>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Staff')}`
            }
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-sm bg-slate-100"
          />
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.position || user?.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

