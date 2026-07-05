import React, { useMemo } from 'react';

const VesselSizeAnalysis = ({ vesselData }) => {
  const sizeStats = useMemo(() => {
    const stats = {};
    
    vesselData.forEach(v => {
      const size = v["Size Range"] || "Lainnya"; 
      if (!stats[size]) {
        stats[size] = {
          label: size,
          totalCO2: 0, totalN2O: 0, totalCH4: 0, count: 0,
          avgMCR: 0, mcrSum: 0
        };
      }
      
      // PERBAIKAN LOGIKA: Penambahan Number() agar tipe data String dari database bisa dijumlahkan matematis
      stats[size].totalCO2 += (Number(v.Total_CO2) || 0);
      stats[size].totalN2O += (Number(v.Total_N2O) || 0);
      stats[size].totalCH4 += (Number(v.Total_CH4) || 0);
      stats[size].mcrSum += (Number(v["Propulsion MCR (kW)"]) || 0);
      stats[size].count += 1;
    });

    const getSortWeight = (label) => {
      const str = label.toLowerCase();
      
      // Jika kategori adalah "lainnya" atau kosong, lempar ke paling bawah
      if (str === "lainnya" || str === "") return -1;

      // Pengecekan berbasis teks (opsional jika label menggunakan nama kelas)
      if (str.includes('ultra')) return 12000;
      if (str.includes('new panamax')) return 8000;
      if (str.includes('post-panamax') || str.includes('post panamax')) return 5000;
      if (str.includes('panamax') && !str.includes('new') && !str.includes('post')) return 3000;
      if (str.includes('regional')) return 2000;
      if (str.includes('feeder')) return 1000;
      if (str.includes('small')) return 100;
      
      // PERBAIKAN SORTING: Hapus tanda titik pada format ribuan ("1.000" menjadi "1000") sebelum diekstrak angkanya
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
      
      {/* HEADER SECTION */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Klasifikasi Emisi Berdasarkan Ukuran Kapal (TEUs)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Inventarisasi emisi GRK berdasarkan kapasitas TEUs.</p>
        </div>
        {/* UI PERBAIKAN: Icon dihapus, hanya menyisakan badge kategori */}
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-500">
          {sizeStats.length} Kategori
        </div>
      </div>

      {/* HEADER TABEL */}
      <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">
        <div className="col-span-5">Kapasitas (TEUs)</div>
        <div className="col-span-7 grid grid-cols-3 text-right">
          <div>Total CO₂</div>
          <div>Total N₂O</div>
          <div>Total CH₄</div>
        </div>
      </div>

      {/* LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {sizeStats.map((item, idx) => (
          <div 
            key={idx} 
            className="grid grid-cols-12 gap-4 py-4 px-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors items-center group rounded-lg"
          >
            
            {/* KIRI: Informasi Utama Kapal */}
            <div className="col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00529B]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate pr-2" title={item.label}>
                  {item.label}
                </h4>
              </div>
              <div className="flex items-center gap-2 ml-3.5">
                {/* UI PERBAIKAN: Log diganti Calls */}
                <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {item.count} Calls
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  MCR: <span className="font-semibold text-slate-600">{item.avgMCR.toFixed(0)} kW</span>
                </span>
              </div>
            </div>

            {/* KANAN: Grid Metrik 3 Gas */}
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