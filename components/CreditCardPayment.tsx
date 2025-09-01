"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Loader2, CreditCard, Shield, AlertCircle } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: string
  onSuccess: (tokenAmount: string) => void
  onError: (error: string) => void
}

function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !amount) {
      return
    }

    setIsProcessing(true)
    setCardError("")

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        onError("Card information is required")
        return
      }

      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          currency: "eur",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        onError(data.error || "Failed to create payment")
        return
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        console.error("[v0] Payment error:", error)
        onError(error.message || "Payment failed")
      } else if (paymentIntent?.status === "succeeded") {
        // Confirm with backend
        const confirmResponse = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        })

        const result = await confirmResponse.json()
        if (result.success) {
          console.log("[v0] Payment confirmed successfully")
          onSuccess(result.tokenAmount)
        } else {
          onError(result.message || "Payment confirmation failed")
        }
      }
    } catch (err) {
      console.error("[v0] Payment processing error:", err)
      onError("Payment processing failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message)
    } else {
      setCardError("")
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#ffffff",
        "::placeholder": {
          color: "#9ca3af",
        },
        backgroundColor: "transparent",
      },
      invalid: {
        color: "#ef4444",
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            {/* <p className="text-card-foreground/80 text-xs sm:text-sm">{balanceCHF} CHF</p> */}
          </div>
          {/* <div className="text-center bg-card/90 backdrop-blur-md border border-border p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl">
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">totalUsers</div>
            <p className="text-card-foreground/80 text-xs sm:text-sm">Active Users</p>
          </div> */}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <Shield className="w-4 h-4" />
          <span>Secured by Stripe</span>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <CardElement options={cardElementOptions} onChange={handleCardChange} />
        </div>

        {cardError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{cardError}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">You pay:</span>
          <span className="font-semibold">€{amount}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/70">You receive:</span>
          <span className="font-semibold">{amount} CHF</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !amount || !!cardError}
        className="w-full bg-green-600 hover:bg-green-500 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay €{amount}
          </>
        )}
      </Button>
    </form>
  )
}

interface CreditCardPaymentProps {
  amount: string
  onSuccess: (tokenAmount: string) => void
  onError: (error: string) => void
}

export default function CreditCardPayment({ amount, onSuccess, onError }: CreditCardPaymentProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Credit Card Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <PaymentForm amount={amount} onSuccess={onSuccess} onError={onError} />
        </Elements>
      </CardContent>
    </Card>
  )
}
