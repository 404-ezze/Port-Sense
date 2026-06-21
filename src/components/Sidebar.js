import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3,
  Zap,
  ChevronLeft
} from 'lucide-react';
import Logo1 from '../assets/logo1.svg';

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  activeTab,    
  setActiveTab  
}) => {
  if (!isOpen) return null;

  const getNavLinkClass = (tabName) => `
    w-full flex items-center gap-4 px-8 py-4 transition-all duration-300 group relative
    ${activeTab === tabName 
      ? 'bg-gradient-to-r from-white/10 to-transparent text-white font-black' 
      : 'text-white/60 hover:bg-white/5 hover:text-white font-medium'}
  `;

  const activeIndicator = (tabName) => activeTab === tabName && (
    <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
  );

  return (
    <aside className="w-80 bg-[#184680] text-white flex flex-col shadow-2xl z-[2000] h-screen transition-all relative border-r border-white/10 font-['Poppins',sans-serif]">
      
      {/* HEADER BRANDING */}
      <div className="p-10 bg-[#184680] flex flex-col items-center">
        <div className="relative mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/10 overflow-hidden p-3"
            style={{ backgroundColor: '#ECECEC' }}
          >
            <img src={Logo1} alt="Port-Sense" className="w-full h-full object-contain" />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="font-black text-2xl tracking-tighter leading-none uppercase italic">
            PORT<span className="text-blue-300">-</span>SENSE
          </h1>
          <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] mt-2 leading-tight">
            Port Sustainability Emission<br/>& Simulation Engine
          </p>
        </div>
      </div>

      {/* MENU NAVIGASI */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="space-y-1">      
          <div className="space-y-1">
            
            <button onClick={() => setActiveTab('dashboard')} className={getNavLinkClass('dashboard')}>
              {activeIndicator('dashboard')}
              <LayoutDashboard size={19} />
              <span className="text-[10px] uppercase tracking-[0.2em]">Dasbor Utama</span>
            </button>

            <button onClick={() => setActiveTab('analytics')} className={getNavLinkClass('analytics')}>
              {activeIndicator('analytics')}
              <BarChart3 size={19} />
              <span className="text-[10px] uppercase tracking-[0.2em]">Inventarisasi Emisi</span>
            </button>

            <button onClick={() => setActiveTab('simulation')} className={getNavLinkClass('simulation')}>
              {activeIndicator('simulation')}
              <Zap size={19} />
              <span className="text-[10px] uppercase tracking-[0.2em]">Simulasi Mitigasi</span>
            </button>

            <button onClick={() => setActiveTab('database')} className={getNavLinkClass('database')}>
              {activeIndicator('database')}
              <Database size={19} />
              <span className="text-[10px] uppercase tracking-[0.2em]">Repositori Data</span>
            </button>

          </div>
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-8 bg-transparent border-t border-white/5">
        <div className="flex flex-col gap-1 px-1">
          <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Dirancang & Dikembangkan oleh</p>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-black text-white uppercase tracking-normal">Dinda Jelita</p>
            <div className="w-1 h-1 bg-blue-300 rounded-full opacity-30" />
            <p className="text-[8px] font-bold text-white/40 uppercase">© 2026</p>
          </div>
        </div>
      </div>

      {/* TOMBOL COLLAPSE */}
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white text-[#184680] rounded-full p-2 shadow-2xl border border-blue-50 hover:scale-110 transition-all z-[2001]"
      >
        <ChevronLeft size={14} strokeWidth={3} />
      </button>

    </aside>
  );
};

export default Sidebar;