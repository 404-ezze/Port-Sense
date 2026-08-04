import React, { useMemo } from 'react';

const VesselSizeAnalysis = ({ vesselData }) => {
  const sizeStats = useMemo(() => {
    if (!vesselData || vesselData.length === 0) return [];
    
    const stats = {};
    
    // Pemrosesan nilai numerik
    const parseNum = (val) => {
      if (val === undefined || val === null) return 0;
      if (typeof val === 'number') return val;
      const cleanVal = val.toString().replace(/,/g, '').trim();
      const num = Number(cleanVal);
      return isNaN(num) ? 0 : num;
    };

    vesselData.forEach((v, index) => {
      const size = v["Size Range"] || v.Size_Range || "Lainnya"; 
      
      if (!stats[size]) {
        stats[size] = {
          label: size,
          totalCO2: 0, totalN2O: 0, totalCH4: 0, count: 0,
          avgMCR: 0, mcrSum: 0
        };
      }

      if (size === "Lainnya" && stats[size].count < 3) {
        console.log(`[DATA DIAGNOSTIK LAINNYA - SAMPEL KE-${stats[size].count + 1}]:`, v);
      }
      const co2Val = v.Total_CO2 || v.total_co2 || v.CO2 || v.co2 || 0;
      const n2oVal = v.Total_N2O || v.total_n2o || v.N2O || v.n2o || 0;
      const ch4Val = v.Total_CH4 || v.total_ch4 || v.CH4 || v.ch4 || 0;
      const mcrVal = v["Propulsion MCR (kW)"] || v.Propulsion_MCR_kW || v.MCR || v.mcr || v.PROPULSION_MCR || 0;

      stats[size].totalCO2 += parseNum(co2Val);
      stats[size].totalN2O += parseNum(n2oVal);
      stats[size].totalCH4 += parseNum(ch4Val);
      stats[size].mcrSum += parseNum(mcrVal);
      stats[size].count += 1;
    });

    // Algoritma pembobotan urutan.
    const getSortWeight = (label) => {
      const str = label.toLowerCase();
      if (str === "lainnya" || str === "") return -1;

      if (str.includes('ultra')) return 12000;
      if (str.includes('new panamax')) return 8000;
      if (str.includes('post-panamax') || str.includes('post panamax')) return 5000;
      if (str.includes('panamax') && !str.includes('new') && !str.includes('post')) return 3000;
      if (str.includes('regional')) return 2000;
      if (str.includes('feeder')) return 1000;
      if (str.includes('small')) return 100;
      
      const cleanStr = str.replace(/\./g, '');
      const match = cleanStr.match(/\d+/);
      if (match) return parseInt(match[0], 10);
      
      return 0; 
    };

    return Object.values(stats)
      .map(s => ({
        ...s,
        avgMCR: s.count > 0 ? s.mcrSum / s.count : 0,
        sortWeight: getSortWeight(s.label)
      }))
      .sort((a, b) => b.sortWeight - a.sortWeight);
  }, [vesselData]);

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm max-h-[600px] flex flex-col overflow-hidden font-['Poppins',sans-serif]">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Klasifikasi Emisi Berdasarkan Ukuran Kapal (TEUs)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Inventarisasi emisi GRK berdasarkan kapasitas TEUs.</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-500">
          {sizeStats.length} Kategori
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">
        <div className="col-span-5">Kapasitas (TEUs)</div>
        <div className="col-span-7 grid grid-cols-3 text-right">
          <div>Total CO₂</div>
          <div>Total N₂O</div>
          <div>Total CH₄</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {sizeStats.map((item, idx) => (
          <div 
            key={idx} 
            className="grid grid-cols-12 gap-4 py-4 px-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors items-center group rounded-lg"
          >
            <div className="col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00529B]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate pr-2" title={item.label}>
                  {item.label}
                </h4>
              </div>
              <div className="flex items-center gap-2 ml-3.5">
                <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {item.count} Calls
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  MCR: <span className="font-semibold text-slate-600">{item.avgMCR.toFixed(0)} kW</span>
                </span>
              </div>
            </div>
            
            <div className="col-span-7 grid grid-cols-3 text-right">
              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold text-slate-800 group-hover:text-[#00529B] transition-colors">
                  {item.totalCO2.toFixed(2)}
                </p>
                <p className="text-[8px] font-medium text-slate-400">Ton</p>
              </div>

              <div className="flex flex-col justify-center border-l border-slate-100 pl-2">
                <p className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                  {item.totalN2O.toFixed(3)}
                </p>
                <p className="text-[8px] font-medium text-slate-400">Ton</p>
              </div>

              <div className="flex flex-col justify-center border-l border-slate-100 pl-2">
                <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  {item.totalCH4.toFixed(3)}
                </p>
                <p className="text-[8px] font-medium text-slate-400">Ton</p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default VesselSizeAnalysis;