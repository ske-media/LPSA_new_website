import type { APIRoute } from 'astro';
import {z} from 'zod';
import {detailsSchema} from '../../../lib/lead';
import {body,checkOrigin,completeLead,handle,json,rateLimit} from '../../../lib/server';
export const prerender=false;
export const PATCH:APIRoute=({request,params,clientAddress})=>handle(async()=>{
  checkOrigin(request);await rateLimit(clientAddress);const id=z.uuid().parse(params.id);
  const {token,...details}=detailsSchema.parse(await body(request));await completeLead(id,token,details);return json({saved:true});
});
