import React from 'react';
import { CompanyProfile, SentimentAnalysisResult } from '../types';
import { Newspaper } from './IconComponents';

interface NewsAndSentimentProps {
    result: SentimentAnalysisResult | null;
    loading: boolean;
    company: CompanyProfile;
}

const getSentimentColor = (sentiment: SentimentAnalysisResult['overallSentiment']) => {
    switch (sentiment) {
        case 'Positive': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/50';
        case 'Neutral': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        case 'Mixed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4">
        <div className="h-8 bg-white/10 rounded-md w-3/4 animate-pulse"></div>
        <div className="h-4 bg-white/10 rounded-md w-full animate-pulse"></div>
        <div className="h-4 bg-white/10 rounded-md w-5/6 animate-pulse"></div>
        <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="w-16 h-10 bg-white/10 rounded-md animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded-md animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded-md w-1/2 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const NewsAndSentiment: React.FC<NewsAndSentimentProps> = ({ result, loading, company }) => {
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h3 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Newspaper className="w-7 h-7 mr-3 text-purple-400" />
                Análisis de Noticias y Sentimiento en Tiempo Real
            </h3>
            <p className="text-white/70 mb-6">
                Análisis de IA basado en noticias recientes de la web para {company.name}.
            </p>

            {loading ? (
                <LoadingSkeleton />
            ) : result ? (
                <div className="space-y-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="text-lg font-semibold text-white">Sentimiento General:</span>
                            <span className={`px-4 py-1.5 rounded-full text-lg font-bold ${getSentimentColor(result.overallSentiment)}`}>
                                {result.overallSentiment}
                            </span>
                        </div>
                        <p className="text-white/80 bg-white/5 p-4 rounded-lg border border-white/10">
                            <strong>Resumen Clave:</strong> {result.keyTakeaways}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Noticias Clave Analizadas:</h4>
                        <div className="space-y-4">
                            {result.articles.map((article, index) => (
                                <a
                                    key={index}
                                    href={article.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-white/10 transition-colors"
                                >
                                    <div className="font-bold text-white mb-1">{article.title}</div>
                                    <p className="text-sm text-white/70 mb-2">{article.summary}</p>
                                    <div className="text-xs text-purple-400 font-semibold">{article.source}</div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-white/60">No se pudo cargar el análisis de noticias.</div>
            )}
        </div>
    );
};

export default NewsAndSentiment;