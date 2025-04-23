import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping Policy - Annapurna Foods",
  description: "Our shipping and delivery policy for food delivery services near Isha Yoga Center Coimbatore.",
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Shipping Policy</h1>
      <div className="prose max-w-none">
        <p className="text-sm text-gray-500 mb-6">Last updated: Oct 02, 2024</p>

        <p>
          This shipping policy explains how Annapurna Foods manages its delivery operations and strives to meet your
          expectations with every meal. Whether you're a first-time buyer or a returning customer, we want to ensure
          that your experience with us is smooth and satisfactory, right from placing your order to the moment it
          arrives at your doorstep.
        </p>

        <p>
          Please read this shipping policy together with our Terms and Conditions to familiarize yourself with the rest
          of our general guidelines.
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">Delivery Options</h2>
        <p>We understand that timely delivery of fresh, satvik meals is crucial.</p>

        <h3 className="text-lg font-medium mb-2">Free Delivery</h3>
        <p>
          We are pleased to offer free delivery for all orders within our delivery area, ensuring you receive your
          nourishing meal without any additional charges.
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">Delivery Locations</h2>
        <p>
          Currently, we provide delivery to areas within a 10 km radius of the Isha Yoga Centre. If you're unsure
          whether your location is covered, feel free to get in touch with us, and we will do our best to accommodate
          your request.
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">Shipping Methods</h2>
        <h3 className="text-lg font-medium mb-2">Standard Delivery:</h3>
        <p>
          Your meal will be freshly prepared and delivered within 30 to 60 minutes from the time of order confirmation.
        </p>

        <h3 className="text-lg font-medium mb-2">Scheduled Delivery:</h3>
        <p>
          You can schedule your order to arrive at a specific time, ensuring that your meal is delivered exactly when
          you need it.
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">Delayed Orders</h2>
        <p>
          While we strive to deliver your meal promptly, unexpected delays can occur due to factors such as traffic,
          weather conditions, or high demand. We are committed to keeping you informed of any such delays with real-time
          updates. Our goal is to provide clear and accurate information so you can plan your meals accordingly.
        </p>

        <p>Our customer service team is always available to assist you with any changes to your order.</p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">Cancellations & Refunds</h2>
        <p>
          We understand that plans can change. If you need to cancel or modify your order, please notify us within 15
          minutes of placing it. Once the preparation of your meal has begun, we may not be able to accommodate
          cancellations, but we will work with you to find the best solution.
        </p>

        <p>For more details, please refer to our Refund Policy.</p>

        <h2 className="text-xl font-semibold text-amber-800 mt-6 mb-3">Contact Information</h2>
        <p>
          If you have any questions or concerns regarding our shipping policy, we encourage you to reach out to us using
          the details below:
        </p>

        <ul className="list-disc pl-6 mb-4">
          <li>
            Contact Page:{" "}
            <a href="/contact" className="text-amber-700 hover:text-amber-800">
              https://annapurna.food/contact
            </a>
          </li>
          <li>Email: hello@annapurna.food</li>
        </ul>

        <p>This document was last updated on October 10, 2024.</p>
      </div>
    </div>
  )
}
