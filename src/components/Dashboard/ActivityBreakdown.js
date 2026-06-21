import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ActivityBreakdown = ({ chartData, totalCO2e }) => {
  // PERBAIKAN 1: Definisi warna dinamis untuk menghindari hardcode index data
  const COLORS = ['#6366F1', '#06B6D4', '#10B981'];

  // PERBAIKAN 2: Mapping data secara aman. 
  // Mencegah error 'undefined' jika chartData kosong saat menarik data dari database
  const displayData = chartData && chartData.length > 0 
    ? chartData.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
      }))
    : [];

  // PERBAIKAN 3: Fallback value ke 0 jika value undefined agar kalkulasi total tidak menghasilkan NaN
  const totalValue = displayData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    // Container disesuaikan dengan map (rounded-xl, border-slate-200, shadow-sm, min-h-[500px])
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-full flex flex-col min-h-[500px]">
      
      {/* HEADER SECTION - Diselaraskan dengan gaya header map */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-800">Distribusi Emisi Berdasarkan Aktivitas Kapal</h3>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Komposisi gas rumah kaca (CO2e) per fase operasional.</p>
      </div>

      {/* CHART SECTION */}
      <div className="h-[240px] w-full relative mb-4">
        {/* Angka di tengah donat dirapikan tipografinya */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {totalCO2e}
          </p>
          <p className="text-[9px] font-medium text-slate-500 mt-0.5">TON CO2e</p>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              innerRadius={75}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
              animationBegin={200}
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                fontSize: '11px',
                fontWeight: '600',
                padding: '12px',
                fontFamily: 'Poppins'
              }} 
              itemStyle={{ textTransform: 'capitalize', color: '#1e293b' }}
              formatter={(value) => [`${value.toLocaleString(undefined, {maximumFractionDigits: 2})} Ton`, 'Total Emisi']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND & PERCENTAGE SECTION - Dibuat clean list tanpa bulatan berbayang */}
      <div className="space-y-2 mt-2">
        {displayData.map((item) => (
          <div key={item.name} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-semibold text-slate-700">
                Fase {item.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">
                {totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* STRATEGIC CONCLUSION ALERT - Diubah jadi banner enterprise */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-[10px] text-[#00529B] leading-relaxed">
            <span className="font-bold">Insight Sistem:</span> Fase Hotelling terdeteksi sebagai penyumbang emisi terbesar, menjadikannya prioritas utama untuk simulasi mitigasi <i>Shore Power</i>.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ActivityBreakdown;