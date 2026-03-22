import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-12 w-full relative z-40 border-t border-[#333]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col">
          <Link href="/">
            <img 
              src="/assets/logo unherd white.svg" 
              alt="unHeard Logo" 
              className="h-[35px] w-auto mb-4 hover:opacity-80 transition-opacity"
            />
          </Link>
          <p className="text-gray-400 font-nunito max-w-[400px]">Providing confidential, evidence-based online therapy to help you discover, reflect, and grow.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 font-nunito text-[16px]">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Company</h4>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            <Link href="/therapists" className="text-gray-400 hover:text-white transition-colors">Our Therapists</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-2">Legal</h4>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="mt-16 text-center text-gray-600 text-[14px] border-t border-[#333] pt-6 w-full max-w-[1400px] mx-auto">
         © {new Date().getFullYear()} Unheard. All rights reserved.
      </div>
    </footer>
  );
}
