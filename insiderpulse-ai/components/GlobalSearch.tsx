import React, { useState, useEffect, useRef } from 'react';
import { Search } from './IconComponents';
import { sp500companies } from '../constants';
import { CompanyProfile } from '../types';

interface GlobalSearchProps {
    onSelectTicker: (ticker: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelectTicker }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CompanyProfile[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = sp500companies
                .filter(c =>
                    c.ticker.toLowerCase().startsWith(query.toLowerCase()) ||
                    c.name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 7); // Limit results
            setResults(filtered);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (ticker: string) => {
        onSelectTicker(ticker);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Búsqueda de tickers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-md shadow-lg z-50 overflow-hidden animate-fade-in">
                    <ul>
                        {results.map(company => (
                            <li key={company.ticker}>
                                <button
                                    onClick={() => handleSelect(company.ticker)}
                                    className="w-full text-left px-4 py-2 hover:bg-emerald-500/20 flex justify-between items-center transition-colors"
                                >
                                    <span className="font-bold text-white">{company.ticker}</span>
                                    <span className="text-gray-400 text-xs truncate">{company.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;