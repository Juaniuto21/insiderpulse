import React from 'react';
import { Check } from './IconComponents';

const FeatureListItem: React.FC<{ children: React.ReactNode, pro?: boolean }> = ({ children, pro = false }) => (
    <li className="flex items-start">
        <Check className={`w-4 h-4 mr-2 mt-1 flex-shrink-0 ${pro ? 'text-red-400' : 'text-green-400'}`} />
        <span>{children}</span>
    </li>
);


const Pricing: React.FC = () => {
    return (
        <div className="text-center pt-16 pb-8">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 max-w-5xl mx-auto">
                <h3 className="text-3xl font-bold text-white mb-4">Planes Diseñados para Inversores Serios</h3>
                <p className="text-white/70 mb-8 text-lg">
                    Obtén las herramientas que necesitas para proteger tu capital y descubrir oportunidades.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Basic Plan */}
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 flex flex-col">
                        <div className="flex-grow">
                            <div className="text-2xl font-bold text-white mb-2">Basic</div>
                            <div className="text-4xl font-bold text-red-400 mb-4">$99<span className="text-lg text-white/60">/mes</span></div>
                            <ul className="text-white/70 text-sm space-y-3 text-left">
                                <FeatureListItem>Alertas de Insider Trading</FeatureListItem>
                                <FeatureListItem>Explorador del S&P 500</FeatureListItem>
                                <FeatureListItem>Análisis básico de patrones</FeatureListItem>
                                <FeatureListItem>Historial de búsqueda (7 días)</FeatureListItem>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Pro Plan */}
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border-2 border-red-500/50 relative flex flex-col">
                         <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            MÁS POPULAR
                        </div>
                        <div className="flex-grow">
                            <div className="text-2xl font-bold text-white mb-2">Pro</div>
                            <div className="text-4xl font-bold text-red-400 mb-4">$299<span className="text-lg text-white/60">/mes</span></div>
                            <ul className="text-white/70 text-sm space-y-3 text-left">
                                <FeatureListItem pro>Alertas en tiempo real por email y app</FeatureListItem>
                                <FeatureListItem pro>Análisis 5-vectores de IA completo</FeatureListItem>
                                <FeatureListItem pro>Análisis de noticias y sentimiento</FeatureListItem>
                                <FeatureListItem pro>Plataforma de Backtesting</FeatureListItem>
                                <FeatureListItem pro>Todas las empresas públicas US</FeatureListItem>
                                <FeatureListItem pro>Historial de búsqueda ilimitado</FeatureListItem>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Enterprise Plan */}
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 flex flex-col">
                        <div className="flex-grow">
                            <div className="text-2xl font-bold text-white mb-2">Enterprise</div>
                            <div className="text-4xl font-bold text-red-400 mb-4">$999<span className="text-lg text-white/60">/mes</span></div>
                            <ul className="text-white/70 text-sm space-y-3 text-left">
                                <FeatureListItem>Todo lo del plan Pro</FeatureListItem>
                                <FeatureListItem>Acceso a la API de Riesgos para integración</FeatureListItem>
                                <FeatureListItem>Crea tus propios filtros y alertas</FeatureListItem>
                                <FeatureListItem>Soporte prioritario y onboarding</FeatureListItem>
                                <FeatureListItem>Opciones de White-label</FeatureListItem>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-all text-lg font-semibold">
                        Empezar Trial Gratuito (14 días)
                    </button>
                    <button className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 text-lg">
                        Ver Demo Completo
                    </button>
                </div>
                
                <p className="text-white/60 text-sm mt-4">
                    Sin tarjeta de crédito • Cancela cuando quieras • 30 días money-back guarantee
                </p>
            </div>
        </div>
    );
}

export default Pricing;