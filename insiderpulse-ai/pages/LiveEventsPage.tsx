import React, { useState, useEffect } from 'react';
import { LiveEvent, LiveEventCategory } from '../types';
import { getLiveMarketEvents } from '../services/geminiService';
import { Tv, Calendar, Flame, Radio } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
    'Transmisiones en Vivo': Radio,
    'Calendario Económico (Hoy)': Calendar,
    'Noticias de Última Hora': Flame,
};

const EventCard: React.FC<{ event: LiveEvent }> = ({ event }) => (
    <a 
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gray-900/50 backdrop-blur-xl p-4 rounded-xl hover:bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all"
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-white mb-1 pr-4">{event.title}</h4>
            {event.isLive && (
                <div className="flex-shrink-0 flex items-center text-xs font-bold bg-red-600 text-white px-2 py-1 rounded animate-pulse">
                    <Radio className="w-3 h-3 mr-1"/> LIVE
                </div>
            )}
        </div>
        <p className="text-sm text-gray-400">{event.description}</p>
        <div className="text-xs text-gray-500 mt-3 flex justify-between">
            <span>Fuente: {event.source}</span>
            {event.time && <span>{event.time}</span>}
        </div>
    </a>
);


const LiveEventsPage: React.FC = () => {
    const [eventCategories, setEventCategories] = useState<LiveEventCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const data = await getLiveMarketEvents();
            setEventCategories(data);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const renderSkeleton = () => (
        <div className="space-y-6">
            {[1, 2].map(i => (
                <div key={i}>
                    <div className="h-8 w-1/2 bg-gray-700 rounded-md mb-4 animate-pulse"></div>
                    <div className="space-y-4">
                        <div className="h-24 bg-gray-900/50 rounded-xl animate-pulse"></div>
                        <div className="h-24 bg-gray-900/50 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-white flex items-center">
                    <Tv className="w-10 h-10 mr-4 text-emerald-400"/>
                    Eventos de Mercado en Vivo
                </h1>
                <p className="mt-2 text-lg text-gray-400">Noticias, datos y transmisiones que mueven el mercado, actualizadas en tiempo real.</p>
            </div>
            
            {loading ? renderSkeleton() : (
                <div className="space-y-10">
                    {eventCategories.map(category => {
                         const Icon = ICONS[category.categoryTitle] || Tv;
                         return (
                            <div key={category.categoryTitle}>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                    <Icon className="w-6 h-6 mr-3 text-emerald-400"/>
                                    {category.categoryTitle}
                                </h2>
                                {category.events.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {category.events.map(event => (
                                            <EventCard key={event.id} event={event}/>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10">
                                        No hay eventos en vivo en este momento.
                                    </div>
                                )}
                            </div>
                         );
                    })}
                </div>
            )}
        </div>
    );
};

export default LiveEventsPage;