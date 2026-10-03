import {adminClient} from './supabase/admin';
import {defaults,type Content} from './content';
export async function readContent():Promise<{data:Content;version:number}>{const {data,error}=await adminClient().from('rama_site_content').select('value,version').eq('key','main').maybeSingle();if(error)throw error;return data?{data:data.value as Content,version:data.version}:{data:defaults,version:0};}
export async function publicContent(){try{const result=await readContent();return {data:{...result.data,entries:result.data.entries.filter(e=>e.published)},version:result.version,unavailable:false};}catch(e){console.error('Content unavailable',e);return {data:defaults,version:0,unavailable:true};}}
export async function saveContent(data:Content,version:number){const {data:saved,error}=await adminClient().rpc('save_rama_content',{p_value:data,p_expected_version:version});if(error)throw error;return saved as number|null;}
export async function readMessages(){const {data,error}=await adminClient().from('rama_contact_messages').select('*').order('created_at',{ascending:false}).limit(200);if(error)throw error;return data;}
