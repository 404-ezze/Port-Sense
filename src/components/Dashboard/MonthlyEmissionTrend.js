import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Komponen tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3.5 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 min-w-[200px] font-['Poppins',sans-serif]">
        <p className="text-xs font-bold text-slate-700 mb-2.5 border-b border-slate-100 pb-2">
          {label} 2025
        </p>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00529B]"></div>
              <span className="text-[10px] font-medium text-slate-500">CO2</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800">
              {payload[0].value.toFixed(2)} <span className="text-[9px] font-medium text-slate-400">Ton</span>
            </span>
          </div>

          <div className="flex justify-between items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></div>
              <span className="text-[10px] font-medium text-slate-500">N2O</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800">
              {payload[0].payload.N2O.toFixed(4)} <span className="text-[9px] font-medium text-slate-400">Ton</span>
            </span>
          </div>
          
          <div className="flex justify-between items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#059669]"></div>
              <span className="text-[10px] font-medium text-slate-500">CH4</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800">
              {payload[0].payload.CH4.toFixed(4)} <span className="text-[9px] font-medium text-slate-400">Ton</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MonthlyEmissionTrend = ({ vesselData }) => {
  // Agregasi data temporal
  const chartData = useMemo(() => {
    if (!vesselData) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const grouped = months.map(m => ({ month: m, CO2: 0, N2O: 0, CH4: 0 }));

    vesselData.forEach(v => {
      // Ekstraksi entitas waktu
      const dateString = v.BKTMOD_DATE_START ? v.BKTMOD_DATE_START.replace(/\//g, '-') : null;
      const date = new Date(dateString);
      if (!isNaN(date.getTime()) && date.getFullYear() === 2025) {
        const monthIndex = date.getMonth();
        // Akumulasi emisi bulanan
        grouped[monthIndex].CO2 += (Number(v.Total_CO2) || 0);
        grouped[monthIndex].N2O += (Number(v.Total_N2O) || 0);
        grouped[monthIndex].CH4 += (Number(v.Total_CH4) || 0);
      }
    });
    return grouped;
  }, [vesselData]);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm transition-all hover:border-slate-300 flex flex-col min-h-[420px] font-['Poppins',sans-serif]">

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-800">Tren Emisi Kapal Peti Kemas Tahun 2025</h3>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Analisis temporal parameter emisi berdasarkan log aktivitas bulanan.</p>
      </div>

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00529B" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00529B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              fontSize={10} 
              fontWeight={500} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b'}}
              dy={10} 
            />
            <YAxis 
              fontSize={10} 
              fontWeight={500}
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b'}} 
              tickFormatter={(value) => `${value.toLocaleString()}`}
              dx={-10}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area 
              type="monotone" 
              dataKey="CO2" 
              stroke="#00529B" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorEmission)"
              dot={{ r: 3, fill: '#ffffff', strokeWidth: 2, stroke: '#00529B' }}
              activeDot={{ r: 5, fill: '#00529B', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-6 flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00529B]" />
          <span className="text-[10px] font-medium text-slate-500">Alur Utama (CO2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="text-[10px] font-medium text-slate-400 italic">Hover grafik untuk melihat N2O & CH4</span>
        </div>
      </div>

    </div>
  );
};

export default MonthlyEmissionTrend;