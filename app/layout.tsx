import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'http://localhost:3000')),title:{default:'PT Rama Saragih Sejahtera',template:'%s | PT Rama Saragih Sejahtera'},description:'Konstruksi, mekanikal, dan solusi industri. Biaya, Mutu, dan Waktu yang tepat.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>;}
