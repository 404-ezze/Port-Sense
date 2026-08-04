import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ShorePowerSimulation from './components/ShorePowerSimulation';
import VesselDatabase from './components/VesselDatabase';
import DigitalTwinOverview from './components/Dashboard/DigitalTwinOverview';
import VesselSizeAnalysis from './components/VesselSizeAnalysis';
import RouteEmissionAnalysis from './components/RouteEmissionAnalysis';
import VesselStatistics from './components/VesselStatistics';
import SizeDistribution from './components/SizeDistribution';

const App = () => {
  // State data JSON.
  const [vesselData, setVesselData] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analyticsSubTab, setAnalyticsSubTab] = useState('fleet'); 
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
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[#F8FAFC] relative font-['Poppins',sans-serif] text-slate-900">
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-[3000] bg-white p-2.5 md:p-3 rounded-xl shadow-md border border-slate-200 text-[#00529B] hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          <Menu className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
        </button>
      )}

      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-hidden">
          
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
              <DigitalTwinOverview vesselData={vesselData} /> 
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="h-full flex flex-col gap-4 md:gap-6 p-4 md:p-8 animate-in slide-in-from-bottom-10 duration-700 font-['Poppins',sans-serif]">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-white p-2 rounded-2xl sm:rounded-[24px] w-full sm:w-fit border border-slate-100 shadow-sm">
                <button 
                  onClick={() => setAnalyticsSubTab('fleet')}
                  className={`px-4 sm:px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full text-[9px] sm:text-[10px] font-black tracking-wider transition-all ${analyticsSubTab === 'fleet' ? 'bg-[#00529B] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  INFORMASI STATISTIK KAPAL
                </button>
                <button 
                  onClick={() => setAnalyticsSubTab('logistics')}
                  className={`px-4 sm:px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full text-[9px] sm:text-[10px] font-black tracking-wider transition-all ${analyticsSubTab === 'logistics' ? 'bg-[#00529B] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  INFORMASI RUTE KAPAL
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-0 sm:pr-4 custom-scrollbar">
                {analyticsSubTab === 'fleet' && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                    <VesselStatistics vesselData={vesselData} mode="top5" /> 
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                        <VesselSizeAnalysis vesselData={vesselData} />
                        <div className="flex flex-col gap-6 md:gap-8">
                          <VesselStatistics vesselData={vesselData} mode="korelasi" />
                        </div>
                        <div className="col-span-1 xl:col-span-full w-full">
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

          {activeTab === 'simulation' && (
            <div className="h-full p-4 md:p-8 overflow-y-auto custom-scrollbar animate-in slide-in-from-left-10 duration-700">
              <ShorePowerSimulation vesselData={vesselData} />
            </div>
          )}
          {activeTab === 'database' && (
            <div className="h-full p-4 md:p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
              <VesselDatabase vesselData={vesselData} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;