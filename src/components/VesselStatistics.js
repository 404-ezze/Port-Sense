import React, { useMemo, useState } from 'react';
import { 
  Ship, Zap, Anchor, Gauge, Ruler, Weight, 
  Activity, Compass, Wind, Clock, Battery 
} from 'lucide-react';
import { motion } from 'framer-motion';

const VesselStatistics = ({ vesselData, mode }) => {
  const [showAllFactors, setShowAllFactors] = useState(false);

  // LOGIKA DATA: TIDAK DIUBAH
  const podiumVessels = useMemo(() => {
    const sorted = [...vesselData].sort((a, b) => b.Total_CO2 - a.Total_CO2).slice(0, 5);
    return [
      { data: sorted[3], rank: 4 },
      { data: sorted[1], rank: 2 },
      { data: sorted[0], rank: 1 },
      { data: sorted[2], rank: 3 },
      { data: sorted[4], rank: 5 }
    ];
  }, [vesselData]);

  // LOGIKA DATA: TIDAK DIUBAH
  const processedFactors = useMemo(() => {
    const rawFactors = [
      { name: "Emisi AE (Sandar)", r: 0.99, icon: <Wind size={14}/>, note: "Pelepasan emisi Auxiliary Engine saat kapal diam di dermaga." },
      { name: "Energi AE (Sandar)", r: 0.99, icon: <Battery size={14}/>, note: "Beban konsumsi daya listrik kapal selama fase hotelling." },
      { name: "Durasi Sandar", r: 0.83, icon: <Clock size={14}/>, note: "Total waktu pelayanan kapal bersandar di JICT." },
      { name: "Tonase Kotor (GRT)", r: 0.69, icon: <Ruler size={14}/>, note: "Volume kapasitas internal kapal penentu skala mesin." },
      { name: "Bobot Mati (DWT)", r: 0.68, icon: <Weight size={14}/>, note: "Kapasitas tonase muatan maksimal kapal." },
      { name: "Daya Propulsi (MCR)", r: 0.66, icon: <Zap size={14}/>, note: "Keluaran daya maksimal dari mesin utama kapal." },
      { name: "Kecepatan Desain", r: 0.61, icon: <Activity size={14}/>, note: "Kecepatan standar operasional kapal (dalam knots)." },
      { name: "Emisi AE (Manuver)", r: 0.48, icon: <Compass size={14}/>, note: "Emisi mesin bantu saat navigasi masuk/keluar kolam pelabuhan." },
      { name: "Energi ME (Manuver)", r: 0.42, icon: <Ship size={14}/>, note: "Konsumsi energi mesin utama saat bermanuver." },
      { name: "Durasi Labuh", r: 0.04, icon: <Anchor size={14}/>, note: "Waktu tunggu kapal di area berlabuh sebelum sandar." },
      { name: "Faktor Beban ME", r: -0.55, icon: <Gauge size={14}/>, note: "Korelasi negatif: Penurunan drastis beban mesin utama saat sandar." },
    ];

    const totalR = rawFactors.reduce((acc, curr) => acc + Math.abs(curr.r), 0);

    return rawFactors.map(f => ({
      ...f,
      contribution: (Math.abs(f.r) / totalR) * 100
    })).sort((a, b) => b.contribution - a.contribution); 
  }, []);

  // UI MODE: TOP 5 KAPAL (PODIUM ENTERPRISE)
  if (mode === "top5") {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm w-full h-full font-['Poppins',sans-serif] flex flex-col">
        {/* Header Bersih */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Top 5 Kapal Kontributor Emisi</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Identifikasi penyumbang jejak karbon tertinggi berdasarkan per kunjungan operasional.</p>
          </div>
        </div>

        {/* Podium Layout - Dibuat lebih struktural dan rapi */}
        <div className="flex flex-col md:flex-row justify-center items-end gap-4 min-h-[350px] mt-auto">
          {podiumVessels.map((item, i) => {
            const isRank1 = item.rank === 1;
            const v = item.data;
            const heightClass = isRank1 ? "h-32" : item.rank === 2 ? "h-28" : item.rank === 3 ? "h-24" : item.rank === 4 ? "h-20" : "h-16";
            
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`flex flex-col items-center w-full md:w-1/5 relative ${isRank1 ? 'z-20 -mt-8' : 'z-10'}`}
              >
                
                {/* Kartu Data Kapal */}
                <div className={`w-full p-4 mb-3 rounded-xl border flex flex-col items-center transition-all hover:shadow-md
                  ${isRank1 ? 'bg-white border-blue-200 shadow-[0_10px_30px_rgba(0,82,155,0.12)]' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                    ${isRank1 ? 'bg-blue-50 text-[#00529B]' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    <Ship size={18} strokeWidth={isRank1 ? 2.5 : 2} />
                  </div>
                  
                  <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-tight text-center w-full truncate mb-3" title={v?.VESSEL_NAME}>
                    {v?.VESSEL_NAME || "UNKNOWN VESSEL"}
                  </h4>
                  
                  <div className="w-full space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-semibold text-slate-500">CO₂</span>
                      <span className={`font-bold ${isRank1 ? 'text-[#00529B]' : 'text-slate-800'}`}>{v?.Total_CO2?.toFixed(1) || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-medium text-slate-400">N₂O</span>
                      <span className="font-semibold text-amber-600">{v?.Total_N2O?.toFixed(4) || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-medium text-slate-400">CH₄</span>
                      <span className="font-semibold text-emerald-600">{v?.Total_CH4?.toFixed(4) || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Balok Podium Bawah */}
                <div className={`w-[85%] rounded-t-lg flex flex-col items-center justify-start pt-3 border-x border-t ${heightClass}
                  ${isRank1 ? 'bg-[#00529B] border-[#00529B]' : 'bg-slate-100 border-slate-200'}`}
                >
                  <span className={`text-xl font-black ${isRank1 ? 'text-white' : 'text-slate-400'}`}>
                    #{item.rank}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // UI MODE: MATRIKS KORELASI (List Profesional)
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden font-['Poppins',sans-serif]">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Faktor Penyumbang Emisi Kapal Peti Kemas</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Analisis bobot kontribusi relatif (Normalisasi 100%) terhadap total emisi.</p>
        </div>
      </div>

      {/* List Parameter */}
      <div className="flex-1 overflow-y-auto pr-3 space-y-1 custom-scrollbar">
        {processedFactors.slice(0, showAllFactors ? processedFactors.length : 5).map((f, i) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className="flex flex-col py-3.5 border-b border-slate-100 last:border-0 group hover:bg-slate-50 rounded-lg px-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00529B] flex items-center justify-center border border-blue-100 shrink-0">
                  {f.icon}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{f.name}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${f.r < 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      r = {f.r}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5 max-w-sm truncate" title={f.note}>
                    {f.note}
                  </p>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <span className={`text-lg font-bold tracking-tight ${f.r < 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {f.contribution.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar Kontribusi Relatif */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${f.contribution}%` }} 
                transition={{ duration: 1, ease: "easeOut" }} 
                className={`h-full rounded-full ${f.r < 0 ? 'bg-amber-400' : 'bg-[#00529B]'}`} 
              />
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => setShowAllFactors(!showAllFactors)}
        className="mt-4 w-full py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        {showAllFactors ? "Tampilkan Lebih Sedikit" : `Lihat Semua Parameter (${processedFactors.length})`}
      </button>
    </div>
  );  
};

export default VesselStatistics;