import React, { useState } from 'react';
import { Search, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';

const VesselDatabase = ({ vesselData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  // Algoritma filtrasi dan pengurutan data.
  const processedData = vesselData
    .filter(v => {
      // Pencarian entitas string.
      const matchSearch = v.VESSEL_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.NO_PKK?.includes(searchTerm);
      return matchSearch;
    })
    .sort((a, b) => {
      // Deteksi anomali (Lainnya/Null).
      const aRange = a["Size Range"];
      const bRange = b["Size Range"];
      
      const isABad = !aRange || aRange.toString().trim().toLowerCase() === "lainnya";
      const isBBad = !bRange || bRange.toString().trim().toLowerCase() === "lainnya";

      // Penyesuaian prioritas urutan bawah.
      if (isABad && !isBBad) return 1;
      if (!isABad && isBBad) return -1;
      
      // Pertahankan urutan awal.
      return 0; 
    });

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = processedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full h-full flex flex-col space-y-6 font-['Poppins',sans-serif]">
      
      {/* Modul pencarian dan antarmuka. */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-m font-semibold text-slate-800 tracking-tight leading-none mb-1.5">
            Master Data Aktivitas Kapal Peti Kemas Jakarta International Container Terminal Tahun 2025
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Dataset operasional berbasis aktivitas untuk estimasi emisi dan jejak karbon.
          </p>
        </div>
        
        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Vessel Name or PKK..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00529B] focus:ring-1 focus:ring-[#00529B] transition-all placeholder:text-slate-400" 
            value={searchTerm}
            onChange={handleSearch} 
          />
        </div>
      </div>

      {/* Kontainer tabel data. */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Area tabel responsif. */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4 font-semibold">Identitas Kapal</th>
                <th className="px-6 py-4 font-semibold">Ukuran Kapal (TEUs)</th>
                <th className="px-6 py-4 font-semibold">DWT / GRT</th>
                <th className="px-6 py-4 font-semibold">MCR (kW)</th>
                <th className="px-6 py-4 font-semibold text-[#00529B]">CO₂ (Ton)</th>
                <th className="px-6 py-4 font-semibold text-amber-600">N₂O (Ton)</th>
                <th className="px-6 py-4 font-semibold text-emerald-600">CH₄ (Ton)</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {currentTableData.length > 0 ? (
                currentTableData.map((v, i) => {
                  // Indikator visual data anomali.
                  const isBadData = !v["Size Range"] || v["Size Range"].toString().trim().toLowerCase() === "lainnya";
                  
                  return (
                    <tr key={i} className={`transition-colors group ${isBadData ? 'bg-slate-50/50 opacity-75' : 'hover:bg-slate-50/70'}`}>
                      
                      {/* Entitas identitas kapal. */}
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 uppercase group-hover:text-[#00529B] transition-colors">{v.VESSEL_NAME || 'N/A'}</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5">{v.NO_PKK || '-'}</span>
                        </div>
                      </td>
                      
                      {/* Kapasitas ukuran kapal. */}
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${isBadData ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {v["Size Range"] || 'UNKNOWN'}
                        </span>
                      </td>
                      
                      {/* Parameter DWT/GRT. */}
                      <td className="px-6 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        {v.DWT || 0} <span className="text-slate-300 mx-1 font-medium">/</span> {v.GRT || 0}
                      </td>
                      
                      {/* Metrik MCR propulsi. */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                          <Gauge size={12} className="text-slate-400" />
                          {v["Propulsion MCR (kW)"] || 0}
                        </div>
                      </td>
                      
                      {/* Kuantifikasi emisi spesifik. */}
                      <td className="px-6 py-3.5 text-[11px] font-bold text-slate-800">
                        {v.Total_CO2 || 0}
                      </td>
                      <td className="px-6 py-3.5 text-[11px] font-bold text-slate-800">
                        {v.Total_N2O || 0}
                      </td>
                      <td className="px-6 py-3.5 text-[11px] font-bold text-slate-800">
                        {v.Total_CH4 || 0}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                    Tidak ada kapal yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol navigasi paginasi. */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="text-[11px] font-medium text-slate-500">
            Menampilkan <span className="font-bold text-slate-800">{processedData.length === 0 ? 0 : startIndex + 1}</span> hingga <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, processedData.length)}</span> dari <span className="font-bold text-slate-800">{processedData.length}</span> entri
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1 || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            
            <div className="flex items-center justify-center px-3 py-1.5 text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg min-w-[32px]">
              {totalPages === 0 ? 0 : currentPage}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VesselDatabase;