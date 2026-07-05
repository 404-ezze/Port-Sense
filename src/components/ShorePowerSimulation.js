import React, { useState, useMemo } from 'react';
import {
  Zap, ShieldCheck, TrendingDown, Wind, Droplets, Info, AlertTriangle,
} from 'lucide-react';


const GWP = { CO2: 1, CH4: 27.2, N2O: 273 };
const NET_OPS_REDUCTION = { CO2: 0.85, CH4: 0.90, N2O: 0.88 };
const MAX_FUEL_REDUCTION = { CO2: 0.25, CH4: 0.05, N2O: 0.10 };
const MAX_AE_EFFICIENCY = 0.15;

const REALISTIC_BOUNDS = {
  aeEmissions: { min: 20, max: 50, label: 'IMO MARPOL Annex VI' },
  aeEnergy: { min: 5, max: 15, label: 'ISO 50001 Reefers Limit' },
  durasiSandar: { min: 0, max: 30, label: 'TRT/BCH Congestion Limit' },
  opsDaya: { min: 20, max: 80, label: 'IEC/ISO/IEEE 80005-1' },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const ShorePowerSimulation = ({ vesselData }) => {
  const [scenarios, setScenarios] = useState({
    aeEmissions: 0,
    aeEnergy: 0,
    durasiSandar: 0,
    opsDaya: 0,
  });

  const baselinePerKapal = useMemo(() => {
    if (!vesselData) return [];

    return vesselData.map((v) => {
      const meEnergyMnv = v.ME_Energy_Mnv_kWh || 0;
      const aeEnergyMnv = v.AE_Energy_Mnv_kWh || 0;
      const aeEnergyBerth = v.AE_Energy_Berth_kWh || 0;
      const totalEnergy = meEnergyMnv + aeEnergyMnv + aeEnergyBerth;

      const shareBerth = totalEnergy > 0 ? aeEnergyBerth / totalEnergy : 0;

      const co2Mnv = (v.ME_Emissions_Mnv_CO2 || 0) + (v.AE_Emissions_Mnv_CO2 || 0);
      const co2Berth = v.AE_Emissions_Berth_CO2 || 0;
      const totalCH4 = v.Total_CH4 || 0;
      const totalN2O = v.Total_N2O || 0;

      return {
        co2Mnv,
        co2Berth,
        ch4Berth: totalCH4 * shareBerth,
        ch4Mnv: totalCH4 * (1 - shareBerth),
        n2oBerth: totalN2O * shareBerth,
        n2oMnv: totalN2O * (1 - shareBerth),
      };
    });
  }, [vesselData]);

  const hasilSimulasi = useMemo(() => {
    if (baselinePerKapal.length === 0) return null;

    const baseline = baselinePerKapal.reduce(
      (acc, k) => {
        acc.CO2 += k.co2Mnv + k.co2Berth;
        acc.CH4 += k.ch4Mnv + k.ch4Berth;
        acc.N2O += k.n2oMnv + k.n2oBerth;
        return acc;
      },
      { CO2: 0, CH4: 0, N2O: 0 }
    );

    const pDurasi = scenarios.durasiSandar / 100;
    const pOps = scenarios.opsDaya / 100;
    const pFuel = scenarios.aeEmissions / 100;
    const pEff = scenarios.aeEnergy / 100;

    const efisiensiWaktu = 1 - pDurasi;
    const porsiOps = pOps;
    const porsiNonOps = 1 - pOps;

    const sisaSetelah = {};
    for (const gas of ['CO2', 'CH4', 'N2O']) {
      const sisaOps = porsiOps * (1 - NET_OPS_REDUCTION[gas]);
      const faktorFuel = 1 - pFuel * MAX_FUEL_REDUCTION[gas];
      const faktorEff = 1 - pEff * MAX_AE_EFFICIENCY;
      const sisaNonOps = porsiNonOps * faktorFuel * faktorEff;

      sisaSetelah[gas] = efisiensiWaktu * (sisaOps + sisaNonOps);
    }

    const berthingBaseline = baselinePerKapal.reduce(
      (acc, k) => {
        acc.CO2 += k.co2Berth;
        acc.CH4 += k.ch4Berth;
        acc.N2O += k.n2oBerth;
        return acc;
      },
      { CO2: 0, CH4: 0, N2O: 0 }
    );

    const mnvBaseline = {
      CO2: baseline.CO2 - berthingBaseline.CO2,
      CH4: baseline.CH4 - berthingBaseline.CH4,
      N2O: baseline.N2O - berthingBaseline.N2O,
    };

    const setelahMitigasi = {
      CO2: mnvBaseline.CO2 + berthingBaseline.CO2 * sisaSetelah.CO2,
      CH4: mnvBaseline.CH4 + berthingBaseline.CH4 * sisaSetelah.CH4,
      N2O: mnvBaseline.N2O + berthingBaseline.N2O * sisaSetelah.N2O,
    };

    const reduksi = {
      CO2: baseline.CO2 - setelahMitigasi.CO2,
      CH4: baseline.CH4 - setelahMitigasi.CH4,
      N2O: baseline.N2O - setelahMitigasi.N2O,
    };

    const baselineCO2e =
      baseline.CO2 * GWP.CO2 + baseline.CH4 * GWP.CH4 + baseline.N2O * GWP.N2O;
    const reduksiCO2e =
      reduksi.CO2 * GWP.CO2 + reduksi.CH4 * GWP.CH4 + reduksi.N2O * GWP.N2O;
    const totalPersenCO2e = baselineCO2e > 0 ? (reduksiCO2e / baselineCO2e) * 100 : 0;

    return { baseline, reduksi, totalPersenCO2e };
  }, [baselinePerKapal, scenarios]);

  const handleSlider = (key, value) => {
    setScenarios((prev) => ({ ...prev, [key]: clamp(value, 0, 100) }));
  };

  const isOutOfBounds = (key) => {
    const v = scenarios[key];
    const b = REALISTIC_BOUNDS[key];
    return v < b.min || v > b.max;
  };

  const sliderConfig = [
    {
      key: 'aeEmissions',
      title: '1. AE Emissions Berth',
      desc: 'Substitusi ke bahan bakar rendah karbon (Biofuel/LNG) pada mesin bantu saat kapal sandar.',
      badgeColor: 'blue',
    },
    {
      key: 'aeEnergy',
      title: '2. AE Energy Berth',
      desc: 'Efisiensi pemakaian listrik internal kapal tanpa memutus daya kontainer pendingin (reefer).',
      badgeColor: 'blue',
    },
    {
      key: 'durasiSandar',
      title: '3. Duration Berthing',
      desc: 'Percepatan bongkar muat untuk memotong total durasi operasional kapal di tambatan.',
      badgeColor: 'amber',
    },
    {
      key: 'opsDaya',
      title: '4. Onshore Power Supply (OPS)',
      desc: 'Rasio kunjungan kapal yang sistem kelistrikannya kompatibel dengan daya listrik darat.',
      badgeColor: 'emerald',
    },
  ];

  return (
    <div className="w-full bg-white rounded-xl p-8 border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden font-['Poppins',sans-serif]">
      
      {/* HEADER UTAMA */}
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h3 className="text-base font-semibold text-slate-800 tracking-tight">
          Mesin Simulasi Mitigasi
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Simulasi Pengurangan Emisi Berdasarkan Faktor Dominan JICT (Activity-Based)
        </p>
      </div>

      {/* GRID KONTEN UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-3 custom-scrollbar">
        
        {/* KOLOM KIRI: SLIDER KEBIJAKAN */}
        <div className="flex flex-col gap-6 w-full">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center">
              <h4 className="text-sm font-semibold text-slate-800">
                Variabel Penentu Kebijakan (Kondisi Riil)
              </h4>
            </div>

            <div className="space-y-8">
              {sliderConfig.map((cfg) => {
                const bounds = REALISTIC_BOUNDS[cfg.key];
                const outOfBounds = isOutOfBounds(cfg.key);
                const badgeClasses = {
                  blue: 'bg-blue-50 text-[#00529B] border-blue-100',
                  amber: 'bg-amber-50 text-amber-700 border-amber-100',
                  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                }[cfg.badgeColor];

                return (
                  <div className="space-y-3" key={cfg.key}>
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <span className="text-xs font-bold text-slate-800 block mb-1">
                          {cfg.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium leading-relaxed block mb-2">
                          {cfg.desc}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeClasses}`}>
                            Batas Riil: {bounds.min}% - {bounds.max}% ({bounds.label})
                          </span>
                          {outOfBounds && (
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                              <AlertTriangle size={10} /> Melampaui Batas
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
                        <span className="text-sm font-bold text-[#00529B]">
                          {scenarios[cfg.key]}%
                        </span>
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={scenarios[cfg.key]}
                      onChange={(e) => handleSlider(cfg.key, parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#00529B]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kotak Rekomendasi */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="mt-0.5 text-[#00529B] shrink-0">
              <Info size={16} />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1.5">
                Konteks Operasional
              </h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Keempat parameter ini bekerja murni pada fase hotelling (AE saat sandar), yang merupakan kontributor emisi dominan di Terminal JICT. Emisi fase manuver (ME + AE) dipertahankan konstan sebagai *baseline* tetap.
              </p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: HASIL PROYEKSI */}
        <div className="flex flex-col gap-6 w-full">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center">
              <h4 className="text-sm font-semibold text-slate-800">
                Proyeksi Hasil Mitigasi
              </h4>
            </div>

            <div className="space-y-8 flex-1">
              
              {/* Bar CO2 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} className="text-[#00529B]" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Reduksi Karbondioksida (CO₂)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#00529B]">
                    -{hasilSimulasi?.reduksi.CO2.toFixed(3)} <span className="text-[10px] text-slate-500 font-medium">Ton</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00529B] transition-all duration-500"
                    style={{
                      width: `${((hasilSimulasi?.reduksi.CO2 / hasilSimulasi?.baseline.CO2) * 100) || 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bar CH4 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Droplets size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Reduksi Metana (CH₄)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    -{hasilSimulasi?.reduksi.CH4.toFixed(5)} <span className="text-[10px] text-slate-500 font-medium">Ton</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${((hasilSimulasi?.reduksi.CH4 / hasilSimulasi?.baseline.CH4) * 100) || 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bar N2O */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Wind size={14} className="text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Reduksi Dinitrogen Oksida (N₂O)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">
                    -{hasilSimulasi?.reduksi.N2O.toFixed(5)} <span className="text-[10px] text-slate-500 font-medium">Ton</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${((hasilSimulasi?.reduksi.N2O / hasilSimulasi?.baseline.N2O) * 100) || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Total Akumulasi Bawah */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              <div className="bg-slate-50 p-5 rounded-lg flex items-center justify-between border border-slate-200">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    Akumulasi Penurunan CO₂e
                  </span>
                  <p className="text-[9px] text-slate-500 font-medium">
                    Gabungan CO₂ + CH₄ + N₂O dikonversi via GWP (IPCC AR6, 100-yr).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-white px-4 py-2 border border-slate-200 rounded-md">
                  <TrendingDown className="text-emerald-500" size={18} />
                  <span className="text-xl font-bold text-[#00529B] leading-none">
                    {hasilSimulasi?.totalPersenCO2e.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kesimpulan Box */}
          <div className="bg-[#00529B] p-6 rounded-xl text-white shadow-md text-left">
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck size={16} className="text-blue-300" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-100">
                Kesimpulan Strategis
              </h4>
            </div>
            <p className="text-[11px] leading-relaxed font-medium text-blue-50/90">
              Berdasarkan data korelasi, strategi <span className="text-white font-bold underline decoration-blue-300 underline-offset-4">Shore Power (OPS)</span> merupakan mitigasi prioritas untuk menekan emisi hotelling secara drastis, dengan catatan emisi operasional tetap berpindah ke grid kelistrikan darat (scope-shifting).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShorePowerSimulation;