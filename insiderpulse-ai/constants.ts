import { BacktestScenario, CompanyProfile } from './types';

export const mockBacktestScenarios: BacktestScenario[] = [
    {
        id: 'pton-q4-2021',
        ticker: 'PTON',
        companyName: 'Peloton Interactive, Inc.',
        eventDescription: 'Caída del 35% tras reporte de earnings (Q4 2021)',
        eventDate: 'Nov 2021',
        preEventDataSummary: `Contexto: Es Octubre 2021.
        Datos de Insider Trading (Agosto-Septiembre 2021):
        - John Foley (CEO) vendió acciones por $15M.
        - William Lynch (President) vendió acciones por $8M.
        - Múltiples VPs vendieron cantidades significativas de acciones.
        - Las ventas ocurrieron en una ventana de 30-60 días antes del próximo reporte de earnings.
        `
    },
    {
        id: 'z-q3-2021',
        ticker: 'Z',
        companyName: 'Zillow Group, Inc.',
        eventDescription: 'Caída del 25% tras abandonar el negocio de iBuying (Q3 2021)',
        eventDate: 'Nov 2021',
        preEventDataSummary: `Contexto: Es Octubre 2021.
        Datos de Insider Trading (Agosto-Septiembre 2021):
        - Rich Barton (CEO) vendió acciones por $30M.
        - Spencer Rascoff (Co-founder, Board) vendió $50M en acciones.
        - Múltiples ejecutivos liquidaron grandes posiciones de manera coordinada.
        Rumores del mercado: Se habla de problemas en su división de "iBuying" (compra y venta de casas).
        `
    }
];

export const sp500companies: Omit<CompanyProfile, 'price' | 'change'>[] = [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.' },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
    { ticker: 'NVDA', name: 'NVIDIA Corporation' },
    { ticker: 'TSLA', name: 'Tesla, Inc.' },
    { ticker: 'META', name: 'Meta Platforms, Inc.' },
    { ticker: 'BRK-B', name: 'Berkshire Hathaway' },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
    { ticker: 'JNJ', name: 'Johnson & Johnson' },
    { ticker: 'V', name: 'Visa Inc.' },
    { ticker: 'PG', name: 'Procter & Gamble' },
    { ticker: 'UNH', name: 'UnitedHealth Group' },
    { ticker: 'HD', name: 'Home Depot' },
    { ticker: 'MA', name: 'Mastercard Inc.' },
    { ticker: 'BAC', name: 'Bank of America' },
    { ticker: 'PFE', name: 'Pfizer Inc.' },
    { ticker: 'DIS', name: 'The Walt Disney Co.' },
    { ticker: 'ADBE', name: 'Adobe Inc.' },
    { ticker: 'CRM', name: 'Salesforce, Inc.' },
    { ticker: 'NFLX', name: 'Netflix, Inc.' },
    { ticker: 'KO', name: 'Coca-Cola Co.' },
    { ticker: 'PEP', name: 'PepsiCo, Inc.' },
    { ticker: 'WMT', name: 'Walmart Inc.' },
    { ticker: 'MCD', name: 'McDonald\'s Corp.' },
    { ticker: 'COST', name: 'Costco Wholesale' },
    { ticker: 'CSCO', name: 'Cisco Systems' },
    { ticker: 'INTC', 'name': 'Intel Corporation' },
    { ticker: 'ORCL', name: 'Oracle Corporation' },
    { ticker: 'IBM', name: 'IBM' },
    { ticker: 'QCOM', name: 'QUALCOMM Inc.' },
    { ticker: 'PYPL', name: 'PayPal Holdings' },
];
