import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'unHeard',
    short_name: 'unHeard',
    description: 'Professional psychological counseling and therapist portal.',
    start_url: '/login',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#0F9393',
    icons: [
      {
        src: '/assets/logo unherd white.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/assets/logo unherd white.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/assets/logo unherd white.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
