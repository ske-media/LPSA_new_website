// Sets publication dates for the editorial batches and writes the matching Supabase seed.
// usage: node scripts/schedule-blog-batches.mjs [start ISO date] [articles published at once]
// - the first N articles are published on the start date, the rest go out three a week
//   (Monday, Wednesday, Friday at 07:00 UTC), alternating topics so every week stays varied;
// - the site shows a scheduled article automatically once its date has passed (server-rendered blog).
import fs from 'node:fs';
import path from 'node:path';

const dir='src/content/blog/batches';
const start=new Date(process.argv[2]||new Date().toISOString().slice(0,10)+'T07:00:00.000Z');
const atOnce=Number(process.argv[3]||25);
const files=fs.readdirSync(dir).filter(f=>/^batch-\d+\.json$/.test(f)).sort();
const all=files.flatMap(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')).map(a=>({...a,_file:f})));

// Interleave topics (round-robin over categories), longest (pillar) articles first in each topic.
const byCat=new Map();
for(const a of all){if(!byCat.has(a.category))byCat.set(a.category,[]);byCat.get(a.category).push(a);}
for(const list of byCat.values())list.sort((a,b)=>b.content_markdown.length-a.content_markdown.length);
const order=[];
while([...byCat.values()].some(l=>l.length))for(const l of byCat.values())if(l.length)order.push(l.shift());

let day=new Date(start);
const nextSlot=()=>{do{day=new Date(day.getTime()+86400000);}while(![1,3,5].includes(day.getUTCDay()));day.setUTCHours(7,0,0,0);return day.toISOString();};
order.forEach((a,i)=>{
  const at=i<atOnce?new Date(start.getTime()+i*60000).toISOString():nextSlot();
  a.status=i<atOnce?'published':'scheduled';a.published_at=at;a.created_at=at;a.updated_at=at;
});
for(const f of files){
  const out=all.filter(a=>a._file===f).map(({_file,...a})=>a);
  fs.writeFileSync(path.join(dir,f),JSON.stringify(out,null,1)+'\n');
}
const rows=order.map(({_file,...a})=>a);
const tag='lpsa_batches';
const sql=[
  `-- Editorial batches (${rows.length} guides) with their publication schedule. Re-runnable: never overwrites an existing slug.`,
  'BEGIN;',
  `INSERT INTO public.blog_posts SELECT * FROM jsonb_populate_recordset(NULL::public.blog_posts, ${'$'}${tag}${'$'}${JSON.stringify(rows)}${'$'}${tag}${'$'}::jsonb) ON CONFLICT (slug) DO NOTHING;`,
  'COMMIT;',''].join('\n');
fs.writeFileSync('supabase/seeds/blog-batches.sql',sql);
const last=rows.at(-1)?.published_at;
console.log(`${rows.length} articles: ${Math.min(atOnce,rows.length)} published on ${start.toISOString().slice(0,10)}, the rest three a week until ${last?.slice(0,10)}.`);
