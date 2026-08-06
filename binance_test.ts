// Type definitions for the specific Binance P2P API response data we need
interface P2PAd {
  price: string;
  minSingleTransAmount: string;
  maxSingleTransAmount: string;
}

interface Advertiser {
  nickName: string;
}

interface P2PAdWrapper {
  adv: P2PAd;
  advertiser: Advertiser;
}

interface BinanceP2PResponse {
  code: string;
  message: string | null;
  data: P2PAdWrapper[];
  success: boolean;
}

/**
 * Fetches the top real-time Zelle to USDT rates from Binance P2P
 * @param rows Number of ad listings to return (default 3)
 */
async function getZelleUsdtRates(rows: number = 3): Promise<void> {
  const url = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

  // Strict headers mirroring a standard desktop browser to bypass initial bot blocks
  const headers = {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Lang': 'en'
  };

  const payload = {
    asset: 'USDT',
    fiat: 'USD',
    merchantCheck: false,
    page: 1,
    payTypes: ['Zelle'],
    // 1. Filtrar por comerciantes verificados (como hace la app por defecto)
    publisherType: 'merchant', 
    // 2. Simular el monto exacto que buscas en la app (ejemplo: 100 USD)
    transAmount: '500', 
    // 3. Filtrar por comerciantes que operan con usuarios de Venezuela
    countries: ['VE'], 
    rows: rows,
    tradeType: 'BUY'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 403) {
        console.error('Error 403: Cloudflare or Binance Rate Limit Blocked your IP.');
      } else {
        console.error(`HTTP Request failed with status: ${response.status}`);
      }
      return;
    }

    const data: BinanceP2PResponse = await response.json();
    
    if (data && data.success && data.data) {
      console.log('--- Top Zelle to USDT Rates on Binance P2P ---');
      
      data.data.forEach((adWrapper, index) => {
        const ad = adWrapper.adv;
        const merchant = adWrapper.advertiser;
        
        console.log(`${index + 1}. Price: ${ad.price} Zelle/USDT`);
        console.log(`   Limits: $${ad.minSingleTransAmount} - $${ad.maxSingleTransAmount}`);
        console.log(`   Merchant: ${merchant.nickName}`);
        console.log('-------------------------------------------');
      });
    } else {
      console.error('API structure mismatch or success flag is false:', data);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

// Execute the function
getZelleUsdtRates();
