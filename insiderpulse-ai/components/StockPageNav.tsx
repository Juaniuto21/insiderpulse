import React from 'react';
import { StockSubPage, STOCK_PAGE_NAV_ITEMS } from '../types';

interface StockPageNavProps {
    activeSubPage: StockSubPage;
    onNavigate: (page: StockSubPage) => void;
}

const StockPageNav: React.FC<StockPageNavProps> = ({ activeSubPage, onNavigate }) => {
    const navItems = STOCK_PAGE_NAV_ITEMS;

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-2">
            <ul className="space-y-1">
                {navItems.map(item => (
                    <li key={item}>
                        <button
                            onClick={() => onNavigate(item)}
                            className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors ${
                                item === activeSubPage 
                                ? 'bg-emerald-500/20 text-white font-semibold' 
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StockPageNav;