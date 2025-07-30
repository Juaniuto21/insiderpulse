import React from 'react';
import { Eye } from './IconComponents';

const Footer: React.FC = () => {
    return (
        <footer className="bg-transparent border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto py-12 px-6 text-center text-white/50">
                <div className="flex justify-center items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">InsiderPulse</h2>
                </div>

                <div className="max-w-3xl mx-auto mb-8 text-xs">
                    <p className="font-bold text-white/70 mb-2">DISCLAIMER</p>
                    <p>
                        InsiderPulse is an AI-powered financial analytics tool and not a registered financial advisor. All content, analysis, and data provided are for informational and educational purposes only and should not be construed as investment advice. Trading and investing in securities involve substantial risk of loss. Always conduct your own research and consult with a qualified financial professional before making any investment decisions.
                    </p>
                </div>

                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-8">
                    <a href="#" className="text-sm hover:text-white transition-colors">About Us</a>
                    <a href="#" className="text-sm hover:text-white transition-colors">Contact</a>
                    <a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a>
                </div>

                <p className="text-sm">
                    &copy; {new Date().getFullYear()} InsiderPulse AI. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;