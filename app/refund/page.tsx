'use client';

import React from 'react';
import Link from 'next/link';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#FEFEFC] font-nunito text-black">
      {/* Header Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#0F9393] font-bold mb-12 hover:translate-x-[-4px] transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>
        <h1 className="text-[48px] md:text-[64px] font-bold font-georgia leading-tight tracking-tight mb-6">
          Refund Policy
        </h1>
        <p className="text-[18px] md:text-[20px] text-black/60 max-w-[800px] leading-relaxed">
          Clarity and transparency regarding our consultation payment and refund terms.
        </p>
      </section>

      {/* Content Section */}
      <section className="pb-40 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <div className="bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-2xl shadow-black/5 border border-black/5 flex flex-col gap-12">
          
          <div className="flex flex-col gap-6">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">General Policy</h2>
            <div className="flex flex-col gap-4 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                Thank you for choosing <strong>unHeard</strong>. Your trust in our professional services is vital to enabling us to serve our community and provide quality psychological care.
              </p>
              <p>
                Please read our <strong>Consultation Refund Policy</strong> carefully. By making a consultation payment to <strong>unHeard</strong>, you acknowledge and agree to the terms outlined below.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Non-Refundable Nature of Payments</h2>
            <div className="flex flex-col gap-4 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <div className="bg-red-50 p-6 rounded-[24px] border border-red-100 mb-4">
                 <p className="text-red-800 font-bold italic">
                   "Once money is credited to the unHeard account, it will not be refunded."
                 </p>
              </div>
              <p>
                All consultation payments made to <strong>unHeard</strong> are considered voluntary, irrevocable, and final. We do not offer refunds, whether full or partial, under any circumstances. 
              </p>
              <p>
                Payments are immediately allocated to support our therapeutic activities, professional resources, and the reservation of specialized time slots for our licensed mental health professionals.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Dispute Resolution</h2>
            <div className="flex flex-col gap-6 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                While consultation payments are non-refundable, we understand that errors can happen (e.g., technical glitches resulting in duplicate transactions). If you believe there has been an error in the transaction, please follow the procedure below:
              </p>
              <p className="bg-[#0F9393]/5 p-6 rounded-[24px] border border-[#0F9393]/10 font-bold text-black/80">
                Any disputes in payment need to be emailed to: <a href="mailto:info@unheard.co.in" className="text-[#0F9393] underline">info@unheard.co.in</a>
              </p>
              <div>
                <p className="font-bold mb-3 text-black">When contacting us, please include the following details:</p>
                <ul className="list-disc pl-6 flex flex-col gap-2">
                  <li>Your full name</li>
                  <li>Date and amount of the transaction</li>
                  <li>Transaction reference number/ID</li>
                  <li>Detailed reason for the dispute</li>
                </ul>
              </div>
              <p>
                <strong>unHeard</strong> will review such requests on a case-by-case basis at its sole discretion. Our decision regarding such disputes will be final.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Contact Us</h2>
            <div className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                For any questions or concerns regarding this policy, please contact us at <a href="mailto:info@unheard.co.in" className="text-[#0F9393] font-bold">info@unheard.co.in</a> or <a href="tel:+917012042618" className="text-[#0F9393] font-bold">+91 70120 42618</a>.
              </p>
              <p className="mt-8 font-bold text-black/40">Last Updated: May 2026</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-screen h-[40vh] bg-gradient-to-t from-[#0F9393]/5 to-transparent pointer-events-none z-[-1]" />
    </div>
  );
}
