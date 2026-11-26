import catalog from '../content/blog-en/catalog.json';
import type {Post} from './blog';
const markdown=import.meta.glob<string>('../content/blog-en/*.md',{query:'?raw',import:'default',eager:true});
/** English translations of the launch guides (French CMS stays authoritative for French). */
export type PostEn=Omit<Post,'category'>&{category:string};
export const editorialPostsEn:PostEn[]=catalog.map(record=>{
  const content_markdown=markdown[`../content/blog-en/${record.slug}.md`];
  if(!content_markdown)throw new Error(`Missing English article: ${record.slug}`);
  return {...(record as unknown as PostEn),content_markdown};
});
