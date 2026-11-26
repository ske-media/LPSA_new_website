import catalog from '../content/blog/catalog.json';
import {blogSchema,type Post} from './blog';
const markdown=import.meta.glob<string>('../content/blog/*.md',{query:'?raw',import:'default',eager:true});
/** Versioned launch articles. The configured CMS remains authoritative. */
const launch:Post[]=catalog.map(record=>{
 const {created_at,updated_at,...fields}=record;
 const content_markdown=markdown[`../content/blog/${record.slug}.md`];
 if(!content_markdown)throw new Error(`Missing editorial article: ${record.slug}`);
 const {expected_updated_at:_,...post}=blogSchema.parse({...fields,content_markdown,expected_updated_at:null});
 return {...post,created_at,updated_at};
});

// Editorial batches injected as JSON (src/content/blog/batches/*.json): full records, markdown included.
const batches=import.meta.glob<Record<string,unknown>[]>('../content/blog/batches/*.json',{import:'default',eager:true});
const injected:Post[]=Object.values(batches).flat().map(record=>{
  const {created_at,updated_at,...fields}=record as Record<string,string>;
  const {expected_updated_at:_,...post}=blogSchema.parse({...fields,expected_updated_at:null});
  return {...post,created_at,updated_at};
});
const seen=new Set(launch.map(p=>p.slug));
export const editorialPosts:Post[]=[...launch,...injected.filter(p=>!seen.has(p.slug)&&(seen.add(p.slug),true))];
