import chfBuyContractABI from './chfBuyContract.json'
import chfTokenABI from './chfToken.json'
import USDTABI from './USDT.json'

// Contract addresses
export const CONTRACTS = {

  chfBuyContract_ADDRESS: '0xBDc404290a86c79159d213eB74bBe2001c7A21c7',
  chfToken_ADDRESS: '0x112A2b59Dd2e16a1C391ADf4B913cEf319f3B609',
  USDT_ADDRESS: '0xA2A43754C449a6F12d1811497e8f8De8fF761dC5'
};

// Contract ABIs
export const ABIS = {
  chfBuyContract: chfBuyContractABI,
  chfToken: chfTokenABI,
  USDT: USDTABI
};

export const DECIMAL = 10 ** 18;
