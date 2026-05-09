'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FEFEFC] font-nunito text-black">
      {/* Header Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#0F9393] font-bold mb-12 hover:translate-x-[-4px] transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>
        <h1 className="text-[48px] md:text-[64px] font-bold font-georgia leading-tight tracking-tight mb-6">
          Privacy Policy
        </h1>
        <p className="text-[18px] md:text-[20px] text-black/60 max-w-[800px] leading-relaxed">
          At unHeard, your privacy is our priority. This policy outlines how we collect, protect, and handle your personal information.
        </p>
      </section>

      {/* Content Section */}
      <section className="pb-40 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <div className="bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-2xl shadow-black/5 border border-black/5 flex flex-col gap-12">
          
          <div className="flex flex-col gap-6">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Introduction and Organizational Info</h2>
            <div className="flex flex-col gap-4 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                We, at <strong>unHeard</strong>, are dedicated to serving our customers and contacts to the best of our abilities. Part of our commitment involves the responsible management of personal information collected through our website <Link href="https://www.unheard.co.in" className="text-[#0F9393] underline">www.unheard.co.in</Link>, and any related interactions. Our primary goals in processing this information include:
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>Enhancing the user experience on our platform by understanding customer needs and preferences.</li>
                <li>Providing timely support and responding to inquiries or service requests.</li>
                <li>Improving our products and services to meet the evolving demands of our users.</li>
                <li>Conducting necessary business operations, such as billing and account management.</li>
              </ul>
              <p>
                It is our policy to process personal information with the utmost respect for privacy and security. We adhere to all relevant regulations and guidelines to ensure that the data we handle is protected against unauthorized access, disclosure, alteration, and destruction. Our practices are designed to safeguard the confidentiality and integrity of your personal information, while enabling us to deliver the services you trust us with.
              </p>
              <p>
                We do not have a designated Data Protection Officer (DPO) but remain fully committed to addressing your privacy concerns. Should you have any questions or require further information about how we manage personal information, please feel free to contact us at <a href="mailto:info@unheard.co.in" className="text-[#0F9393] font-bold">info@unheard.co.in</a> or <a href="tel:+917012042618" className="text-[#0F9393] font-bold">+91 70120 42618</a>.
              </p>
              <p>
                Your privacy is our priority. We are committed to processing your personal information transparently and with your safety in mind. This commitment extends to our collaboration with third-party services that may process personal information on our behalf, such as in the case of sending invoices. Rest assured, all activities are conducted in strict compliance with applicable privacy laws.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Scope and Application</h2>
            <div className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                Our privacy policy is designed to protect the personal information of all our stakeholders, including website visitors, registered users, and customers. Whether you are just browsing our website <Link href="https://www.unheard.co.in" className="text-[#0F9393] underline">www.unheard.co.in</Link>, using our services as a registered user, or engaging with us as a valued customer, we ensure that your personal data is processed with the highest standards of privacy and security. This policy outlines our practices and your rights related to personal information.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Data Collection and Processing</h2>
            <div className="flex flex-col gap-6 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                Please note that we only process information that is essential for delivering our services or for enhancing user experience while complying with legal obligations.
              </p>
              <div>
                <p className="font-bold mb-3 text-black">The following list details the types of personal information we may process:</p>
                <ul className="list-disc pl-6 flex flex-col gap-2">
                  <li>First and last name</li>
                  <li>National identification numbers (e.g., social security number, passport ID)</li>
                  <li>Payment information (e.g., credit card number, bank details)</li>
                  <li>Payment method and history</li>
                  <li>IP-based approximate location</li>
                  <li>Operating system and version</li>
                  <li>Browser fingerprint</li>
                </ul>
              </div>
              <p>
                At <strong>unHeard</strong>, we believe in using personal information responsibly and ethically. The data we collect serves multiple purposes, all aimed at enhancing the services we offer and ensuring the highest level of satisfaction among our users, customers, and employees. Here are the key ways in which we use the personal information collected:
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>Authentication and security</li>
                <li>Communication efforts</li>
                <li>Payment processing</li>
                <li>Fraud prevention and risk management</li>
                <li>Customer support</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Data Storage and Protection</h2>
            <div className="flex flex-col gap-6 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <div>
                <h3 className="font-bold text-black mb-2">Data storage</h3>
                <p>
                  Personal information is stored in secure servers located in the following locations: <strong>IN, US</strong>. For services that require international data transfer, we ensure that such transfers comply with all applicable laws and maintain data protection standards equivalent to those in our primary location.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-black mb-2">Data hosting partners</h3>
                <p>
                  We partner with reputable data hosting providers committed to using state-of-the-art security measures. These partners are selected based on their adherence to stringent data protection standards.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-black mb-4">Data Protection Measures</h3>
                <ul className="list-disc pl-6 flex flex-col gap-3">
                  <li><strong>Encryption:</strong> To protect data during transfer and at rest, we employ robust encryption technologies.</li>
                  <li><strong>Access control:</strong> Access to personal information is strictly limited to authorized personnel who have a legitimate business need to access the data. We enforce strict access controls and regularly review permissions.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-black mb-2">Data Processing Agreements</h3>
                <p>
                  When we share your data with third-party service providers, we do so under the protection of Data Processing Agreements (DPAs) that ensure your information is managed in accordance with GDPR and other relevant data protection laws.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">User Rights and Choices</h2>
            <div className="flex flex-col gap-6 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                At <strong>unHeard</strong>, we recognize and respect your rights regarding your personal information, in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {[
                  { title: "Right of access (Art. 15)", desc: "Request access to your personal info and how we process it." },
                  { title: "Right to rectification (Art. 16)", desc: "Request correction of incorrect or incomplete data." },
                  { title: "Right to erasure (Art. 17)", desc: "The 'right to be forgotten' when data is no longer necessary." },
                  { title: "Right to restriction (Art. 18)", desc: "Request restriction of processing under certain conditions." },
                  { title: "Right to portability (Art. 20)", desc: "Receive your data in a structured, machine-readable format." },
                  { title: "Right to object (Art. 21)", desc: "Object to processing, including for direct marketing." },
                  { title: "Right to withdraw consent (Art. 7)", desc: "Withdraw your consent at any time for data processing." }
                ].map((right, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-[24px] border border-black/5 hover:bg-[#0F9393]/5 transition-colors group">
                    <h4 className="font-bold text-black mb-2 group-hover:text-[#0F9393] transition-colors">{right.title}</h4>
                    <p className="text-[14px] leading-relaxed">{right.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:info@unheard.co.in" className="text-[#0F9393] font-bold">info@unheard.co.in</a> or <a href="tel:+917012042618" className="text-[#0F9393] font-bold">+91 70120 42618</a>.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Cookies and Tracking</h2>
            <div className="flex flex-col gap-4 text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                We use cookies and similar technologies to enhance your experience, ensure security, and analyze website traffic.
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li><strong>Essential cookies:</strong> Necessary for functionality and security.</li>
                <li><strong>Performance cookies:</strong> Help us understand how visitors use our site.</li>
                <li><strong>Functional cookies:</strong> Remember your preferences and personalization.</li>
              </ul>
              <p>
                You can manage your cookie preferences through your browser settings or our on-site consent banner.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Direct Marketing</h2>
            <div className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                We may use your personal information to send you updates about our services. We will always obtain your explicit opt-in consent where required by law, and every communication will include a clear unsubscribe option.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-black/5 pt-12">
            <h2 className="text-[28px] md:text-[36px] font-bold font-georgia text-[#0F9393]">Policy Updates</h2>
            <div className="text-[16px] md:text-[18px] text-black/70 leading-relaxed">
              <p>
                We may update this privacy policy from time to time. Significant changes will be communicated via email or prominent website notifications. Your continued use of our services after any changes signifies your acceptance of the updated terms.
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
