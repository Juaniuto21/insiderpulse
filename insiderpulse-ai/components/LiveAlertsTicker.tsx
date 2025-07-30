import React from 'react';
import { LiveAlert } from '../types';
import { Bell } from './IconComponents';
import { useAppContext } from '../context/AppContext';

const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
};

interface LiveAlertsTickerProps {
    onSelectTicker: (ticker: string) => void;
}

const LiveAlertsTicker: React.FC<LiveAlertsTickerProps> = ({ onSelectTicker }) => {
    const { liveAlerts: alerts, loadingAlerts: loading } = useAppContext();

    const renderSkeletons = () => (
        [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-1 space-x-3 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
        ))
    );

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-8">
            <div className="flex items-center mb-3">
              <Bell className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-white font-semibold">Alertas en Vivo</span>
            </div>
            <div className="space-y-2">
              {loading ? renderSkeletons() : 
               alerts.length > 0 ? alerts.map((alert: LiveAlert, index: number) => (
                <button 
                  key={index}
                  onClick={() => onSelectTicker(alert.ticker)}
                  className="w-full flex items-center justify-between text-sm flex-wrap hover:bg-white/5 p-1 rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-mono w-12 text-left">{alert.ticker}</span>
                    <span className="text-white/70 hidden sm:inline">{alert.action}</span>
                    <span className="text-white/60 hidden md:inline">{alert.executive}</span>
                  </div>
                  <div className="flex items-center space-x-3 ml-auto">
                    <span className="text-green-400 font-semibold">{alert.value}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(alert.risk)}`}>
                      {alert.risk}
                    </span>
                    <span className="text-white/40 text-xs w-20 text-right">{alert.time}</span>
                  </div>
                </button>
              )) : (
                <div className="text-center text-sm text-gray-500 py-2">No hay alertas en vivo en este momento.</div>
              )}
            </div>
        </div>
    );
}

export default LiveAlertsTicker;