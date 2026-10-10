import type {APIRoute} from 'astro';
import {z} from 'zod';
import {body,checkOrigin,handle,json,requireStaff} from '../../../../lib/server';
import {renderMarkdown} from '../../../../lib/blog-server';
export const prerender=false;
export const POST:APIRoute=({request})=>handle(async()=>{checkOrigin(request);await requireStaff(request);const {markdown}=z.object({markdown:z.string().max(40000)}).strict().parse(await body(request,100000));return json({html:renderMarkdown(markdown)});});
