"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { CONTRACTS, ABIS, DECIMAL } from "../constant/constant"
import { Button } from "./ui/button"
import { formatUnits, parseUnits } from "viem"

export default function LandingPage() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const [mode, setMode] = useState("buy") // "buy" or "sell"
  const [balanceUSDT, setBalanceUSDT] = useState("0")
  const [balanceCHF, setBalanceCHF] = useState("0")
  const slippagePercent = 1 // 1% slippage

  // --- Read balances ---
  const { data: usdtBalance } = useReadContract({
    address: CONTRACTS.USDT_ADDRESS,
    abi: ABIS.USDT,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    watch: true,
    query: { enabled: !!address },
  })

  const { data: chfBalance } = useReadContract({
    address: CONTRACTS.chfToken_ADDRESS,
    abi: ABIS.chfToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    watch: true,
    query: { enabled: !!address },
  })

  useEffect(() => {
    if (usdtBalance) setBalanceUSDT(formatUnits(usdtBalance, 18))
    if (chfBalance) setBalanceCHF(formatUnits(chfBalance, 18))
  }, [usdtBalance, chfBalance])

  // --- Write contract ---
  const { writeContract: write } = useWriteContract()

  // --- Calculate minOut for slippage ---
  const calculateMinOut = (amt) => {
    const num = parseFloat(amt)
    const minOut = num * (1 - slippagePercent / 100)
    return minOut.toString()
  }

  // --- Approve & Buy ---
  const handleApproveBuy = async () => {
    if (!amount) return
    await write({
      address: CONTRACTS.USDT_ADDRESS,
      abi: ABIS.USDT,
      functionName: "approve",
      args: [CONTRACTS.chfBuyContract_ADDRESS, parseUnits(amount, 18)],
    })
  }

  const handleBuy = async () => {
    await write({
      address: CONTRACTS.chfBuyContract_ADDRESS,
      abi: ABIS.chfBuyContract,
      functionName: "buy",
      args: [parseUnits(amount, 18)], // only 1 argument
    })
  }

  // --- Approve & Sell ---
  const handleApproveSell = async () => {
    if (!amount) return
    await write({
      address: CONTRACTS.chfToken_ADDRESS,
      abi: ABIS.chfToken,
      functionName: "approve",
      args: [CONTRACTS.chfBuyContract_ADDRESS, parseUnits(amount, 18)],
    })
  }

  const handleSell = async () => {
    await write({
      address: CONTRACTS.chfBuyContract_ADDRESS,
      abi: ABIS.chfBuyContract,
      functionName: "sell",
      args: [parseUnits(amount, 18)], // CHFCH amount
    })
  }

  return (
    <div className="max-w-screen-lg mx-auto bg-black/40 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="text-center mb-3 sm:mb-4 hero-gradient rounded-2xl sm:rounded-3xl p-3 sm:p-4 glass-card">
        <div className="flex flex-col sm:flex-row justify-center items-center mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 shadow-2xl shadow-primary/25">
            <img src="/chf-logo.png" alt="CHF.CH Logo" className="w-8 h-8 sm:w-12 sm:h-12 rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2 text-balance">
              CHF.CH Exchange
            </h1>
            <p className="text-sm sm:text-lg text-foreground/90">Swiss Franc Stablecoin Trading Platform</p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-foreground/80 mb-4 sm:mb-6 max-w-2xl mx-auto text-pretty">
          Trade CHF.CH with BNB USDT. Backed by Swiss precision, stability, and regulatory compliance.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:gap-3 max-w-sm sm:max-w-md mx-auto">
          <div className="text-center bg-card/90 backdrop-blur-md border border-border p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl">
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">Total Volume</div>
            <p className="text-card-foreground/80 text-xs sm:text-sm">{balanceCHF} CHF</p>
          </div>
          {/* <div className="text-center bg-card/90 backdrop-blur-md border border-border p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl">
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">totalUsers</div>
            <p className="text-card-foreground/80 text-xs sm:text-sm">Active Users</p>
          </div> */}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Instant Exchange</h2>

      <div className="flex justify-center mb-6">
        <Button
          onClick={() => setMode("buy")}
          className={`w-1/2 rounded-r-xl ${mode === "buy" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          Buy CHF with USDT
        </Button>
        <Button
          onClick={() => setMode("buyWithEuro")}
          className={`w-1/2 rounded-r-xl ${mode === "buyWithEuro" ? "bg-green-600" : "bg-gray-700"}`}
        >
          Buy CHF with EURO
        </Button>
        <Button
          onClick={() => setMode("sell")}
          className={`w-1/2 rounded-r-xl ${mode === "sell" ? "bg-red-600" : "bg-gray-700"}`}
        >
          Sell CHF
        </Button>
      </div>

      <div>
        <label className="text-sm text-gray-300">
          From (
          {mode === "buy"
            ? "USDT"
            : mode === "buyWithEuro"
              ? "EURO"
              : "CHF"}
          )
        </label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800 text-white mt-1"
        />
        <p className="text-xs text-gray-400 mt-1">
          Balance:{" "}
          {mode === "buy"
            ? balanceUSDT
            : mode === "buyWithEuro"
              ? balanceUSDT
              : balanceCHF}{" "}
          {mode === "buy"
            ? "USDT"
            : mode === "buyWithEuro"
              ? "EURO"
              : "CHF"}
        </p>
      </div>

      <div>
        <label className="text-sm text-gray-300">
          To ({mode === "sell" ? "USDT" : "CHF"})
        </label>
        <input
          type="text"
          disabled
          value={amount}
          className="w-full p-3 rounded-lg bg-gray-800 text-gray-400 mt-1"
        />
        <p className="text-xs text-gray-400 mt-1">
          Balance:{" "}
          {mode === "sell"
            ? balanceUSDT
            : balanceCHF}{" "}
          {mode === "sell" ? "USDT" : "CHF"}
        </p>
      </div>

      {isConnected ? (
        <div className="flex gap-3">
          {mode === "buy" && (
            <>
              <Button onClick={handleApproveBuy} className="w-1/2 bg-blue-600 hover:bg-blue-500">
                Approve USDT
              </Button>
              <Button onClick={handleBuy} className="w-1/2 bg-blue-600 hover:bg-blue-500">
                Buy CHF
              </Button>
            </>
          )}
          {mode === "buyWithEuro" && (
            <>
              <Button onClick={handleApproveBuy} className="w-1/2 bg-green-600 hover:bg-green-500">
                Approve EURO
              </Button>
              <Button onClick={handleBuy} className="w-1/2 bg-green-600 hover:bg-green-500">
                Buy CHF
              </Button>
            </>
          )}
          {mode === "sell" && (
            <>
              <Button onClick={handleApproveSell} className="w-1/2 bg-red-600 hover:bg-red-500">
                Approve CHF
              </Button>
              <Button onClick={handleSell} className="w-1/2 bg-red-600 hover:bg-red-500">
                Sell CHF
              </Button>
            </>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-400">Please connect wallet above</p>
      )}
    </div>
  )
}
