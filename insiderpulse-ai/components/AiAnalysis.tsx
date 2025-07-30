
import React from 'react';
import { AiAnalysisResult } from '../types';
import { Brain } from './IconComponents';

interface AiAnalysisProps {
  analysis: AiAnalysisResult | null;
  loading: boolean;
}

const AiAnalysis: React.FC<AiAnalysisProps> = ({ analysis, loading }) => {
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-red-500/20 p-6">
      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-400" />
        Análisis de IA
      </h4>
      {loading ? (
        <div className="flex items-center justify-center p-8 space-x-3 text-white/70">
          <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <span>Generando análisis con Gemini...</span>
        </div>
      ) : analysis ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-4">
          <div>
            <strong className="text-white/90 block mb-1">Patrón Detectado:</strong>
            <p className="text-white/80">{analysis.patternDetected}</p>
          </div>
          <div>
            <strong className="text-white/90 block mb-1">Contexto Histórico:</strong>
            <p className="text-white/80">{analysis.historicalContext}</p>
          </div>
          <div>
            <strong className="text-white/90 block mb-1">Recomendación:</strong>
            <p className="text-white/80">{analysis.recommendation}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-white/50">No hay análisis para mostrar.</div>
      )}
    </div>
  );
};

export default AiAnalysis;
