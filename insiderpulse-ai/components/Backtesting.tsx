import React, { useState } from 'react';
import { mockBacktestScenarios } from '../constants';
import { BacktestScenario, BacktestResult } from '../types';
import { runBacktestAnalysis } from '../services/geminiService';
import { History, Brain, AlertTriangle, Check, Zap } from './IconComponents';

const Backtesting: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<BacktestScenario | null>(null);
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRunBacktest = async () => {
        if (!selectedScenario) return;
        setLoading(true);
        setResult(null);
        const analysisResult = await runBacktestAnalysis(selectedScenario);
        setResult(analysisResult);
        setLoading(false);
    }

    return (
        <div className="py-12 my-12">
            <div className="text-center mb-12">
                <div className="inline-block bg-blue-500/10 p-3 rounded-full mb-4 border border-blue-500/20">
                    <History className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Prueba Nuestra Precisión: Backtesting Histórico
                </h2>
                <p className="text-lg text-white/70 max-w-3xl mx-auto">
                    No solo te lo decimos, te lo demostramos. Selecciona un evento de mercado histórico y mira cómo nuestra IA lo habría anticipado.
                </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <label className="block text-white/80 font-semibold mb-2" htmlFor="scenario-select">
                        1. Elige un Escenario Histórico
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockBacktestScenarios.map(scenario => (
                            <button 
                                key={scenario.id}
                                onClick={() => setSelectedScenario(scenario)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${selectedScenario?.id === scenario.id ? 'bg-blue-500/20 border-blue-400' : 'bg-white/5 border-white/10 hover:border-blue-500/50'}`}
                            >
                                <div className="font-bold text-white">{scenario.ticker} - {scenario.companyName}</div>
                                <div className="text-sm text-white/70">{scenario.eventDescription}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center mb-8">
                    <button
                        onClick={handleRunBacktest}
                        disabled={!selectedScenario || loading}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Ejecutar Backtest con IA
                            </>
                        )}
                    </button>
                </div>
                
                {result && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-2xl font-bold text-center text-white">Resultados del Backtest para {selectedScenario?.ticker}</h3>
                        
                        {/* AI Prediction Card */}
                        <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/50">
                            <div className="flex items-center text-red-400 mb-3">
                                <AlertTriangle className="w-6 h-6 mr-3" />
                                <h4 className="text-xl font-bold">La Predicción de InsiderPulse (Semanas Antes)</h4>
                            </div>
                            <p className="text-white/90 font-semibold mb-2">{result.aiPrediction}</p>
                            <p className="text-white/70 text-sm">{result.aiReasoning}</p>
                        </div>

                        {/* Actual Outcome Card */}
                        <div className="bg-green-900/30 rounded-lg p-6 border border-green-500/50">
                            <div className="flex items-center text-green-400 mb-3">
                                <Check className="w-6 h-6 mr-3" />
                                <h4 className="text-xl font-bold">El Resultado Real del Mercado</h4>
                            </div>
                            <p className="text-white/90 font-semibold">{result.actualOutcome}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Backtesting;