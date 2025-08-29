"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { ArrowUpDown, Check, Copy } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"

import { CONTRACTS, ABIS, DECIMAL } from "../constant/constant" // adjust path

export default function LandingPage() {
  // --- Wallet & Contracts ---
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [address, setAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  const [buyContract, setBuyContract] = useState(null)
  const [usdtContract, setUsdtContract] = useState(null)
  const [chfContract, setChfContract] = useState(null)

  // --- Swap state ---
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromToken, setFromToken] = useState("USDT")
  const [toToken, setToToken] = useState("CHF.CH")
  const [exchangeRate, setExchangeRate] = useState(1)
  const [feePercent] = useState(0.2)
  const [copied, setCopied] = useState(false)

  // --- Balances ---
  const [balance, setBalance] = useState({ USDT: 0, "CHF.CH": 0 })

  // --- Connect wallet ---
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask")
    await window.ethereum.request({ method: "eth_requestAccounts" })

    const tempProvider = new ethers.BrowserProvider(window.ethereum)
    const tempSigner = await tempProvider.getSigner()
    const tempAddress = await tempSigner.getAddress()

    setProvider(tempProvider)
    setSigner(tempSigner)
    setAddress(tempAddress)
    setIsConnected(true)

    // Load contracts locally
    const buy = new ethers.Contract(CONTRACTS.chfBuyContract_ADDRESS, ABIS.chfBuyContract, tempSigner)
    const usdt = new ethers.Contract(CONTRACTS.USDT_ADDRESS, ABIS.USDT, tempSigner)
    const chf = new ethers.Contract(CONTRACTS.chfToken_ADDRESS, ABIS.chfToken, tempSigner)

    setBuyContract(buy)
    setUsdtContract(usdt)
    setChfContract(chf)

    await fetchBalances(tempAddress, usdt, chf)
    await fetchExchangeRate(buy)
  }

  const fetchBalances = async (userAddress, usdt, chf) => {
    const usdtBal = await usdt.balanceOf(userAddress)
    const chfBal = await chf.balanceOf(userAddress)
    setBalance({
      USDT: parseFloat(ethers.formatUnits(usdtBal, 18)),
      "CHF.CH": parseFloat(ethers.formatUnits(chfBal, 18)),
    })
  }

  const fetchExchangeRate = async (buy) => {
    const rate = await buy.usdtRateWei()
    setExchangeRate(parseFloat(ethers.formatUnits(rate, 18)))
  }

  // --- Swap logic ---
  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
    setExchangeRate(1 / exchangeRate)
  }

  useEffect(() => {
    if (!fromAmount) return setToAmount("")
    const amount = parseFloat(fromAmount)
    if (isNaN(amount)) return setToAmount("")
    const fee = (amount * feePercent) / 100
    const result = (amount - fee) * exchangeRate
    setToAmount(result.toFixed(6))
  }, [fromAmount, exchangeRate, feePercent])

  // --- Approve & Buy CHF using local contract references ---
  const handleExchange = async () => {
    if (!isConnected) return alert("Connect wallet first!")
    if (!usdtContract || !buyContract) return alert("Contracts not ready!")

    try {
      // Use local contract references
      const amt = ethers.parseUnits(fromAmount.toString(), 18)
      const approveTx = await usdtContract.approve(CONTRACTS.chfBuyContract_ADDRESS, amt)
      await approveTx.wait()
      const buyTx = await buyContract.buyWithUSDT(amt, amt) // minChfOut = amt for test
      await buyTx.wait()
      alert(`Bought ${fromAmount} CHF`)
      setFromAmount("")
      setToAmount("")
      await fetchBalances(address, usdtContract, chfContract)
    } catch (err) {
      console.error(err)
      alert("Transaction failed")
    }
  }

  const handleCopyReferral = () => {
    const referralLink = `https://chf.ch/exchange?ref=${address}`
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="container mx-auto px-2 py-2 sm:px-3 sm:py-3">
      {!isConnected && (
        <div className="text-center mb-4">
          <Button onClick={connectWallet}>Connect Wallet</Button>
        </div>
      )}

      {/* Swap Card */}
      <Card className="glass-card shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Instant Exchange
            <ArrowUpDown className="w-4 h-4 text-accent" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
              <Label className="text-card-foreground/90 text-sm font-medium">From</Label>
              <div className="flex items-center border-2 border-border rounded-xl p-2 sm:p-3 mt-2 focus-within:border-accent bg-input backdrop-blur-sm">
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-right text-card-foreground text-base sm:text-lg outline-none border-none placeholder-muted-foreground"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
                <select
                  className="ml-2 sm:ml-3 bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded-lg font-medium text-sm sm:text-base"
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                >
                  {/* <option value="BNB">BNB</option> */}
                  <option value="USDT">USDT</option>
                  {/* <option value="CHF.CH">CHF.CH</option> */}
                </select>
              </div>
              <div className="text-xs sm:text-sm text-card-foreground/70 mt-1">Balance: {balance[fromToken]?.toFixed(2) || 0} USDT </div>
          </div>

          <Button onClick={handleSwapTokens} variant="outline">
            <ArrowUpDown /> Swap
          </Button>

          <div>
              <Label className="text-card-foreground/90 text-sm font-medium">To</Label>
              <div className="flex items-center border-2 border-border rounded-xl p-2 sm:p-3 mt-2 bg-input backdrop-blur-sm">
                <input
                  type="text"
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-right text-card-foreground text-base sm:text-lg outline-none border-none placeholder-muted-foreground"
                  value={toAmount}
                  readOnly
                />
                <select
                  className="ml-2 sm:ml-3 bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded-lg font-medium text-sm sm:text-base"
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                >
                  {/* <option value="BNB">BNB</option> */}
                  {/* <option value="USDT">USDT</option> */}
                  <option value="CHF.CH">CHF.CH</option>
                </select>
              </div>
              <div className="text-xs sm:text-sm text-card-foreground/70 mt-1"> Balance: {balance[toToken]?.toFixed(2) || 0} CHF </div>
          </div>

          <Button
            onClick={handleExchange}
            disabled={!fromAmount || !isConnected || !usdtContract || !buyContract}
          >
            {isConnected ? "Exchange" : "Connect Wallet"}
          </Button>
        </CardContent>
      </Card>

      {/* Referral Card */}
      {/* {isConnected && (
        <Card className="mt-4 glass-card shadow-2xl">
          <CardContent>
            <div className="text-center">
              <h3>Share & Earn</h3>
              <div className="flex gap-2 justify-center mt-2">
                <div className="border p-2 rounded truncate w-64">
                  https://chf.ch/exchange?ref={address}
                </div>
                <Button onClick={handleCopyReferral}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}
    </main>
  )
}
