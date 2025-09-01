"use client"

import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface PaymentSuccessProps {
  tokenAmount: string
  onContinue: () => void
}

export default function PaymentSuccess({ tokenAmount, onContinue }: PaymentSuccessProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-green-400">Payment Successful!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-foreground/80">Your payment has been processed successfully.</p>
        <div className="bg-card/50 p-4 rounded-lg">
          <p className="text-sm text-foreground/70 mb-1">CHF Tokens Purchased:</p>
          <p className="text-2xl font-bold text-green-400">{tokenAmount} CHF</p>
        </div>
        <p className="text-sm text-foreground/60">Your CHF tokens will be sent to your connected wallet shortly.</p>
        <Button onClick={onContinue} className="w-full">
          Continue Trading
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
