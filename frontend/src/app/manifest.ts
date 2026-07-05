import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XyloNet - Stablecoin SuperExchange',
    short_name: 'XyloNet',
    description: 'The premier DEX + Bridge on Arc Network. Swap, Bridge, and Earn with USDC, EURC.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#01C38E',
    icons: [
      {
        src: '/branding/xylonet-mint.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
