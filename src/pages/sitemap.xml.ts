import type {APIRoute} from 'astro';
import {listPosts} from '../lib/blog-server';
export const prerender=false;
export const GET:APIRoute=async()=>{
  try{const posts=await listPosts(true);const urls=['/','/blog/','/rse/','/entreprise-adaptee/oeth/','/prestations/lavage-gobelets/','/prestations/location-gobelets/','/prestations/location-vaisselle/',...posts.map(p=>`/blog/${p.slug}/`)];
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(p=>`<url><loc>https://laplongesadapte.com${p}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml','Cache-Control':'no-store'}});
  }catch{return new Response('Sitemap temporairement indisponible.',{status:503,headers:{'Cache-Control':'no-store'}});}
};
