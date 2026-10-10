import catalog from '../content/blog/catalog.json';
import {blogSchema,type Post} from './blog';
const markdown=import.meta.glob<string>('../content/blog/*.md',{query:'?raw',import:'default',eager:true});
/** Versioned launch articles. The configured CMS remains authoritative. */
export const editorialPosts:Post[]=catalog.map(record=>{
 const {created_at,updated_at,...fields}=record;
 const content_markdown=markdown[`../content/blog/${record.slug}.md`];
 if(!content_markdown)throw new Error(`Missing editorial article: ${record.slug}`);
 const {expected_updated_at:_,...post}=blogSchema.parse({...fields,content_markdown,expected_updated_at:null});
 return {...post,created_at,updated_at};
});
