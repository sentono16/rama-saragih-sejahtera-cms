import {authClient} from '../../../../lib/supabase/server';
import {sameOrigin} from '../../../../lib/auth';
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:'Permintaan tidak valid.'},{status:403});try{await (await authClient()).auth.signOut();return Response.json({ok:true});}catch{return Response.json({error:'Keluar belum berhasil.'},{status:503});}}
