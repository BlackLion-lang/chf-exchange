import chfBuyContractABI from './chfBuyContract.json'
import chfTokenABI from './chfToken.json'
import USDTABI from './USDT.json'

// Contract addresses
export const CONTRACTS = {

  chfBuyContract_ADDRESS: '0xdd12699eb357ae465af96ac65a69a88e31758727',
  chfToken_ADDRESS: '0x0ea39e4e5307c89d31b95021705fdd143df79c88',
  USDT_ADDRESS: '0x941a152505b7d6e70abf0bb742b14e61ac2f894c'
};

// Contract ABIs
export const ABIS = {
  chfBuyContract: chfBuyContractABI,
  chfToken: chfTokenABI,
  USDT: USDTABI
};

export const DECIMAL = 10 ** 18;
