import type { APIRoute } from 'astro';
import { contactSchema } from '../../../lib/lead';
import {body,checkOrigin,createLead,handle,HttpError,json,listLeads,rateLimit,requireStaff} from '../../../lib/server';
export const prerender=false;
export const POST:APIRoute=({request,clientAddress})=>handle(async()=>{
  checkOrigin(request);await rateLimit(clientAddress);const input=contactSchema.parse(await body(request));
  if(input.website)throw new HttpError(400,'Demande invalide.');
  const lead=await createLead(input);return json({id:lead.id},201);
});
export const GET:APIRoute=({request})=>handle(async()=>{await requireStaff(request);return json({leads:await listLeads()});});
