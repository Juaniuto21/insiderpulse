import React from 'react';
import { CompanyProfile, ComprehensiveAnalysisResult, AiAnalysisResult, AnalysisModuleType } from '../types';
import { Brain, Target, FileText, Truck, Lightbulb, Gavel } from './IconComponents';

const ICONS: Record<AnalysisModuleType, React.ElementType> = {
  [AnalysisModuleType.INSIDER_TRADING]: Target,
  [AnalysisModuleType.ACCOUNTING_FLAGS]: FileText,
  [AnalysisModuleType.SUPPLY_CHAIN]: Truck,
  [AnalysisModuleType.PATENTS]: Lightbulb,
  [AnalysisModuleType.REGULATORY_RISKS]: Gavel,
};

const ICON_COLORS: Record<AnalysisModuleType, string> = {
    [AnalysisModuleType.INSIDER_TRADING]: 'text-red-400',
    [AnalysisModuleType.ACCOUNTING_FLAGS]: 'text-blue-400',
    [AnalysisModuleType.SUPPLY_CHAIN]: 'text-yellow-400',
    [AnalysisModuleType.PATENTS]: 'text-green-400',
    [AnalysisModuleType.REGULATORY_RISKS]: 'text-indigo-400',
}

interface AnalysisCardProps {
    type: AnalysisModuleType;
    analysis: AiAnalysisResult | null;
    loading: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ type, analysis, loading }) => {
    const Icon = ICONS[type];
    const color = ICON_COLORS[type];

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h4 className={`text-xl font-semibold text-white mb-4 flex items-center`}>
                <Icon className={`w-5 h-5 mr-3 ${color}`} />
                {type}
            </h4>
            {loading ? (
                <div className="flex items-center justify-center p-8 space-x-3 text-white/70">
                    <div className={`w-6 h-6 border-2 ${color}/30 border-t-${color.replace('text-','')} rounded-full animate-spin`} />
                    <span>Generando análisis con Gemini...</span>
                </div>
            ) : analysis ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
                    <div>
                        <strong className="text-white/90 block mb-1">Análisis de IA:</strong>
                        <p className="text-white/80">{analysis.patternDetected}</p>
                    </div>
                    <div>
                        <strong className="text-white/90 block mb-1">Contexto y Justificación:</strong>
                        <p className="text-white/80">{analysis.historicalContext}</p>
                    </div>
                    <div>
                        <strong className="text-white/90 block mb-1">Conclusión:</strong>
                        <p className="text-white/80">{analysis.recommendation}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-white/50">No se pudo generar el análisis.</div>
            )}
        </div>
    );
};


interface ComprehensiveAnalysisProps {
  company: CompanyProfile;
  analyses: ComprehensiveAnalysisResult;
  loadingStates: Partial<Record<AnalysisModuleType, boolean>>;
}

const ComprehensiveAnalysis: React.FC<ComprehensiveAnalysisProps> = ({ company, analyses, loadingStates }) => {
  const analysisOrder = Object.values(AnalysisModuleType);
  
  return (
    <div className="space-y-8">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-2">Auditoría de Riesgo de 5 Vectores</h3>
            <p className="text-white/70">Análisis de IA en las áreas clave de riesgo para {company.name}.</p>
        </div>
        
        <div className="space-y-6">
            {analysisOrder.map(type => (
                <AnalysisCard 
                    key={type}
                    type={type}
                    analysis={analyses[type] || null}
                    loading={!!loadingStates[type]}
                />
            ))}
        </div>
    </div>
  );
};

export default ComprehensiveAnalysis;