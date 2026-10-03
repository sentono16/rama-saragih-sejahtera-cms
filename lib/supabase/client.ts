import {createBrowserClient} from '@supabase/ssr';
export function browserClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw Error('Konfigurasi Supabase belum tersedia.');return createBrowserClient(url,key);}
