export default function DonationsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Support OCC Oasis</h1>
          <p className="mt-2 text-gray-500">
            Your generous donations help support the OCC Oasis Garden Experience and allow us to
            continue providing transformative retreats for couples.
          </p>
          <div className="mt-6">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://Oasis Payment Link.fellowshiponego.com/external/form/00f73a44-73a8-4877-bf83-1030a7ccd475"
                className="w-full h-[600px] border-0"
                title="Donations Portal"
                allow="payment"
              />
            </div>
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900">Your Impact</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your donation helps us:
              </p>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Maintain and improve our retreat facilities</li>
                <li>Provide resources and materials for couples</li>
                <li>Support couples in need through scholarships</li>
                <li>Enhance the retreat experience</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                All donations are tax-deductible. You will receive a receipt for your records
                via email after your donation is processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}