import React from 'react';
import { Eye, Zap } from './IconComponents';
import { Page } from '../types';

interface HeroBannerProps {
    navigateTo: (page: Page) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ navigateTo }) => {
    return (
        <div className="my-6 p-8 bg-gradient-to-r from-gray-900 via-emerald-900/20 to-gray-900 rounded-lg border border-emerald-500/30 text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-white">
                    Go Beyond the News with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">InsiderPulse AI</span>
                </h2>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
                The news tells you what happened. Our AI tells you what might happen next. Analyze hidden risks from insider trading, supply chains, and accounting red flags to gain a real competitive edge.
            </p>
            <button
                onClick={() => navigateTo('Investigación')}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-all text-lg font-semibold shadow-red-500/20 shadow-lg flex items-center justify-center mx-auto"
            >
                <Zap className="w-5 h-5 mr-3" />
                Launch Full Analysis Tool
            </button>
        </div>
    );
};

export default HeroBanner;