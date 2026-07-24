import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sub-komponen visualisasi ekstremum.
const IntegratedChartColumn = ({ title, data, barDataKey, statDataKey, color, extremes }) => {
  return (
    <div className="flex flex-col h-full font-['Poppins',sans-serif] w-full">
      {/* Header grafik. */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h4>
      </div>
      
      {/* Area visualisasi. */}
      <div className="h-[200px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="range" 
              fontSize={9} 
              fontWeight={500} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8'}} 
              dy={10} 
            />
            <YAxis 
              fontSize={9} 
              fontWeight={500} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8'}} 
              width={40} 
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                fontSize: '11px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                padding: '10px 14px'
              }}
              formatter={(value) => [`${value.toFixed(2)} Ton`, 'Total']}
            />
            <Bar dataKey={barDataKey} fill={color} radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area ekstremum. */}
      <div className="mt-auto pt-5 border-t border-slate-100 flex flex-col gap-4">
        {/* Nilai maksimum. */}
        <div className="flex justify-between items-center group">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 mb-0.5">Kunjungan Tunggal Tertinggi</span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]" title={extremes?.max?.VESSEL_NAME}>
              {extremes?.max?.VESSEL_NAME || 'N/A'}
            </span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-sm font-bold leading-none mb-1" style={{ color: color }}>
              {Number(extremes?.max?.[statDataKey] || 0).toFixed(4)}
            </span>
            <span className="text-[9px] font-medium text-slate-400">Ton/Call</span>
          </div>
        </div>

        {/* Nilai minimum. */}
        <div className="flex justify-between items-center group">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 mb-0.5">Kunjungan Tunggal Terendah</span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]" title={extremes?.min?.VESSEL_NAME}>
              {extremes?.min?.VESSEL_NAME || 'N/A'}
            </span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-sm font-bold leading-none mb-1 text-slate-500">
              {Number(extremes?.min?.[statDataKey] || 0).toFixed(4)}
            </span>
            <span className="text-[9px] font-medium text-slate-400">Ton/Call</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen distribusi utama.
const SizeDistribution = ({ vesselData }) => {
  const globalStats = useMemo(() => {
    if (!vesselData || vesselData.length === 0) return null;

    const getExtremes = (key) => {
      // Pemfilteran nilai nol.
      const validData = vesselData.filter(v => Number(v[key]) > 0);
      
      if (validData.length === 0) {
        return { max: null, min: null };
      }

      // Pengurutan nilai emisi.
      const sorted = [...validData].sort((a, b) => Number(b[key]) - Number(a[key]));
      
      return {
        max: sorted[0],
        min: sorted[sorted.length - 1]
      };
    };

    return {
      CO2: getExtremes('Total_CO2'),
      N2O: getExtremes('Total_N2O'),
      CH4: getExtremes('Total_CH4')
    };
  }, [vesselData]);

  const chartData = useMemo(() => {
    if (!vesselData) return [];
    const groups = {};
    
    vesselData.forEach(v => {
      const range = v["Size Range"] || v.Size_Range || "Lainnya";
      if (!groups[range]) {
        groups[range] = { range, CO2: 0, N2O: 0, CH4: 0 };
      }
      groups[range].CO2 += (Number(v.Total_CO2) || 0);
      groups[range].N2O += (Number(v.Total_N2O) || 0);
      groups[range].CH4 += (Number(v.Total_CH4) || 0);
    });

    const getSortWeight = (label) => {
      const str = label.toLowerCase();
      if (str.includes('ultra')) return 12000;
      if (str.includes('new panamax')) return 8000;
      if (str.includes('post-panamax') || str.includes('post panamax')) return 5000;
      if (str.includes('panamax') && !str.includes('new') && !str.includes('post')) return 3000;
      if (str.includes('regional')) return 2000;
      if (str.includes('feeder')) return 1000;
      if (str.includes('small')) return 100;
      const match = label.match(/\d+/);
      if (match) return parseInt(match[0], 10);
      return 0; 
    };

    return Object.values(groups).sort((a, b) => getSortWeight(b.range) - getSortWeight(a.range));
  }, [vesselData]);

  return (
    <div className="w-full bg-white rounded-xl p-8 md:p-10 shadow-sm border border-slate-200 flex flex-col font-['Poppins',sans-serif]">
      
      {/* Header antarmuka. */}
      <div className="mb-8 pb-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Distribusi Emisi Kapal Berdasarkan Parameter Global Warming Potential (GWP)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Klasifikasi analitik berdasarkan kapasitas armada.</p>
        </div>
      </div>

      {/* Grid matriks utama. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 w-full">
        
        {/* Kolom metrik CO2. */}
        <div className="pb-8 lg:pb-0 lg:pr-8 flex">
          <IntegratedChartColumn 
            title="Karbondioksida (CO₂)" 
            data={chartData} 
            barDataKey="CO2" 
            statDataKey="Total_CO2"
            color="#00529B" 
            extremes={globalStats?.CO2}
          />
        </div>

        {/* Kolom metrik N2O. */}
        <div className="py-8 lg:py-0 lg:px-8 flex">
          <IntegratedChartColumn 
            title="Dinitrogen Oksida (N₂O)" 
            data={chartData} 
            barDataKey="N2O" 
            statDataKey="Total_N2O"
            color="#D97706" 
            extremes={globalStats?.N2O}
          />
        </div>

        {/* Kolom metrik CH4. */}
        <div className="pt-8 lg:pt-0 lg:pl-8 flex">
          <IntegratedChartColumn 
            title="Metana (CH₄)" 
            data={chartData} 
            barDataKey="CH4" 
            statDataKey="Total_CH4"
            color="#059669" 
            extremes={globalStats?.CH4}
          />
        </div>

      </div>
    </div>
  );
};

export default SizeDistribution;