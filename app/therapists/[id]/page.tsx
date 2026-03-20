'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBooking } from '@/components/BookingContext';

// Mock data for the UI
const MOCK_THERAPIST = {
  id: '1',
  full_name: 'Ashaya Rathor',
  bio: "You're not alone. Many people struggle silently without realizing that what they're experiencing has a name — and more importantly, a solution.",
  image_url: '/assets/section_2_4.png', // Fallback to an existing asset
  qualification: 'Msc',
  qualification_desc: 'Msc in human life 2024 Pass Out batch',
  hours: '623+',
  rating: '4.3',
  keywords: ['Anxiety', 'Depression', 'Relationships', 'Trauma'],
  note: 'Evidence-based online therapy delivered by licensed clinicians — supporting you through anxiety, depression, stress, trauma, and relationship challenges. Start your personalized care journey today.',
  next_session: '19th Feb • 9:00 AM'
};

export default function TherapistProfile({ params }: { params: { id: string } }) {
  const { openBookingModal } = useBooking();
  const t = MOCK_THERAPIST;

  return (
    <div className="min-h-screen bg-white text-black font-nunito">
      
      {/* HEADER */}
      <header className="w-full flex justify-between items-center px-6 md:px-12 py-6 border-b border-gray-300">
        <div className="text-[28px] font-bold font-georgia tracking-tight">unHeard.</div>
        <Link href="/">
          <button className="bg-black text-white text-[14px] md:text-[16px] px-6 py-2 rounded-md font-semibold flex flex-row items-center gap-2 hover:bg-gray-800 transition-colors">
            Start Feeling Better 
            <span className="text-xl leading-none">&rarr;</span>
          </button>
        </Link>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-16">
        
        {/* HERO SECTION */}
        <section className="flex flex-col md:flex-row gap-8 lg:gap-16 items-center md:items-start pb-16 border-b border-gray-200">
          {/* Therapist Image */}
          <div className="w-full md:w-1/2 max-w-[500px] aspect-[4/3] relative rounded-lg overflow-hidden shrink-0">
            <Image 
              src={t.image_url} 
              alt={t.full_name} 
              fill 
              className="object-cover" 
            />
          </div>

          {/* Intro Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full pt-4 md:pt-10">
            <h1 className="text-[36px] md:text-[48px] font-bold font-georgia text-[#0F9393] mb-4">
              I'm {t.full_name}
            </h1>
            <p className="text-[18px] md:text-[20px] text-gray-700 font-semibold mb-8 leading-relaxed max-w-[500px]">
              {t.bio}
            </p>
            
            <div className="w-fit">
              <button 
                onClick={openBookingModal}
                className="bg-black border-2 border-black text-white px-6 py-3 rounded-lg text-[16px] font-bold flex flex-row items-center gap-3 hover:bg-gray-800 transition-colors group shadow-lg"
              >
                Book My Latest session 
                <span className="text-white bg-[#0F9393] rounded-full p-1 group-hover:scale-110 transition-transform">
                  &rarr;
                </span>
              </button>
              <p className="text-[12px] font-semibold text-gray-800 mt-3 pl-1">
                Next Available session • {t.next_session}
              </p>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="pb-16 border-b border-gray-200">
          <h2 className="text-[32px] md:text-[40px] font-bold font-georgia mb-10">
            <span className="text-[#0F9393]">About</span> {t.full_name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-sm p-8 flex flex-col items-center text-center relative shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#0F9393]"></div>
              <h3 className="text-[40px] md:text-[50px] font-black tracking-tight mb-2 leading-none">{t.qualification}</h3>
              <div className="w-full border-b border-gray-200 mb-6"></div>
              <p className="text-[14px] font-bold text-gray-800 mb-4">Qualification</p>
              <p className="text-[12px] text-gray-500 max-w-[200px]">{t.qualification_desc}</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white border border-gray-200 rounded-sm p-8 flex flex-col items-center text-center relative shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#0F9393]"></div>
              <h3 className="text-[40px] md:text-[50px] font-black tracking-tight mb-2 leading-none">{t.hours}</h3>
              <div className="w-full border-b border-gray-200 mb-6"></div>
              <p className="text-[14px] font-bold text-gray-800 mb-4">Hours of consultation on unheard</p>
              <p className="text-[12px] text-gray-500 max-w-[200px]">{t.qualification_desc}</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white border border-gray-200 rounded-sm p-8 flex flex-col items-center text-center relative shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#0F9393]"></div>
              <h3 className="text-[40px] md:text-[50px] font-black tracking-tight mb-2 leading-none">{t.rating}</h3>
              <div className="w-full border-b border-gray-200 mb-6"></div>
              <p className="text-[14px] font-bold text-gray-800 mb-4">User Ratings</p>
              <p className="text-[12px] text-gray-500 max-w-[200px]">{t.qualification_desc}</p>
            </div>
          </div>
        </section>

        {/* SPECIALTIES SECTION */}
        <section className="pb-16 border-b border-gray-200">
          <h2 className="text-[32px] md:text-[40px] font-bold font-georgia mb-8">
            What I deal the <span className="text-[#0F9393]">best</span>
          </h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {t.keywords.map((kw, i) => (
              <div key={i} className="bg-black text-white text-[14px] md:text-[16px] px-8 py-3 rounded-md font-semibold">
                {kw}
              </div>
            ))}
          </div>
          <p className="text-[12px] font-bold text-gray-800 mt-6">
            Add pricing thing if needed
          </p>
        </section>

        {/* NOTE FROM THERAPIST */}
        <section className="pb-24">
          <h2 className="text-[32px] md:text-[40px] font-bold font-georgia mb-6 text-black">
            Note from the Therapist
          </h2>
          <p className="text-[16px] md:text-[18px] text-black font-semibold max-w-[800px] leading-relaxed mb-10">
            {t.note}<br/><br/>{t.note}
          </p>
          
          <button 
            onClick={openBookingModal}
            className="bg-black border-2 border-black text-white px-6 py-3 rounded-lg text-[16px] font-bold flex flex-row items-center gap-3 hover:bg-gray-800 transition-colors group shadow-lg"
          >
            Book My Latest session 
            <span className="text-white bg-[#0F9393] rounded-full p-1 group-hover:scale-110 transition-transform">
              &rarr;
            </span>
          </button>
        </section>

      </main>
    </div>
  );
}
