import React from 'react';
import { HistoricalDataRow } from '../types';

interface StockHistoricalDataProps {
    data: HistoricalDataRow[];
}

const StockHistoricalData: React.FC<StockHistoricalDataProps> = ({ data }) => {
     if (!data || data.length === 0) {
        return (
             <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center text-gray-500">
                No hay datos históricos para este activo.
            </div>
        )
    }
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4">
             <h2 className="text-xl font-bold text-white mb-4">Datos Históricos</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3">Abrir</th>
                            <th scope="col" className="px-6 py-3">Alto</th>
                            <th scope="col" className="px-6 py-3">Bajo</th>
                            <th scope="col" className="px-6 py-3">Cerrar</th>
                            <th scope="col" className="px-6 py-3">Volumen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.date} className="border-b border-white/10 hover:bg-white/5">
                                <td className="px-6 py-4 text-white font-medium">{row.date}</td>
                                <td className="px-6 py-4">{row.open.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-4">{row.high.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-4">{row.low.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-4">{row.close.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                <td className="px-6 py-4">{row.volume.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export default StockHistoricalData;