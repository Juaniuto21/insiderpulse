import React from 'react';
import { ConversationPost } from '../types';
import { MessageCircle, ArrowUpCircle, ArrowDownCircle } from './IconComponents';

interface StockConversationsProps {
    conversations: ConversationPost[];
}

const StockConversations: React.FC<StockConversationsProps> = ({ conversations }) => {
    if (!conversations || conversations.length === 0) {
        return (
             <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center text-gray-500">
                No hay conversaciones para este activo.
            </div>
        )
    }
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-4">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                <MessageCircle className="w-5 h-5 mr-3 text-emerald-400" />
                Conversaciones
            </h2>
            {conversations.map(post => (
                <div key={post.id} className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <span className="font-bold text-white">{post.user}</span>
                            <span className="text-xs text-gray-500 ml-2">• {post.time}</span>
                        </div>
                        <div className={`flex items-center text-xs font-bold ${post.sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'}`}>
                            {post.sentiment === 'Bullish' ? <ArrowUpCircle className="w-4 h-4 mr-1" /> : <ArrowDownCircle className="w-4 h-4 mr-1" />}
                            {post.sentiment}
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm">{post.post}</p>
                </div>
            ))}
        </div>
    );
};

export default StockConversations;