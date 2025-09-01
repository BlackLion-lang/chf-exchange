import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded") {
      // 1. Send CHF tokens to user's wallet
      // 2. Record transaction in database
      // 3. Send confirmation email

      const tokenAmount = paymentIntent.metadata.token_amount

      console.log(`[v0] Payment successful: ${paymentIntentId}, Amount: ${tokenAmount} CHF`)

      return NextResponse.json({
        success: true,
        tokenAmount,
        transactionId: paymentIntentId,
        message: "Payment successful! CHF tokens will be sent to your wallet.",
      })
    }

    if (paymentIntent.status === "requires_payment_method") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method was declined. Please try a different card.",
        },
        { status: 400 },
      )
    }

    if (paymentIntent.status === "canceled") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment was canceled.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: `Payment status: ${paymentIntent.status}. Please try again.`,
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Error confirming payment:", error)

    if (error instanceof Error) {
      if (error.message.includes("No such payment_intent")) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }
      if (error.message.includes("Invalid API Key")) {
        return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
      }
    }

    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
