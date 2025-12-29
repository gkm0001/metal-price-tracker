import React, { useState, useEffect, useCallback } from 'react';
import { fetchLiveMetalPrice } from './services/metalApiService';
import { getTaxInfo } from './services/geminiService';
import SearchableSelect from './components/SearchableSelect';
import { 
  MarketData, 
  MetalType, 
  Currency,
  Country,
  TaxInfo
} from './types';
import { 
  SUPPORTED_CURRENCIES, 
  COUNTRIES,
  GRAMS_PER_OUNCE
} from './constants';

const App: React.FC = () => {
  const [metal, setMetal] = useState<MetalType>('gold');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]); // Default India
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]); // Default USD
  const [weightGrams, setWeightGrams] = useState<number>(1);
  
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaxLoading, setIsTaxLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsTaxLoading(true);
    try {
      const pricePromise = fetchLiveMetalPrice(metal, currency.code);
      const taxPromise = getTaxInfo(metal, country.name);

      const [priceData, taxes] = await Promise.all([pricePromise, taxPromise]);
      
      setMarketData(priceData);
      setTaxInfo(taxes);
    } catch (error) {
      console.error("Data loading failed", error);
    } finally {
      setIsLoading(false);
      setIsTaxLoading(false);
    }
  }, [metal, currency, country]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const countryOptions = COUNTRIES.map(c => ({
    id: c.name,
    label: c.name,
    icon: c.flag,
    subLabel: `Market Region`
  }));

  const currencyOptions = SUPPORTED_CURRENCIES.map(c => ({
    id: c.code,
    label: `${c.code} - ${c.name}`,
    icon: c.flag,
    subLabel: `Symbol: ${c.symbol}`
  }));

  const spotPricePerOz = marketData ? marketData.price : 0;
  const spotPricePerGram = spotPricePerOz / GRAMS_PER_OUNCE;
  
  const baseValue = spotPricePerGram * weightGrams;
  const taxRate = taxInfo ? taxInfo.percentage / 100 : 0;
  const taxValue = baseValue * taxRate;
  const finalValue = baseValue + taxValue;

  return (
    <div className="min-h-screen pb-12 transition-all duration-300">
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center mb-8 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${metal === 'gold' ? 'gold-gradient' : 'silver-gradient'} shadow-md animate-pulse`}></div>
          <h1 className="text-xl font-black tracking-tighter">AURA<span className="font-light opacity-50 ml-1">METALS</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-2xl glass hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"></path></svg>
            ) : (
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6">
        <div className="flex justify-center mb-8">
          <div className="bg-black/5 dark:bg-white/5 p-1 rounded-[2rem] flex border border-black/5 dark:border-white/10 w-full max-w-sm overflow-hidden">
            <button 
              onClick={() => setMetal('gold')}
              className={`flex-1 py-4 rounded-[1.75rem] transition-all font-black text-xs uppercase tracking-widest ${metal === 'gold' ? 'bg-white dark:bg-amber-500 shadow-xl dark:text-black translate-y-[-2px]' : 'opacity-40 hover:opacity-70'}`}
            >
              Gold 
            </button>
            <button 
              onClick={() => setMetal('silver')}
              className={`flex-1 py-4 rounded-[1.75rem] transition-all font-black text-xs uppercase tracking-widest ${metal === 'silver' ? 'bg-white dark:bg-slate-200 shadow-xl dark:text-black translate-y-[-2px]' : 'opacity-40 hover:opacity-70'}`}
            >
              Silver
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SearchableSelect 
            label="Pricing Rules (Market)"
            placeholder="Search countries..."
            options={countryOptions}
            value={country.name}
            onChange={(name) => {
              const found = COUNTRIES.find(c => c.name === name);
              if (found) {
                setCountry(found);
                setTaxInfo(null);
                setIsTaxLoading(true);
              }
            }}
          />
          <SearchableSelect 
            label="Display Currency"
            placeholder="Search currencies..."
            options={currencyOptions}
            value={currency.code}
            onChange={(code) => {
              const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
              if (found) setCurrency(found);
            }}
          />
        </div>

        <div className="glass p-10 rounded-[3rem] shadow-2xl shadow-black/10 mb-8 relative overflow-hidden border border-white/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500 opacity-30"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2 bg-amber-500/10 px-4 py-1.5 rounded-full">
              <span className="text-xl">{country.flag}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                {isTaxLoading ? 'Recalculating Duties...' : 'Regional Valuation'}
              </span>
            </div>
            
            <div className={`text-7xl md:text-9xl font-black mb-10 tracking-tighter text-slate-900 dark:text-white transition-opacity duration-300 ${isTaxLoading ? 'opacity-30' : 'opacity-100'}`}>
              <span className="text-4xl opacity-30 font-light mr-1">{currency.symbol}</span>
              {finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="w-full max-w-sm mb-12">
              <label className="block text-xs font-black uppercase tracking-widest opacity-40 mb-3 text-center">Weight Calculation</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(Math.max(0, Number(e.target.value)))}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-black/5 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/40 rounded-[2rem] px-8 py-6 text-5xl font-black outline-none text-center transition-all group-hover:bg-black/[0.08] dark:group-hover:bg-white/[0.08]"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black opacity-20 text-2xl uppercase tracking-tighter">Grams</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
               <div className="glass p-6 rounded-[2rem] flex flex-col items-center border border-black/5 dark:border-white/5">
                  <span className="text-[10px] uppercase font-black opacity-30 mb-2">Net Market Cost</span>
                  <span className="text-2xl font-bold">{currency.symbol}{baseValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="glass p-6 rounded-[2rem] flex flex-col items-center border border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
                  <span className="text-[10px] uppercase font-black text-amber-600/60 dark:text-amber-400/60 mb-2 whitespace-nowrap">
                    {isTaxLoading ? 'Calculating Tax...' : `Regional Tax (${taxInfo?.percentage || 0}%)`}
                  </span>
                  {isTaxLoading ? (
                    <div className="flex items-center gap-2 h-8">
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-red-500">+{currency.symbol}{taxValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  )}
               </div>
               <div className="glass p-6 rounded-[2rem] flex flex-col items-center border border-green-500/20 bg-green-500/5 transition-opacity duration-300">
                  <span className="text-[10px] uppercase font-black text-green-600/60 dark:text-green-400/60 mb-2">Estimated Total</span>
                  <span className={`text-2xl font-bold text-green-500 ${isTaxLoading ? 'opacity-20' : ''}`}>
                    {currency.symbol}{finalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full border-t border-black/5 dark:border-white/5 pt-10">
              <div className="flex flex-col text-center">
                <span className="text-[10px] uppercase font-black opacity-30 mb-1">Spot Price / g</span>
                <span className="font-bold text-sm">{currency.symbol}{spotPricePerGram.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[10px] uppercase font-black opacity-30 mb-1">24h Volatility</span>
                <span className={`font-bold text-sm ${marketData && marketData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketData && marketData.change24h >= 0 ? '↑' : '↓'} {marketData?.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[10px] uppercase font-black opacity-30 mb-1">Local Market</span>
                <span className="font-bold text-sm truncate px-2">{country.name}</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[10px] uppercase font-black opacity-30 mb-1">Last Update</span>
                <span className="font-bold text-sm flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                  {isLoading ? 'Fetching' : marketData?.lastUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 mt-12">
          <button 
            onClick={loadData}
            disabled={isLoading || isTaxLoading}
            className="group relative bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {(isLoading || isTaxLoading) ? 'Syncing Market...' : 'Refresh Live Prices'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-200 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
          <p className="text-[10px] opacity-20 text-center max-w-sm font-medium">
            Values are calculated using the interbank spot rate from GoldAPI.io. Regional taxes are estimated through real-time AI research.
          </p>
        </div>
      </main>

      <footer className="mt-16 text-center opacity-20">
        <p className="text-[9px] font-bold uppercase tracking-widest">© 2024 Aura Tracker • Intelligent Metal Valuation</p>
      </footer>
    </div>
  );
};

export default App;