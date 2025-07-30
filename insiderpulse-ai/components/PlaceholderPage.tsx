import React from 'react';
import { LucideProps } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
    message: string;
    Icon: React.ElementType<LucideProps>;
    buttonText?: string;
    onAction?: () => void;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, message, Icon, buttonText, onAction }) => {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] text-center p-4">
            <div className="max-w-md mx-auto">
                <div className="inline-block bg-[#181A20] p-5 rounded-full mb-6 border-2 border-emerald-500/30">
                    <Icon className="w-16 h-16 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-4">{title}</h1>
                <p className="text-lg text-gray-400 mb-8">
                    {message}
                </p>
                {buttonText && onAction && (
                    <button
                        onClick={onAction}
                        className="px-8 py-3 bg-emerald-500 text-black rounded-lg text-md font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PlaceholderPage;
