import React, { useMemo } from 'react';
import { ArrowRight, Ship, History, MapPin } from 'lucide-react';

const RouteEmissionAnalysis = ({ vesselData }) => {
  const routeStats = useMemo(() => {
    if (!vesselData || vesselData.length === 0) return [];
    
    const stats = {};
    const GWP_CH4 = 25; 
    const GWP_N2O = 298;
    
    let grandTotalCO2e = 0;

    vesselData.forEach(v => {
      const from = v.LOCATION_FROM || v.Location_From || 'TIDAK DIKETAHUI';
      const to = v.LOCATION_TO || v.Location_To || 'TIDAK DIKETAHUI';
      const key = `${from} | ${to}`; 

      const vCO2 = v.Total_CO2 || 0;
      const vN2O = v.Total_N2O || 0;
      const vCH4 = v.Total_CH4 || 0;
      const vCO2e = vCO2 + (vCH4 * GWP_CH4) + (vN2O * GWP_N2O);

      grandTotalCO2e += vCO2e;

      if (!stats[key]) {
        stats[key] = {
          from, to,
          totalCO2: 0, totalN2O: 0, totalCH4: 0, totalCO2e: 0, count: 0,
          topVessel: { name: '', co2e: 0, co2: 0, n2o: 0, ch4: 0 }
        };
      }
      
      stats[key].totalCO2 += vCO2;
      stats[key].totalN2O += vN2O;
      stats[key].totalCH4 += vCH4;
      stats[key].totalCO2e += vCO2e;
      stats[key].count += 1;
      
      if (vCO2 > stats[key].topVessel.co2) {
        stats[key].topVessel = { 
            name: v.VESSEL_NAME || v.Vessel_Name || 'N/A', 
            co2e: vCO2e, co2: vCO2, n2o: vN2O, ch4: vCH4 
        };
      }
    });

    return Object.values(stats)
      .map(route => ({
        ...route,
        contribution: grandTotalCO2e > 0 ? (route.totalCO2e / grandTotalCO2e) * 100 : 0
      }))
      .sort((a, b) => b.totalCO2 - a.totalCO2)
      .slice(0, 15); 
  }, [vesselData]);

  return (
    <div className="w-full bg-white rounded-xl p-8 border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden font-['Poppins',sans-serif]">
      
      {/* Header antarmuka utama */}
      <div className="mb-6 flex justify-between items-start border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Dinamika Rute & Distribusi Emisi
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Top 15 Rute Emisi Teratas
          </p>
        </div>
      </div>

      {/* Kontainer daftar rute */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
        {routeStats.map((route, idx) => {
          const isTop3 = idx < 3;
          const rankColor = idx === 0 ? 'text-[#00529B] bg-blue-50 border-blue-100' : 
                            idx === 1 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 
                            idx === 2 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                            'text-slate-500 bg-slate-50 border-slate-200';
          const barColor = idx === 0 ? 'bg-[#00529B]' : idx === 1 ? 'bg-indigo-400' : idx === 2 ? 'bg-emerald-400' : 'bg-slate-300';

          return (
            <div key={idx} className="group rounded-xl p-5 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-300">
              
              {/* Metrik peringkat kontribusi */}
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50">
                <div className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${rankColor}`}>
                  Peringkat {idx + 1}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 leading-none">
                      {route.contribution.toFixed(1)}<span className="text-[10px] text-slate-500 font-medium ml-0.5">%</span>
                    </p>
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1">Beban CO₂e</p>
                  </div>
                  {/* Bilah progres kontribusi */}
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                     <div className={`h-full rounded-full ${barColor}`} style={{ width: `${route.contribution}%` }} />
                  </div>
                </div>
              </div>

              {/* Tata letak rincian */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                
                {/* Panel informasi spasial */}
                <div className="col-span-1 lg:col-span-5 flex flex-col lg:border-r lg:border-slate-100 lg:pr-4">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Lokasi Asal (From)</p>
                      <p className="text-xs font-bold text-slate-800 uppercase leading-snug">{route.from}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ArrowRight size={14} className="text-[#00529B] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Tujuan Area (To)</p>
                      <p className="text-xs font-bold text-[#00529B] uppercase leading-snug">{route.to}</p>
                    </div>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md w-fit">
                    <History size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{route.count} Kunjungan Log</span>
                  </div>
                </div>

                {/* Panel agregasi emisi */}
                <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">
                  
                  {/* Matriks emisi gas */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-center">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">CO₂ (Ton)</p>
                      <p className="text-xs font-bold text-slate-700">{route.totalCO2.toFixed(1)}</p>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-center">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">N₂O (Ton)</p>
                      <p className="text-xs font-bold text-slate-700">{route.totalN2O.toFixed(3)}</p>
                    </div>
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-center">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">CH₄ (Ton)</p>
                      <p className="text-xs font-bold text-slate-700">{route.totalCH4.toFixed(3)}</p>
                    </div>
                  </div>

                  {/* Entitas penyumbang tertinggi */}
                  <div className="flex justify-between items-center bg-blue-50/40 p-3.5 rounded-lg border border-blue-100/50">
                     <div className="flex items-center gap-3 w-full min-w-0 pr-3">
                        <div className={`p-2 rounded-md shrink-0 ${isTop3 ? 'bg-blue-100 text-[#00529B]' : 'bg-white border border-slate-200 text-slate-400'}`}>
                          <Ship size={14} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col min-w-0 w-full">
                          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide leading-none mb-1.5">Penyumbang CO₂ Terbesar</p>
                          <p className="text-[11px] font-bold text-slate-800 uppercase leading-none truncate w-full" title={route.topVessel.name}>
                            {route.topVessel.name}
                          </p>
                        </div>
                     </div>
                     <div className="text-right flex flex-col shrink-0">
                        <p className="text-xs font-bold text-[#00529B] leading-none mb-1.5">{route.topVessel.co2.toFixed(1)}</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none">Ton CO₂</p>
                     </div>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteEmissionAnalysis;