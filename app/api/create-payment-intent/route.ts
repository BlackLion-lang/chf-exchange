import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "eur" } = await request.json()

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount provided" }, { status: 400 })
    }

    if (amount < 1) {
      return NextResponse.json({ error: "Minimum purchase amount is €1" }, { status: 400 })
    }

    if (amount > 10000) {
      return NextResponse.json({ error: "Maximum purchase amount is €10,000" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        type: "chf_token_purchase",
        token_amount: amount.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)

    if (error instanceof Error) {
      if (error.message.includes("Invalid API Key")) {
        return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
      }
      if (error.message.includes("currency")) {
        return NextResponse.json({ error: "Currency not supported" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
