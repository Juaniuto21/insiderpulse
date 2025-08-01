import React, { useState, useMemo } from 'react';
import { HeartHandshake, Brain } from 'lucide-react';
import GrowthChart from '../components/GrowthChart';
import { getRetirementAnalysis } from '../services/geminiService';

const Slider: React.FC<{ label: string, value: number, min: number, max: number, step: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, format: (val: number) => string }> = 
    ({ label, value, min, max, step, onChange, format }) => (
    <div>
        <label className="flex justify-between items-center text-white/80 text-sm mb-1">
            <span>{label}</span>
            <span className="font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded">{format(value)}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full"
        />
    </div>
);

const PersonalFinancePage: React.FC = () => {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(65);
    const [initialSavings, setInitialSavings] = useState(25000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [interestRate, setInterestRate] = useState(7);
    
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);

    const chartData = useMemo(() => {
        const years = retirementAge - currentAge;
        if (years <= 0) return [];

        let balance = initialSavings;
        const data = [{ year: currentAge, balance }];

        for (let i = 1; i <= years; i++) {
            balance = balance * (1 + interestRate / 100) + (monthlyContribution * 12);
            data.push({ year: currentAge + i, balance: parseFloat(balance.toFixed(2)) });
        }
        return data;
    }, [currentAge, retirementAge, initialSavings, monthlyContribution, interestRate]);
    
    const finalAmount = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;
    
    const handleGetAnalysis = async () => {
        setLoadingAi(true);
        const result = await getRetirementAnalysis({
            currentAge,
            retirementAge,
            monthlyContribution,
            finalAmount
        });
        setAiAnalysis(result);
        setLoadingAi(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-white flex items-center">
                    <HeartHandshake className="w-10 h-10 mr-4 text-emerald-400"/>
                    Finanzas Personales
                </h1>
                <p className="mt-2 text-lg text-gray-400">Herramientas para planificar tu futuro financiero.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Calculadora de Jubilación</h2>
                    <div className="space-y-6">
                        <Slider label="Edad Actual" value={currentAge} min={18} max={70} step={1} onChange={(e) => setCurrentAge(parseInt(e.target.value))} format={v => `${v} años`} />
                        <Slider label="Edad de Jubilación" value={retirementAge} min={currentAge + 1} max={80} step={1} onChange={(e) => setRetirementAge(parseInt(e.target.value))} format={v => `${v} años`} />
                        <Slider label="Ahorros Iniciales" value={initialSavings} min={0} max={1000000} step={1000} onChange={(e) => setInitialSavings(parseInt(e.target.value))} format={v => `$${v.toLocaleString()}`} />
                        <Slider label="Aporte Mensual" value={monthlyContribution} min={0} max={10000} step={100} onChange={(e) => setMonthlyContribution(parseInt(e.target.value))} format={v => `$${v.toLocaleString()}`} />
                        <Slider label="Tasa de Interés Anual" value={interestRate} min={1} max={15} step={0.5} onChange={(e) => setInterestRate(parseFloat(e.target.value))} format={v => `${v}%`} />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Proyección de Crecimiento</h2>
                    <p className="text-5xl font-bold text-emerald-400 mb-4">${finalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p className="text-gray-400 text-sm mb-4">Capital estimado a la edad de {retirementAge} años.</p>
                    <div className="h-80">
                         <GrowthChart data={chartData} />
                    </div>
                     <div className="mt-6">
                        <button onClick={handleGetAnalysis} disabled={loadingAi} className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-black rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                             {loadingAi ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                             ) : (
                                <>
                                    <Brain className="w-5 h-5 mr-2" />
                                    Obtener Análisis con IA
                                </>
                             )}
                        </button>
                        {aiAnalysis && !loadingAi && (
                             <div className="mt-4 bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 p-4 rounded-lg animate-fade-in">
                                <p className="text-sm">{aiAnalysis}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalFinancePage;