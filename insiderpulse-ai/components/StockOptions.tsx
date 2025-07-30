import React from 'react';
import { OptionContract } from '../types';

interface OptionsTableProps {
    title: string;
    data: OptionContract[];
}

const OptionsTable: React.FC<OptionsTableProps> = ({ title, data }) => {
    if (data.length === 0) {
        return <div className="text-gray-500 text-sm mb-4">No hay datos de {title.toLowerCase()} disponibles.</div>
    }
    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-400">
                    <thead className="text-[10px] text-gray-400 uppercase bg-white/5">
                        <tr>
                            <th className="px-4 py-2">Strike</th>
                            <th className="px-4 py-2">Last Price</th>
                            <th className="px-4 py-2">Bid</th>
                            <th className="px-4 py-2">Ask</th>
                            <th className="px-4 py-2">Chg</th>
                            <th className="px-4 py-2">% Chg</th>
                            <th className="px-4 py-2">Volume</th>
                            <th className="px-4 py-2">Open Int</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(c => (
                            <tr key={c.strike} className="border-b border-white/10 hover:bg-white/5">
                                <td className="px-4 py-3 font-bold text-white">{c.strike.toFixed(2)}</td>
                                <td className="px-4 py-3">{c.lastPrice.toFixed(2)}</td>
                                <td className="px-4 py-3">{c.bid.toFixed(2)}</td>
                                <td className="px-4 py-3">{c.ask.toFixed(2)}</td>
                                <td className={`px-4 py-3 ${c.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{c.change.toFixed(2)}</td>
                                <td className={`px-4 py-3 ${c.percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{c.percentChange.toFixed(2)}%</td>
                                <td className="px-4 py-3">{c.volume.toLocaleString()}</td>
                                <td className="px-4 py-3">{c.openInterest.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface StockOptionsProps {
    options: {
        calls: OptionContract[];
        puts: OptionContract[];
    }
}

const StockOptions: React.FC<StockOptionsProps> = ({ options }) => {
    if (!options || (options.calls.length === 0 && options.puts.length === 0)) {
         return (
             <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center text-gray-500">
                No hay datos de opciones para este activo.
            </div>
        )
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Cadena de Opciones</h2>
                <div className="text-sm text-gray-400">
                    Vencimiento: <span className="font-semibold text-white">26 Jul 2024</span>
                </div>
            </div>
            <OptionsTable title="Calls" data={options.calls} />
            <OptionsTable title="Puts" data={options.puts} />
        </div>
    );
};

export default StockOptions;