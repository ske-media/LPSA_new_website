import type {APIRoute} from 'astro';import {z} from 'zod';
import {checkOrigin,handle,json,requireStaff} from '../../../../lib/server';import {deleteDraft,listVersions} from '../../../../lib/blog-server';
export const prerender=false;
export const GET:APIRoute=({request,params})=>handle(async()=>{await requireStaff(request);return json({versions:await listVersions(z.uuid().parse(params.id))});});
export const DELETE:APIRoute=({request,params})=>handle(async()=>{checkOrigin(request);await requireStaff(request);await deleteDraft(z.uuid().parse(params.id));return json({deleted:true});});
