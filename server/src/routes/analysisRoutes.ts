import { Router } from 'express';
import { 
  getAiAnalysis,
  getAiAnalysisValidation,
  getSentimentAnalysis,
  getSentimentAnalysisValidation,
  runBacktest,
  runBacktestValidation,
  getRetirementAnalysis,
  getRetirementAnalysisValidation
} from '@/controllers/analysisController.js';

const router = Router();

/**
 * @route POST /api/v1/analysis/ai
 * @desc Get AI analysis for a company
 * @body ticker, name, analysisType
 * @access Public
 */
router.post('/ai', getAiAnalysisValidation, getAiAnalysis);

/**
 * @route POST /api/v1/analysis/sentiment
 * @desc Get sentiment analysis for a company
 * @body ticker, name
 * @access Public
 */
router.post('/sentiment', getSentimentAnalysisValidation, getSentimentAnalysis);

/**
 * @route POST /api/v1/analysis/backtest
 * @desc Run backtest analysis
 * @body scenario
 * @access Public
 */
router.post('/backtest', runBacktestValidation, runBacktest);

/**
 * @route POST /api/v1/analysis/retirement
 * @desc Get retirement planning analysis
 * @body currentAge, retirementAge, monthlyContribution, finalAmount
 * @access Public
 */
router.post('/retirement', getRetirementAnalysisValidation, getRetirementAnalysis);

export default router;