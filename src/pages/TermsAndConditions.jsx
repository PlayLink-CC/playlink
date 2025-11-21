import MainLayout from '../components/layout/MainLayout';

const TermsAndConditions = () => (
  <MainLayout>
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="bg-linear-to-r from-green-50 to-white rounded-xl p-6 shadow-sm mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
        <p className="mt-2 text-gray-600">Please read these terms carefully before using PlayLink’s court booking services.</p>
        <p className="mt-3 text-sm text-gray-500">Last updated: November 21, 2025</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Table of contents */}
        <nav className="md:col-span-1 sticky top-24 self-start">
          <div className="hidden md:block bg-white border rounded-lg p-4 shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contents</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#acceptance" className="text-green-600 hover:underline">Acceptance</a></li>
              <li><a href="#eligibility" className="text-green-600 hover:underline">Eligibility</a></li>
              <li><a href="#bookings" className="text-green-600 hover:underline">Bookings & Payments</a></li>
              <li><a href="#cancellation" className="text-green-600 hover:underline">Cancellation & Refunds</a></li>
              <li><a href="#conduct" className="text-green-600 hover:underline">User Conduct</a></li>
              <li><a href="#liability" className="text-green-600 hover:underline">Liability</a></li>
              <li><a href="#changes" className="text-green-600 hover:underline">Changes to Terms</a></li>
              <li><a href="#contact" className="text-green-600 hover:underline">Contact</a></li>
            </ul>
          </div>
          {/* Mobile TOC */}
          <div className="md:hidden bg-white border rounded-lg p-3 shadow mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Contents</h3>
            <select onChange={(e) => { if (e.target.value) window.location.hash = e.target.value; }} className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Jump to...</option>
              <option value="#acceptance">Acceptance</option>
              <option value="#eligibility">Eligibility</option>
              <option value="#bookings">Bookings & Payments</option>
              <option value="#cancellation">Cancellation & Refunds</option>
              <option value="#conduct">User Conduct</option>
              <option value="#liability">Liability</option>
              <option value="#changes">Changes to Terms</option>
              <option value="#contact">Contact</option>
            </select>
          </div>
        </nav>

        {/* Content */}
        <main className="md:col-span-3">
          <article className="space-y-6">
            <section id="acceptance" className="prose max-w-none">
              <h2>Acceptance</h2>
              <p>By accessing or using PlayLink, you agree to these Terms & Conditions. If you do not agree, please do not use the service.</p>
            </section>

            <section id="eligibility" className="prose max-w-none">
              <h2>Eligibility</h2>
              <p>Users must be 18 years or older, or have parental/guardian consent to use PlayLink's services. You agree to provide accurate information during registration.</p>
            </section>

            <details id="bookings" className="group border rounded-lg p-4" open>
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">Bookings & Payments</summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>All bookings are subject to availability. When you make a booking, you agree to provide current and accurate information. Prices and availability displayed are provided by the venues.</p>
                <p>Payments are processed securely via Stripe. We do not store your full card details; Stripe handles payment authorization and storage. By making a booking you authorize us to charge the payment method provided.</p>
              </div>
            </details>

            <details id="cancellation" className="group border rounded-lg p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">Cancellation & Refunds</summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>Cancellations should be made within the timeframe shown when booking. Unless otherwise stated, cancellations made less than 24 hours before the booking may not be eligible for a refund.</p>
                <p>Any refunds will be handled in accordance with the venue policy and payment processor rules.</p>
              </div>
            </details>

            <details id="conduct" className="group border rounded-lg p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">User Conduct</summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>You are expected to follow venue rules and behave respectfully. PlayLink reserves the right to suspend or terminate accounts for misconduct.</p>
              </div>
            </details>

            <details id="liability" className="group border rounded-lg p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">Liability</summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>PlayLink provides a platform to connect users with venues. We are not responsible for injuries, losses, or damages that occur at venues. Use of venues is at your own risk.</p>
              </div>
            </details>

            <section id="changes" className="prose max-w-none">
              <h2>Changes to Terms</h2>
              <p>We may update these terms occasionally. When we do, we will post the revised terms here with a new effective date. Continued use after changes indicates acceptance.</p>
            </section>

            <section id="contact" className="prose max-w-none">
              <h2>Contact</h2>
              <p>If you have questions about these Terms & Conditions, contact us at <a href="mailto:support@playlink.example">support@playlink.example</a>.</p>
            </section>
          </article>
        </main>
      </div>
    </div>
  </MainLayout>
);

export default TermsAndConditions;
