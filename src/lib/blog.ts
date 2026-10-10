import {z} from 'zod';
export const blogStatuses=['draft','published','scheduled'] as const;
export const blogSchema=z.object({
  id:z.uuid(),title:z.string().trim().min(5).max(160),
  slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  excerpt:z.string().trim().min(10).max(500),
  content_markdown:z.string().min(50).max(40000),
  seo_title:z.string().trim().max(160),seo_description:z.string().trim().max(320),
  category:z.enum(['Guides','Gobelets','Vaisselle','Collectivités','RSE']).default('Guides'),
  cover_url:z.string().max(1000).refine(v=>v===''||/^https:\/\//.test(v)||/^\/api\/media\/[a-f0-9-]+\.webp$/.test(v)).default(''),
  cover_alt:z.string().max(300).default(''),
  author_name:z.string().trim().min(2).max(120),
  status:z.enum(blogStatuses),published_at:z.union([z.iso.datetime(),z.null()]),
  expected_updated_at:z.union([z.iso.datetime(),z.null()]),
}).strict().refine(v=>v.status==='draft'||v.published_at!==null,{message:'La date de publication est nécessaire.',path:['published_at']});
export type Post=Omit<z.infer<typeof blogSchema>,'expected_updated_at'> & {created_at:string;updated_at:string};
export function isPublic(post:Post,now=Date.now()){return post.status!=='draft'&&post.published_at!==null&&new Date(post.published_at).getTime()<=now;}
