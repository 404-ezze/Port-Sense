import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

// Core Components
import Sidebar from './components/Sidebar';
import ShorePowerSimulation from './components/ShorePowerSimulation';
import VesselDatabase from './components/VesselDatabase';
import DigitalTwinOverview from './components/Dashboard/DigitalTwinOverview';
import VesselSizeAnalysis from './components/VesselSizeAnalysis';
import RouteEmissionAnalysis from './components/RouteEmissionAnalysis';
import VesselStatistics from './components/VesselStatistics';
import SizeDistribution from './components/SizeDistribution';

const App = () => {
  // State untuk menampung data JSON
  const [vesselData, setVesselData] = useState([]);
  
  // Default tab diarahkan ke Dashboard utama
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analyticsSubTab, setAnalyticsSubTab] = useState('fleet'); 

  // Mengambil data JSON dari folder public/data saat aplikasi dimuat
  useEffect(() => {
    fetch('/data/vesselData.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Gagal memuat data vessel');
        }
        return response.json();
      })
      .then((data) => setVesselData(data))
      .catch((error) => console.error('Error loading vessel data:', error));
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] relative font-['Poppins',sans-serif] text-slate-900">
      
      {/* FLOATING OPEN BUTTON (Muncul jika sidebar di-collapse) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-6 z-[3000] bg-white p-3 rounded-xl shadow-md border border-slate-200 text-[#00529B] hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      )}
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-hidden">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
              <DigitalTwinOverview vesselData={vesselData} /> 
            </div>
          )}

          {/* TAB 2: INVENTARISASI EMISI */}
          {activeTab === 'analytics' && (
            <div className="h-full flex flex-col gap-6 p-8 animate-in slide-in-from-bottom-10 duration-700 font-['Poppins',sans-serif]">
              <div className="flex gap-4 bg-white p-2 rounded-[24px] w-fit border border-slate-100 shadow-sm">
                <button 
                  onClick={() => setAnalyticsSubTab('fleet')}
                  className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${analyticsSubTab === 'fleet' ? 'bg-[#00529B] text-white' : 'text-slate-400'}`}
                >
                  INFORMASI STATISTIK KAPAL
                </button>
                <button 
                  onClick={() => setAnalyticsSubTab('logistics')}
                  className={`px-6 py-2 rounded-full text-[10px] font-black transition-all ${analyticsSubTab === 'logistics' ? 'bg-[#00529B] text-white' : 'text-slate-400'}`}
                >
                  INFORMASI RUTE KAPAL
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {analyticsSubTab === 'fleet' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <VesselStatistics vesselData={vesselData} mode="top5" /> 
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <VesselSizeAnalysis vesselData={vesselData} />
                        <div className="flex flex-col gap-8">
                          <VesselStatistics vesselData={vesselData} mode="korelasi" />
                        </div>
                        <div className="col-span-1 md:col-span-full lg:col-span-full w-full">
                          <SizeDistribution vesselData={vesselData} />
                        </div>
                    </div>
                  </div>
                )}
                {analyticsSubTab === 'logistics' && (
                  <div className="animate-in fade-in duration-500">
                    <RouteEmissionAnalysis vesselData={vesselData} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MITIGATION SIMULATION */}
          {activeTab === 'simulation' && (
            <div className="h-full p-8 overflow-y-auto custom-scrollbar animate-in slide-in-from-left-10 duration-700">
              <ShorePowerSimulation vesselData={vesselData} />
            </div>
          )}

          {/* TAB 4: MASTER REPOSITORY (DATABASE) */}
          {activeTab === 'database' && (
            <div className="h-full p-8 animate-in fade-in duration-500">
              <VesselDatabase vesselData={vesselData} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;