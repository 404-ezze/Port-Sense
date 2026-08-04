import React, { useMemo, useState } from 'react';
import PortIcon from '../../assets/port.png';
import { ArrowRight, Activity, Ship, Zap, Wind } from 'lucide-react';

const MapView = ({ vessels = [] }) => {
  const [hoveredRouteId, setHoveredRouteId] = useState(null);

  const routeAnalytics = useMemo(() => {
    if (!vessels || vessels.length === 0) return [];

    const GWP_CH4 = 28;
    const GWP_N2O = 265;
    const routeMap = {};

    vessels.forEach((v) => {
      const from = v.LOCATION_FROM || 'Asal Tidak Diketahui';
      const to = v.LOCATION_TO || 'Terminal JICT';
      const rKey = `${from} → ${to}`;

      const currentCO2 = v.Total_CO2 || 0;
      const currentN2O = v.Total_N2O || 0;
      const currentCH4 = v.Total_CH4 || 0;
      const currentCO2e = currentCO2 + (currentCH4 * GWP_CH4) + (currentN2O * GWP_N2O);
      
      const vName = v.VESSEL_NAME || v.Vessel_Name || 'Kapal Tidak Diketahui';

      if (!routeMap[rKey]) {
        routeMap[rKey] = {
          id: rKey,
          origin: from,
          destination: to,
          co2_total: 0,
          n2o_total: 0,
          ch4_total: 0,
          calls: 0,
          topVessel: {
            name: vName,
            co2e: currentCO2e,
            co2: currentCO2,
            n2o: currentN2O,
            ch4: currentCH4
          }
        };
      }

      routeMap[rKey].co2_total += currentCO2;
      routeMap[rKey].n2o_total += currentN2O;
      routeMap[rKey].ch4_total += currentCH4;
      routeMap[rKey].calls += 1;

      if (currentCO2e > routeMap[rKey].topVessel.co2e) {
        routeMap[rKey].topVessel = {
          name: vName,
          co2e: currentCO2e,
          co2: currentCO2,
          n2o: currentN2O,
          ch4: currentCH4
        };
      }
    });

    return Object.values(routeMap).map((r) => {
      const totalCO2e = r.co2_total + (r.ch4_total * GWP_CH4) + (r.n2o_total * GWP_N2O);
      return { ...r, co2e: totalCO2e };
    }).sort((a, b) => b.calls - a.calls); 
  }, [vessels]);

  const grandTotalCO2e = useMemo(() => {
    return routeAnalytics.reduce((acc, curr) => acc + curr.co2e, 0) || 1;
  }, [routeAnalytics]);

  return (
    <div className="w-full flex flex-col h-full relative overflow-hidden font-['Poppins',sans-serif]">

      <div className="flex-1 overflow-y-auto pr-4 space-y-6 max-h-[550px] custom-scrollbar my-auto py-4 relative z-10">
        {routeAnalytics.map((route, index) => {
          const flowRatio = (route.co2e / grandTotalCO2e) * 100;
          const flowHeight = Math.min(Math.max(flowRatio * 1.5, 14), 40);

          const colors = [
            { text: 'text-[#00529B]', fill: 'bg-[#00529B]', gradient: 'from-[#00529B]/20' }, 
            { text: 'text-indigo-600', fill: 'bg-indigo-500', gradient: 'from-indigo-500/20' },  
            { text: 'text-cyan-600', fill: 'bg-cyan-500', gradient: 'from-cyan-500/20' },      
            { text: 'text-emerald-600', fill: 'bg-emerald-500', gradient: 'from-emerald-500/20' } 
          ];
          const color = colors[index % colors.length];
          const isBottomRoute = index >= routeAnalytics.length - 2 && routeAnalytics.length > 3;

          return (
            <div key={route.id} className="flex items-center w-full relative group">
        
              <div 
                className="w-48 shrink-0 p-3 rounded-2xl transition-all cursor-pointer hover:bg-slate-50 relative z-30"
                onMouseEnter={() => setHoveredRouteId(route.id)}
                onMouseLeave={() => setHoveredRouteId(null)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${color.fill}`} />
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Titik Asal</p>
                  </div>
                  <h4 className="text-[12px] font-bold text-slate-800 tracking-tight truncate" title={route.origin}>
                    {route.origin}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                    {route.calls} Kunjungan
                  </p>
                </div>

                {hoveredRouteId === route.id && (
                  <div 
                    className={`absolute bg-white/95 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] pointer-events-none z-[9999] min-w-[340px] max-w-[340px] animate-fadeIn ${
                      isBottomRoute ? 'bottom-0 mb-[-10px]' : 'top-1/2 -translate-y-1/2'
                    }`}
                    style={{ left: '110%' }}
                  >
                    <div className="border-b border-slate-100 pb-3 mb-4">
                      <p className="text-[10px] font-bold text-[#00529B] uppercase tracking-widest mb-1.5">
                        Rincian Emisi Rute
                      </p>
                      <p className="text-xs font-bold text-slate-800 leading-tight mb-1.5">
                        {route.origin} <span className="text-slate-300 font-normal mx-1">→</span> {route.destination}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500">
                        Total Frekuensi: <span className="font-semibold text-slate-700">{route.calls} Kapal Melintas</span>
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          A. Total Beban Emisi Rute
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-50/40 rounded-xl p-2.5 border border-blue-100/50 text-center">
                            <p className="text-[9px] font-bold text-blue-500 mb-1">CO₂ (Ton)</p>
                            <p className="text-xs font-bold text-slate-800">{route.co2_total.toFixed(4)}</p>
                          </div>
                          <div className="bg-amber-50/40 rounded-xl p-2.5 border border-amber-100/50 text-center">
                            <p className="text-[9px] font-bold text-amber-500 mb-1">N₂O (Ton)</p>
                            <p className="text-xs font-bold text-slate-800">{route.n2o_total.toFixed(4)}</p>
                          </div>
                          <div className="bg-emerald-50/40 rounded-xl p-2.5 border border-emerald-100/50 text-center">
                            <p className="text-[9px] font-bold text-emerald-500 mb-1">CH₄ (Ton)</p>
                            <p className="text-xs font-bold text-slate-800">{route.ch4_total.toFixed(4)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Kontributor kapal tertinggi */}
                      <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50">
                        <p className="text-[9px] font-semibold text-[#00529B] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                          <Ship size={12} /> B. Kapal Kontributor Terbesar
                        </p>
                        
                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm mb-3 truncate">
                          {route.topVessel.name}
                        </p>
                        
                        <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-slate-100/80">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-medium text-slate-500 flex items-center gap-1.5">
                              <Wind size={12} className="text-blue-400" /> Karbon Dioksida (CO₂):
                            </span>
                            <span className="font-bold text-slate-700">{route.topVessel.co2.toFixed(4)} Ton</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-medium text-slate-500 flex items-center gap-1.5">
                              <Zap size={12} className="text-amber-500" /> Dinitrogen Oksida (N₂O):
                            </span>
                            <span className="font-bold text-slate-700">{route.topVessel.n2o.toFixed(4)} Ton</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-medium text-slate-500 flex items-center gap-1.5">
                              <Activity size={12} className="text-emerald-500" /> Metana (CH₄):
                            </span>
                            <span className="font-bold text-slate-700">{route.topVessel.ch4.toFixed(4)} Ton</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 mx-3 relative flex items-center h-16 justify-center z-10">
                <div 
                  className={`absolute w-full bg-gradient-to-r ${color.gradient} to-transparent rounded-full transition-all duration-500 opacity-20 group-hover:opacity-70`}
                  style={{ height: `${flowHeight}px` }}
                />
                <div className="absolute w-full border-t-2 border-dashed border-slate-300 opacity-80 group-hover:opacity-100 group-hover:border-slate-400 transition-all duration-500" />
                <div 
                  className="absolute left-0 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100"
                  style={{
                    top: '50%',
                    animation: `shipVectorMove ${4 + (index % 3) * 1}s linear infinite`,
                  }}
                >
                  <div className="flex items-center justify-center bg-white p-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-slate-100">
                    <img 
                      src={PortIcon} 
                      alt="Vessel" 
                      className="w-7 h-7 object-contain opacity-80"
                    />
                  </div>
                </div>

              </div>
              <div className="w-52 shrink-0 text-right p-3 rounded-2xl relative z-10 flex flex-col justify-center bg-transparent group-hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Titik Tujuan</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
                <h4 className="text-[12px] font-bold text-slate-800 tracking-tight truncate" title={route.destination}>
                  {route.destination}
                </h4>
                <p className={`text-[13px] font-bold mt-0.5 tracking-tight ${color.text}`}>
                  {route.co2e.toFixed(2)} <span className="text-[10px] font-medium text-slate-500">Ton CO₂e</span>
                </p>
              </div>

            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center px-2">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
          <ArrowRight size={14} className="text-[#00529B]" /> Matriks Relokasi Emisi
        </div>
        <span className="text-[10px] font-medium text-slate-400">
          Analisis Jalur Berbasis Data Phinnisi Pelindo
        </span>
      </div>

      <style>{`
        @keyframes shipVectorMove {
          0% { left: -5%; opacity: 0; transform: translateY(-50%) scale(0.8); }
          15% { opacity: 1; transform: translateY(-50%) scale(1); }
          85% { opacity: 1; transform: translateY(-50%) scale(1); }
          100% { left: 100%; opacity: 0; transform: translateY(-50%) scale(0.8); }
        }
        @keyframes tooltipFadeInSide {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: tooltipFadeInSide 0.15s ease-out forwards;
        }
      `}</style>

    </div>
  );
};

export default MapView;