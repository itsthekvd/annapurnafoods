import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy - Annapurna Foods",
  description: "Our refund and cancellation policy for food delivery services near Isha Yoga Center Coimbatore.",
}

export default function RefundCancellationPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Refund & Cancellation Policy</h1>
      <div className="prose max-w-none">
        <p className="text-sm text-gray-500 mb-6">Last updated: Oct 02, 2024</p>

        <p>
          At Annapurna Food, we strive to provide the best service possible. We understand that sometimes plans change,
          so we've created this Refund & Cancellation Policy to address such situations.
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">1. Cancellations</h2>
        <h3 className="text-lg font-medium mb-2">Single Meal Orders</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Cancellations made at least 2 hours before the scheduled delivery time will receive a full refund.</li>
          <li>
            Cancellations made less than 2 hours before the scheduled delivery time are not eligible for a refund.
          </li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Subscription Plans</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            For daily, weekly, or monthly subscription plans, cancellations must be made at least 24 hours before the
            next scheduled delivery.
          </li>
          <li>Refunds will be processed for the remaining unused days of the subscription.</li>
        </ul>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">2. Refunds</h2>
        <h3 className="text-lg font-medium mb-2">Eligibility for Refunds</h3>
        <p>Refunds may be issued in the following cases:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Food quality issues (must be reported within 2 hours of delivery)</li>
          <li>Incorrect order fulfillment</li>
          <li>Significant delay in delivery (more than 1 hour from the promised time)</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Refund Process</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>Eligible refunds will be processed within 5-7 business days.</li>
          <li>Refunds will be made to the original payment method used for the order.</li>
        </ul>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">3. Modifications to Orders</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Modifications to single meal orders can be made up to 2 hours before the scheduled delivery time.</li>
          <li>
            For subscription plans, modifications for the next day's meal must be made before 8 PM the previous day.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">4. No-show Policy</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            If you are not available to receive your order at the specified delivery time and location, we will wait for
            a maximum of 15 minutes.
          </li>
          <li>After 15 minutes, the order will be marked as delivered, and no refund will be issued.</li>
        </ul>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">5. Special Circumstances</h2>
        <p>
          We understand that unforeseen circumstances may arise. In such cases, please contact our customer support
          team, and we will do our best to accommodate your needs.
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">6. Contact Us</h2>
        <p>
          For any questions or concerns regarding this Refund & Cancellation Policy, please contact our customer support
          team using the information provided on our Contact Us page.
        </p>

        <p className="mt-6">
          Annapurna Food reserves the right to modify this policy at any time. Any changes will be effective immediately
          upon posting on our website.
        </p>
      </div>
    </div>
  )
}
