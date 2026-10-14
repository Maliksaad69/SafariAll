import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 lg:px-0">
        <article className="rounded-[18px] border border-[#d8d1c8] bg-white p-7 shadow-sm md:p-10">
          <div className="mb-4 inline-flex items-center rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
            Privacy policy
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>
            Your information is handled with care
          </h1>

          <div className="mt-7 space-y-5 text-sm leading-relaxed text-[#5a4e46]">
            <p>
              SafariRequest respects your privacy and handles personal information only for legitimate booking, service, and communication purposes. We use your data to help match you with suitable safari operators, answer inquiries, and improve the quality of the travel planning experience.
            </p>
            <p>
              We may use cookies to remember preferences, improve the site experience, and understand how visitors interact with our content. You can manage your consent settings at any time through the cookies popup or browser settings.
            </p>
            <p>
              We do not sell personal data to third parties for marketing purposes. Information is shared only with trusted operators and service providers required to process your booking inquiry or technical request.
            </p>
            <p>
              This policy may be updated from time to time to reflect changes in regulations or website functionality. Continued use of the site after updates indicates acceptance of the revised policy.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
