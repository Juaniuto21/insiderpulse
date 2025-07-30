import React, { useState } from 'react';
import { sp500companies } from '../constants';
import { LayoutGrid, Search } from './IconComponents';

interface SP500ExplorerProps {
    onSelectTicker: (ticker: string) => void;
}

const SP500Explorer: React.FC<SP500ExplorerProps> = ({ onSelectTicker }) => {
    const [filter, setFilter] = useState('');

    const filteredCompanies = sp500companies.filter(
        company =>
            company.name.toLowerCase().includes(filter.toLowerCase()) ||
            company.ticker.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                 <h3 className="text-3xl font-bold text-white mb-2 flex items-center">
                    <LayoutGrid className="w-7 h-7 mr-3 text-blue-400" />
                    Explorar S&P 500
                </h3>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Filtrar por nombre o ticker..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCompanies.slice(0, 24).map(company => ( // Show a reasonable amount
                    <button
                        key={company.ticker}
                        onClick={() => onSelectTicker(company.ticker)}
                        className="bg-white/5 p-4 rounded-lg text-left hover:bg-white/10 hover:border-blue-400 border border-transparent transition-all"
                    >
                        <div className="font-bold text-white text-lg">{company.ticker}</div>
                        <div className="text-sm text-white/70 truncate">{company.name}</div>
                    </button>
                ))}
            </div>
            {filteredCompanies.length === 0 && (
                <div className="text-center py-8 text-white/60">
                    No se encontraron empresas.
                </div>
            )}
        </div>
    );
};

export default SP500Explorer;