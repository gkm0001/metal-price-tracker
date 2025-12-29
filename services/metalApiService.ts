
import { GOLD_API_KEY } from "../constants";
import { MetalType, MarketData } from "../types";

export const fetchLiveMetalPrice = async (metal: MetalType, currencyCode: string): Promise<MarketData> => {
  const symbol = metal === 'gold' ? 'XAU' : 'XAG';
  const url = `https://www.goldapi.io/api/${symbol}/${currencyCode}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-access-token': GOLD_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`GoldAPI Error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    price: data.price,
    change24h: data.ch,
    changePercent: data.chp,
    lastUpdated: new Date(data.timestamp * 1000).toLocaleTimeString(),
    currency: currencyCode,
    unit: 'oz',
    metalCode: symbol
  };
};
