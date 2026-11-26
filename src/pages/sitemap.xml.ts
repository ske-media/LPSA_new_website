import type {APIRoute} from 'astro';
import {listPosts} from '../lib/blog-server';
import {personas} from '../data/personas';
import {editorialPostsEn} from '../lib/editorial-en';
import {categories,catByName} from '../lib/blog-structure';
export const prerender=false;
const SITE='https://laplongesadapte.com';
export const GET:APIRoute=async()=>{
  try{
    const posts=await listPosts(true);
    const built=import.meta.env.BUILD_DATE||new Date().toISOString().slice(0,10);
    const enSlugs=new Set(editorialPostsEn.map(p=>p.slug));
    const enCats=new Set(editorialPostsEn.map(p=>catByName(p.category).slug));
    // [French path, English path or null, last modification]
    const pages:[string,string|null,string][]=[
      ...['/','/prestations/location-vaisselle/','/prestations/lavage-gobelets/','/prestations/location-gobelets/',...personas.map(p=>`/pour/${p.slug}/`),'/rse/','/entreprise-adaptee/oeth/','/blog/'].map(u=>[u,`/en${u}`,built] as [string,string,string]),
      ...categories.filter(c=>posts.some(p=>catByName(p.category).slug===c.slug)).map(c=>[`/blog/categorie/${c.slug}/`,enCats.has(c.slug)?`/en/blog/categorie/${c.slug}/`:null,built] as [string,string|null,string]),
      ...posts.map(p=>[`/blog/${p.slug}/`,enSlugs.has(p.slug)?`/en/blog/${p.slug}/`:null,(p.updated_at||p.published_at||built).slice(0,10)] as [string,string|null,string]),
    ];
    const alt=(fr:string,en:string)=>`<xhtml:link rel="alternate" hreflang="fr" href="${SITE}${fr}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${fr}"/>`;
    const urls=pages.flatMap(([fr,en,d])=>en?[`<url><loc>${SITE}${fr}</loc><lastmod>${d}</lastmod>${alt(fr,en)}</url>`,`<url><loc>${SITE}${en}</loc><lastmod>${d}</lastmod>${alt(fr,en)}</url>`]:[`<url><loc>${SITE}${fr}</loc><lastmod>${d}</lastmod></url>`]);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`,{headers:{'Content-Type':'application/xml','Cache-Control':'public, max-age=0, s-maxage=3600'}});
  }catch{return new Response('Sitemap temporairement indisponible.',{status:503,headers:{'Cache-Control':'no-store'}});}
};
