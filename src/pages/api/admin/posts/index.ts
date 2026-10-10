import type {APIRoute} from 'astro';
import {body,checkOrigin,handle,json,requireStaff} from '../../../../lib/server';
import {listPosts,savePost} from '../../../../lib/blog-server';
export const prerender=false;
export const GET:APIRoute=({request})=>handle(async()=>{await requireStaff(request);return json({posts:await listPosts()});});
export const POST:APIRoute=({request})=>handle(async()=>{checkOrigin(request);await requireStaff(request);return json({post:await savePost(await body(request,100000))});});
