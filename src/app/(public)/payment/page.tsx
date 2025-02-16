export default function PaymentPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Portal</h1>
          <p className="mt-2 text-gray-500">
            Complete your payment for the OCC Oasis Garden Experience.
          </p>
          <div className="mt-6">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://Oasis Payment Link.fellowshiponego.com/external/form/00f73a44-73a8-4877-bf83-1030a7ccd475"
                className="w-full h-[600px] border-0"
                title="Payment Portal"
                allow="payment"
              />
            </div>
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900">Payment Details</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>$2000 deposit due within 48 hours of application acceptance</li>
                <li>$1500 balance due by the specified deadline</li>
                <li>Total retreat cost: $3500</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                Please note that the deposit is non-refundable if cancelled less than 21 days
                prior to the event. For any questions about payment, please contact us at
                Oasis@visitonecc.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}