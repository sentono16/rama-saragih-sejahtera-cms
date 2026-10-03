import {redirect} from 'next/navigation';
import {isAdmin} from '../../lib/auth';
import Admin from './editor';
export const dynamic='force-dynamic';
export const metadata={title:'Admin CMS',robots:{index:false,follow:false}};
export default async function AdminPage(){if(!await isAdmin())redirect('/admin/login');return <Admin/>;}
