import React from 'react';
import { KeyStats as KeyStatsType } from '../types';

interface KeyStatsProps {
    stats: KeyStatsType;
}

const KeyStats: React.FC<KeyStatsProps> = ({ stats }) => {
    const statKeys = Object.keys(stats);
    const midPoint = Math.ceil(statKeys.length / 2);
    const firstColumnKeys = statKeys.slice(0, midPoint);
    const secondColumnKeys = statKeys.slice(midPoint);

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 text-sm">
                <div>
                    {firstColumnKeys.map(key => (
                        <div key={key} className="flex justify-between py-1.5 border-b border-white/10">
                            <span className="text-gray-400">{key}</span>
                            <span className="text-white font-semibold">{stats[key]}</span>
                        </div>
                    ))}
                </div>
                <div>
                    {secondColumnKeys.map(key => (
                        <div key={key} className="flex justify-between py-1.5 border-b border-white/10">
                            <span className="text-gray-400">{key}</span>
                            <span className="text-white font-semibold">{stats[key]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KeyStats;