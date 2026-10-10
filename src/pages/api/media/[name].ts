import type {APIRoute} from 'astro';import {readFile} from 'node:fs/promises';import {demo} from '../../../lib/server';
export const prerender=false;
export const GET:APIRoute=async({params})=>{if(!demo||!params.name?.match(/^[a-f0-9-]+\.webp$/))return new Response(null,{status:404});try{const bytes=await readFile(`.local/media/${params.name}`);return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=3600'}});}catch{return new Response(null,{status:404});}};
