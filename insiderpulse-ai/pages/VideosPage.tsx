import React, { useState, useEffect } from 'react';
import { FinancialVideo } from '../types';
import { getFinancialVideos } from '../services/geminiService';
import { Video as VideoIcon, Clock } from 'lucide-react';

const VideoCard: React.FC<{ video: FinancialVideo }> = ({ video }) => (
    <a 
        href={`https://www.youtube.com/watch?v=${video.videoId}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="group bg-gray-900/50 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
    >
        <div className="relative">
            <img src={video.imageUrl} alt={video.title} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-white mb-2 leading-tight flex-grow">{video.title}</h3>
            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{video.summary}</p>
            <div className="flex items-center text-xs text-gray-400 mt-auto">
                <Clock className="w-3 h-3 mr-1.5" />
                <span>{video.channel} • {video.publishedTime}</span>
            </div>
        </div>
    </a>
);

const VideoSkeleton: React.FC = () => (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden animate-pulse">
        <div className="w-full h-40 bg-gray-700"></div>
        <div className="p-4">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        </div>
    </div>
);

const VideosPage: React.FC = () => {
    const [videos, setVideos] = useState<FinancialVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            const videoData = await getFinancialVideos();
            setVideos(videoData);
            setLoading(false);
        };
        fetchVideos();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-white flex items-center">
                    <VideoIcon className="w-10 h-10 mr-4 text-emerald-400"/>
                    Videos
                </h1>
                <p className="mt-2 text-lg text-gray-400">Análisis de mercado, entrevistas y tutoriales de nuestros expertos, curados por IA.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <VideoSkeleton key={i} />)
                ) : videos.length > 0 ? (
                    videos.map(video => <VideoCard key={video.id} video={video} />)
                ) : (
                    <div className="col-span-full text-center py-16 text-gray-500">
                        No se pudieron cargar los videos en este momento.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideosPage;