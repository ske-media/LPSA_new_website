import type {APIRoute} from 'astro';
import {z} from 'zod';
import {statusSchema} from '../../../../lib/lead';
import {body,checkOrigin,handle,json,requireStaff,updateStatus} from '../../../../lib/server';
export const prerender=false;
export const PATCH:APIRoute=({request,params})=>handle(async()=>{checkOrigin(request);await requireStaff(request);const id=z.uuid().parse(params.id);const {status}=statusSchema.parse(await body(request));await updateStatus(id,status);return json({saved:true});});
