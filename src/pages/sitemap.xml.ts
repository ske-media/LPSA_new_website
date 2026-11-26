import type {APIRoute} from 'astro';
import {listPosts} from '../lib/blog-server';
import {personas} from '../data/personas';
export const prerender=false;
export const GET:APIRoute=async()=>{
  try{const posts=await listPosts(true);
    // Static pages carry the build date; articles their own last update.
    const built=import.meta.env.BUILD_DATE||new Date().toISOString().slice(0,10);
    const urls:[string,string][]=[...['/','/prestations/location-vaisselle/','/prestations/lavage-gobelets/','/prestations/location-gobelets/',...personas.map(p=>`/pour/${p.slug}/`),'/rse/','/entreprise-adaptee/oeth/','/blog/'].map(u=>[u,built] as [string,string]),...posts.map(p=>[`/blog/${p.slug}/`,(p.updated_at||p.published_at||built).slice(0,10)] as [string,string])];
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(([p,d])=>`<url><loc>https://laplongesadapte.com${p}</loc><lastmod>${d}</lastmod></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml','Cache-Control':'no-store'}});
  }catch{return new Response('Sitemap temporairement indisponible.',{status:503,headers:{'Cache-Control':'no-store'}});}
};
