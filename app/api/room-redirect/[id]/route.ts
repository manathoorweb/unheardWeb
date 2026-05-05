import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userAgent = req.headers.get('user-agent') || '';
  const isAndroid = /Android/i.test(userAgent);
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in';
  const urlParams = new URL(req.url).searchParams;
  const userType = urlParams.get('type') || 'patient';
  
  const targetUrl = `${baseUrl}/room/${id}?type=${userType}`;

  // Android: Force Chrome via Intent to bypass PWA/Play Store hijacking
  if (isAndroid) {
    const intentUrl = `intent://${targetUrl.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;end`;
    return NextResponse.redirect(intentUrl);
  }

  // Standard redirect for other platforms (iOS/Desktop)
  // Note: iOS Chrome forcing (googlechromes://) is optional but can be unreliable if Chrome isn't installed.
  // Standard Safari usually handles camera/mic perfectly.
  return NextResponse.redirect(targetUrl);
}
