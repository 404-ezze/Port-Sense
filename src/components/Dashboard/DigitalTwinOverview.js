import React, { useMemo } from 'react';
import MapView from './MapView';
import ActivityBreakdown from './ActivityBreakdown';
import MonthlyEmissionTrend from './MonthlyEmissionTrend';

const DigitalTwinOverview = ({ vesselData }) => {
  const stats = useMemo(() => {
    if (!vesselData || vesselData.length === 0) return null;

    const GWP_CH4 = 28;
    const GWP_N2O = 265;
    const ESTIMASI_BERTHING_JAM = 1.5; 
    const totalCalls = vesselData.length;

    let mnv_total = 0;
    let brt_total = 0;
    let hot_total = 0;
    let grand_total_co2 = 0;
    let grand_total_n2o = 0;
    let grand_total_ch4 = 0;

    vesselData.forEach(v => {
      const rowCO2e = (v.Total_CO2 || 0) + (v.Total_CH4 * GWP_CH4) + (v.Total_N2O * GWP_N2O);
      const mnvEnergy = (v.ME_Energy_Mnv_kWh || 0) + (v.AE_Energy_Mnv_kWh || 0);
      const berthEnergy = (v.AE_Energy_Berth_kWh || 0);
      const totalEnergy = mnvEnergy + berthEnergy;
      const ratioMnv = totalEnergy > 0 ? mnvEnergy / totalEnergy : 0;
      const ratioSandar = totalEnergy > 0 ? berthEnergy / totalEnergy : 0;

      const mnvCO2Base = (v.ME_Emissions_Mnv_CO2 || 0) + (v.AE_Emissions_Mnv_CO2 || 0);
      const mnvCO2e = mnvCO2Base + (v.Total_CH4 * ratioMnv * GWP_CH4) + (v.Total_N2O * ratioMnv * GWP_N2O);
      
      const durationBerth = v.Duration_Berthing_Hr || 1;
      const ratioBerthingDuration = Math.min(ESTIMASI_BERTHING_JAM / durationBerth, 1);
      const berthCO2Base = (v.AE_Emissions_Berth_CO2 || 0) * ratioBerthingDuration;
      const berthingCO2e = berthCO2Base + (v.Total_CH4 * ratioSandar * ratioBerthingDuration * GWP_CH4) + (v.Total_N2O * ratioSandar * ratioBerthingDuration * GWP_N2O);

      const hotellingCO2e = rowCO2e - mnvCO2e - berthingCO2e;

      mnv_total += mnvCO2e;
      brt_total += berthingCO2e;
      hot_total += hotellingCO2e;
      grand_total_co2 += (v.Total_CO2 || 0);
      grand_total_n2o += (v.Total_N2O || 0);
      grand_total_ch4 += (v.Total_CH4 || 0);
    });

    const totalCO2e_Grand = mnv_total + brt_total + hot_total;

    return {
      co2e: totalCO2e_Grand.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      mnv: (mnv_total / totalCalls).toFixed(4),
      brt: (brt_total / totalCalls).toFixed(4),
      hot: (hot_total / totalCalls).toFixed(4),
      calls: totalCalls.toLocaleString(),
      co2: grand_total_co2.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      n2o: grand_total_n2o.toFixed(4),
      ch4: grand_total_ch4.toFixed(4),
      chartData: [
        { name: 'Manuver', value: mnv_total, color: '#6366F1' },
        { name: 'Sandar', value: brt_total, color: '#06B6D4' },
        { name: 'Dermaga', value: hot_total, color: '#10B981' }
      ]
    };
  }, [vesselData]);

  if (!stats) return null;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen space-y-8 animate-in fade-in duration-500 font-['Poppins',sans-serif] text-slate-800">

      {/* Header */}
      <div className="flex flex-col pb-5 border-b border-slate-200">
          <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">
          Dashboard
        </h2>
          
          {/* Subheadline */}
          <p className="text-[11px] md:text-xs text-slate-500 font-medium">
            Pemantauan Jejak Karbon & Emisi Kapal Peti Kemas Berbasis Aktivitas (Activity-Based) di Jakarta International Container Terminal (JICT) Tahun 2025
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-[#00529B] rounded-xl p-6 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-blue-100 mb-2">Total Emisi Tahunan</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold tracking-tight">{stats.co2e}</h3>
              <span className="text-sm font-medium text-blue-200">Ton CO2e</span>
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-6 relative z-10">Total akumulasi nilai GWP dari seluruh log aktivitas.</p>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center relative">
          <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6366F1] rounded-r-md"></div>
          <div className="pl-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fase Manuver</p>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.mnv}</h4>
              <span className="text-[10px] font-semibold text-slate-400">TON/CALL</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Estimasi emisi propulsi utama di kolam pelabuhan.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center relative">
          <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#06B6D4] rounded-r-md"></div>
          <div className="pl-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fase Sandar</p>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.brt}</h4>
              <span className="text-[10px] font-semibold text-slate-400">TON/CALL</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Kalkulasi jejak karbon selama manuver penambatan.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center relative">
          <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#10B981] rounded-r-md"></div>
          <div className="pl-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fase Dermaga</p>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.hot}</h4>
              <span className="text-[10px] font-semibold text-slate-400">TON/CALL</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Akumulasi gas buang saat idle (Hotelling).</p>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800">Parameter Emisi Gas Spesifik</h3>
          <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
            Total Data: {stats.calls} Riwayat
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00529B]"></div>
              <p className="text-xs font-medium text-slate-600">Karbon Dioksida (CO2)</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-2xl font-bold text-slate-900">{stats.co2}</h4>
              <span className="text-xs text-slate-500">Ton</span>
            </div>
          </div>

          <div className="p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#D97706]"></div>
              <p className="text-xs font-medium text-slate-600">Dinitrogen Oksida (N2O)</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-2xl font-bold text-slate-900">{stats.n2o}</h4>
              <span className="text-xs text-slate-500">Ton</span>
            </div>
          </div>

          <div className="p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#059669]"></div>
              <p className="text-xs font-medium text-slate-600">Metana (CH4)</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-2xl font-bold text-slate-900">{stats.ch4}</h4>
              <span className="text-xs text-slate-500">Ton</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Distribusi Emisi Kapal Peti Kemas Per Rute Pelayaran Tahun 2025</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Analisis temporal parameter emisi berdasarkan log aktivitas bulanan.</p>
            </div>
          </div>
          <div className="flex-1 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            <MapView vessels={vesselData} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <ActivityBreakdown chartData={stats.chartData} totalCO2e={stats.co2e} />
        </div>
      </div>

      <div className="pb-4">
        <MonthlyEmissionTrend vesselData={vesselData} />
      </div>
      
    </div>
  );
};

export default DigitalTwinOverview;