import React from 'react';
import { IndexComponent } from '../types';

interface StockComponentsProps {
    components: IndexComponent[];
    onSelectTicker: (ticker: string) => void;
}

const StockComponents: React.FC<StockComponentsProps> = ({ components, onSelectTicker }) => {
    if (!components || components.length === 0) {
        return (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center text-gray-500">
                No hay datos de componentes para este activo.
            </div>
        );
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
             <h2 className="text-xl font-bold text-white mb-4">Principales Componentes del Índice</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Símbolo</th>
                            <th scope="col" className="px-6 py-3">% Peso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {components.map(c => (
                            <tr key={c.symbol} className="border-b border-white/10 hover:bg-white/5">
                                <td className="px-6 py-4 text-white font-medium">
                                    <button onClick={() => onSelectTicker(c.symbol)} className="hover:text-emerald-400 transition-colors">
                                        {c.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4">{c.symbol}</td>
                                <td className="px-6 py-4">{c.weight.toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export default StockComponents;