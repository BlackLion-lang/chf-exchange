"use client"

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface PaymentErrorProps {
  error: string
  onRetry: () => void
  onBack: () => void
}

export default function PaymentError({ error, onRetry, onBack }: PaymentErrorProps) {
  const getErrorMessage = (error: string) => {
    if (error.includes("card_declined") || error.includes("declined")) {
      return {
        title: "Card Declined",
        message: "Your card was declined. Please check your card details or try a different payment method.",
        canRetry: true,
      }
    }

    if (error.includes("insufficient_funds")) {
      return {
        title: "Insufficient Funds",
        message: "Your card has insufficient funds for this transaction.",
        canRetry: false,
      }
    }

    if (error.includes("expired_card")) {
      return {
        title: "Card Expired",
        message: "Your card has expired. Please use a different payment method.",
        canRetry: false,
      }
    }

    if (error.includes("incorrect_cvc")) {
      return {
        title: "Incorrect CVC",
        message: "The CVC code you entered is incorrect. Please check and try again.",
        canRetry: true,
      }
    }

    if (error.includes("processing_error")) {
      return {
        title: "Processing Error",
        message: "There was an error processing your payment. Please try again.",
        canRetry: true,
      }
    }

    return {
      title: "Payment Failed",
      message: error || "An unexpected error occurred. Please try again.",
      canRetry: true,
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-red-400">{errorInfo.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-foreground/80">{errorInfo.message}</p>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to Exchange
          </Button>

          {errorInfo.canRetry && (
            <Button onClick={onRetry} className="bg-green-600 hover:bg-green-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>

        <div className="text-xs text-foreground/60 mt-4">
          <p>Need help? Contact our support team.</p>
        </div>
      </CardContent>
    </Card>
  )
}
