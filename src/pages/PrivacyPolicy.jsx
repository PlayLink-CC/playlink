import MainLayout from "../components/layout/MainLayout";

const PrivacyPolicy = () => (
  <MainLayout>
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="bg-linear-to-r from-green-50 to-white rounded-xl p-6 shadow-sm mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-gray-600">
          We respect your privacy — this page explains how we collect and use
          information.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Last updated: November 21, 2025
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="md:col-span-1 sticky top-24 self-start">
          <div className="hidden md:block bg-white border rounded-lg p-4 shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Contents
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#collected" className="text-green-600 hover:underline">
                  What we collect
                </a>
              </li>
              <li>
                <a href="#use" className="text-green-600 hover:underline">
                  How we use it
                </a>
              </li>
              <li>
                <a href="#payments" className="text-green-600 hover:underline">
                  Payments
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-green-600 hover:underline">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#sharing" className="text-green-600 hover:underline">
                  Sharing & Third Parties
                </a>
              </li>
              <li>
                <a href="#security" className="text-green-600 hover:underline">
                  Security
                </a>
              </li>
              <li>
                <a href="#rights" className="text-green-600 hover:underline">
                  Your Rights
                </a>
              </li>
            </ul>
          </div>
          <div className="md:hidden bg-white border rounded-lg p-3 shadow mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Contents
            </h3>
            <select
              onChange={(e) => {
                if (e.target.value) window.location.hash = e.target.value;
              }}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">Jump to...</option>
              <option value="#collected">What we collect</option>
              <option value="#use">How we use it</option>
              <option value="#payments">Payments</option>
              <option value="#cookies">Cookies</option>
              <option value="#sharing">Sharing & Third Parties</option>
              <option value="#security">Security</option>
              <option value="#rights">Your Rights</option>
            </select>
          </div>
        </nav>

        <main className="md:col-span-3">
          <article className="space-y-6">
            <section id="collected" className="prose max-w-none">
              <h2>Information We Collect</h2>
              <p>
                We collect information you provide (name, email, phone), booking
                details, and usage data to operate and improve our service.
              </p>
            </section>

            <details id="use" className="group border rounded-lg p-4" open>
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                How We Use Information
              </summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>
                  We use your data to process bookings, handle payments,
                  communicate with you about reservations, and improve PlayLink.
                </p>
                <p>
                  We never sell your personal data to third parties for
                  marketing purposes.
                </p>
              </div>
            </details>

            <details id="payments" className="group border rounded-lg p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                Payments
              </summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>
                  Payments are processed by Stripe. PlayLink does not store full
                  card numbers. For payment disputes or questions, contact
                  Stripe and our support.
                </p>
              </div>
            </details>

            <details id="cookies" className="group border rounded-lg p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                Cookies & Tracking
              </summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>
                  We use cookies and similar technologies to provide core
                  functionality and analytics. You can control cookies via your
                  browser settings.
                </p>
              </div>
            </details>

            <details id="sharing" className="group border rounded-lg p-4">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                Sharing & Third Parties
              </summary>
              <div className="mt-3 text-gray-700 space-y-2">
                <p>
                  We share information only with service providers necessary to
                  operate PlayLink (payment processors, email providers) and
                  when required by law.
                </p>
              </div>
            </details>

            <section id="security" className="prose max-w-none">
              <h2>Security</h2>
              <p>
                We use administrative, technical, and physical safeguards to
                protect personal data, but no method of transmission is
                completely secure. Please take care when sharing sensitive
                information.
              </p>
            </section>

            <section id="rights" className="prose max-w-none">
              <h2>Your Rights</h2>
              <p>
                You may access, correct, or request deletion of your personal
                data. To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@playlink.example">
                  privacy@playlink.example
                </a>
                .
              </p>
            </section>

            <section id="contact" className="prose max-w-none">
              <h2>Contact</h2>
              <p>
                Questions about this Privacy Policy can be sent to{" "}
                <a href="mailto:privacy@playlink.example">
                  privacy@playlink.example
                </a>
                .
              </p>
            </section>
          </article>
        </main>
      </div>
    </div>
  </MainLayout>
);

export default PrivacyPolicy;
