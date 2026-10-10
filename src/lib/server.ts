import { createClient } from '@supabase/supabase-js';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import type { Contact, Details, Lead } from './lead';

export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export const demo = import.meta.env.DEV && import.meta.env.DEMO_MODE==='true';
const env=(name:string)=> import.meta.env[name] || process.env[name];
export const hasBlogDatabase=Boolean(env('SUPABASE_URL')&&env('SUPABASE_SECRET_KEY'));
export function db(){
  const url=env('SUPABASE_URL'),key=env('SUPABASE_SECRET_KEY');
  if(!url||!key)throw new HttpError(503,'La prise de demande est en cours de configuration. Contactez-nous au 07 87 89 67 60.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
type Stored=Lead & {resume_hash:string;resume_expires_at:string};
const publicLead=({resume_hash:_hash,resume_expires_at:_expiry,...lead}:Stored):Lead=>lead;
let queue:Promise<unknown>=Promise.resolve();
async function local<T>(fn:(leads:Stored[])=>T|Promise<T>,write=false):Promise<T>{
  const task=queue.then(async()=>{
    await mkdir('.local',{recursive:true});let leads:Stored[]=[];
    try{leads=JSON.parse(await readFile('.local/leads.json','utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    const value=await fn(leads);
    if(write){await writeFile('.local/leads.tmp',JSON.stringify(leads),'utf8');await rename('.local/leads.tmp','.local/leads.json');}
    return value;
  });queue=task.catch(()=>{});return task;
}
function verify(lead:Stored|undefined,token:string){
  if(!lead || new Date(lead.resume_expires_at).getTime()<Date.now() || !timingSafeEqual(Buffer.from(lead.resume_hash,'hex'),Buffer.from(hash(token),'hex')))
    throw new HttpError(404,'Cette demande ne peut pas être reprise avec ce lien.');
}
export async function createLead(input:Contact){
  const {token,website:_trap,...contact}=input;const now=new Date().toISOString();
  const lead:Stored={...contact,created_at:now,updated_at:now,status:'À compléter',details:null,resume_hash:hash(token),resume_expires_at:new Date(Date.now()+30*86400000).toISOString()};
  if(demo)return local(leads=>{const old=leads.find(x=>x.id===input.id);if(old){verify(old,token);return publicLead(old);}leads.push(lead);return publicLead(lead);},true);
  const client=db();const {error}=await client.from('leads').insert(lead);
  if(error?.code==='23505'){const {data,error:readError}=await client.from('leads').select('*').eq('id',lead.id).single();if(readError)throw new HttpError(500,'Impossible de retrouver la demande.');verify(data,token);return publicLead(data);}
  if(error)throw new HttpError(500,'La demande n’a pas été enregistrée. Vous pouvez réessayer.');return publicLead(lead);
}
export async function completeLead(id:string,token:string,details:Details){
  if(demo)return local(leads=>{const lead=leads.find(x=>x.id===id);verify(lead,token);lead!.details=details;if(lead!.status==='À compléter')lead!.status='Nouvelle demande';lead!.updated_at=new Date().toISOString();return publicLead(lead!);},true);
  const client=db();const {data,error}=await client.from('leads').select('*').eq('id',id).single();if(error)throw new HttpError(404,'Demande introuvable.');verify(data,token);
  const {error:updateError}=await client.from('leads').update({details,updated_at:new Date().toISOString(),...(data.status==='À compléter'?{status:'Nouvelle demande'}:{})}).eq('id',id);
  if(updateError)throw new HttpError(500,'Les précisions n’ont pas été enregistrées. Réessayez.');
}
export async function listLeads():Promise<Lead[]>{
  if(demo)return local(leads=>leads.map(publicLead).sort((a,b)=>b.created_at.localeCompare(a.created_at)));
  const {data,error}=await db().from('leads').select('id,need,name,email,phone,organization,created_at,updated_at,status,details').order('created_at',{ascending:false}).limit(200);
  if(error)throw new HttpError(500,'Impossible de charger les demandes.');return data;
}
export async function updateStatus(id:string,status:Lead['status']){
  if(demo)return local(leads=>{const lead=leads.find(x=>x.id===id);if(!lead)throw new HttpError(404,'Demande introuvable.');lead.status=status;lead.updated_at=new Date().toISOString();},true);
  const {data,error}=await db().from('leads').update({status,updated_at:new Date().toISOString()}).eq('id',id).select('id').single();
  if(error||!data)throw new HttpError(404,'Impossible de modifier cette demande.');
}
export async function requireStaff(request:Request){
  if(demo){if(!['127.0.0.1','localhost'].includes(new URL(request.url).hostname))throw new HttpError(403,'Mode local uniquement.');return;}
  const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)throw new HttpError(401,'Connectez-vous pour accéder aux demandes.');
  const client=db();const {data:{user},error}=await client.auth.getUser(token);if(error||!user)throw new HttpError(401,'Session expirée. Reconnectez-vous.');
  const {data,error:membershipError}=await client.from('staff_members').select('user_id').eq('user_id',user.id).maybeSingle();
  if(membershipError||!data)throw new HttpError(403,'Ce compte n’a pas accès aux demandes.');
}
export function checkOrigin(request:Request){
  if(!request.headers.get('content-type')?.includes('application/json'))throw new HttpError(415,'Format de demande incorrect.');
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new HttpError(403,'Origine de demande non autorisée.');
}
export async function body(request:Request,max=20_000){const text=await request.text();if(text.length>max)throw new HttpError(413,'Demande trop volumineuse.');try{return JSON.parse(text);}catch{throw new HttpError(400,'Demande invalide.');}}
const attempts=new Map<string,{count:number;end:number}>();
export async function rateLimit(ip:string){
  if(demo){const now=Date.now(),old=attempts.get(ip);if(!old||old.end<now)attempts.set(ip,{count:1,end:now+600000});else if(++old.count>20)throw new HttpError(429,'Trop de demandes. Réessayez dans quelques minutes.');return;}
  const secret=env('RATE_LIMIT_SECRET');if(!secret||secret.length<32)throw new HttpError(503,'Le formulaire est en cours de configuration.');
  const key=createHmac('sha256',secret).update(ip).digest('hex');const {data,error}=await db().rpc('consume_lead_limit',{identifier:key});
  if(error)throw new HttpError(503,'Le formulaire est temporairement indisponible.');if(!data)throw new HttpError(429,'Trop de demandes. Réessayez dans quelques minutes.');
}
export function json(value:unknown,status=200){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'}});}
export async function handle(fn:()=>Promise<Response>){try{return await fn();}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);if(e && typeof e==='object' && 'issues' in e)return json({error:'Vérifiez les informations saisies.'},400);console.error('LPSA request failed',e instanceof Error?e.name:'unknown');return json({error:'Une erreur est survenue. Réessayez ou appelez-nous.'},500);}}
