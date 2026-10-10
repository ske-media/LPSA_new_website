import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {db,demo,hasBlogDatabase,HttpError} from './server';
import {blogSchema,isPublic,type Post} from './blog';
export {renderMarkdown} from './markdown';
import {editorialPosts} from './editorial';
let queue:Promise<unknown>=Promise.resolve();
async function local<T>(fn:(posts:Post[])=>T|Promise<T>,write=false):Promise<T>{const task=queue.then(async()=>{await mkdir('.local',{recursive:true});let posts:Post[]=editorialPosts.map(p=>({...p}));try{posts=JSON.parse(await readFile('.local/posts.json','utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}const value=await fn(posts);if(write){await writeFile('.local/posts.tmp',JSON.stringify(posts));await rename('.local/posts.tmp','.local/posts.json');}return value;});queue=task.catch(()=>{});return task;}
export async function listPosts(publicOnly=false):Promise<Post[]>{
  if(!demo&&!hasBlogDatabase&&publicOnly)return editorialPosts.filter(p=>isPublic(p));
  if(demo)return local(posts=>posts.filter(p=>!publicOnly||isPublic(p)).sort((a,b)=>(b.published_at??b.updated_at).localeCompare(a.published_at??a.updated_at)));
  let query=db().from('blog_posts').select('*').order('published_at',{ascending:false,nullsFirst:false}).limit(200);
  if(publicOnly)query=query.in('status',['published','scheduled']).lte('published_at',new Date().toISOString());
  const {data,error}=await query;if(error)throw new HttpError(503,'Les articles sont temporairement indisponibles.');return data;
}
export async function getPublicPost(slug:string):Promise<Post|null>{
  if(!demo&&!hasBlogDatabase)return editorialPosts.find(p=>p.slug===slug&&isPublic(p))??null;
  if(demo)return local(posts=>posts.find(p=>p.slug===slug&&isPublic(p))??null);
  const {data,error}=await db().from('blog_posts').select('*').eq('slug',slug).in('status',['published','scheduled']).lte('published_at',new Date().toISOString()).maybeSingle();
  if(error)throw new HttpError(503,'Cet article est temporairement indisponible.');return data;
}
export async function savePost(input:zInput):Promise<Post>{
  const {expected_updated_at,...fields}=blogSchema.parse(input);const now=new Date().toISOString();
  if(demo)return local(async posts=>{
    const old=posts.find(p=>p.id===fields.id);
    if(posts.some(p=>p.slug===fields.slug&&p.id!==fields.id))throw new HttpError(409,'Cette adresse est déjà utilisée.');
    if(old&&old.updated_at!==expected_updated_at)throw new HttpError(409,'Cet article a été modifié. Rechargez-le avant de poursuivre.');
    if(!old&&expected_updated_at)throw new HttpError(404,'Article introuvable.');
    if(old&&isPublic(old)&&old.slug!==fields.slug)throw new HttpError(409,'L’adresse d’un article en ligne est conservée pour le référencement.');
    if(old){let versions:Post[]=[];try{versions=JSON.parse(await readFile('.local/post-versions.json','utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}versions.push(old);await writeFile('.local/post-versions.json',JSON.stringify(versions));}
    const post:Post={...fields,created_at:old?.created_at??now,updated_at:now};if(old)posts[posts.indexOf(old)]=post;else posts.push(post);return post;
  },true);
  const client=db();let result;
  if(expected_updated_at){const {data:old,error}=await client.from('blog_posts').select('slug,status,published_at').eq('id',fields.id).maybeSingle();if(error)throw new HttpError(500,'Impossible de vérifier cet article.');if(old&&old.status!=='draft'&&old.published_at&&new Date(old.published_at).getTime()<=Date.now()&&old.slug!==fields.slug)throw new HttpError(409,'L’adresse d’un article en ligne est conservée pour le référencement.');}
  if(expected_updated_at)result=await client.from('blog_posts').update({...fields,updated_at:now}).eq('id',fields.id).eq('updated_at',expected_updated_at).select('*').maybeSingle();
  else result=await client.from('blog_posts').insert({...fields,created_at:now,updated_at:now}).select('*').single();
  if(result.error?.code==='23505')throw new HttpError(409,'Cette adresse ou cet article existe déjà.');
  if(result.error)throw new HttpError(500,'Impossible d’enregistrer cet article.');
  if(!result.data)throw new HttpError(409,'Cet article a été modifié. Rechargez-le avant de poursuivre.');
  return result.data;
}
type zInput=Parameters<typeof blogSchema.parse>[0];
export async function listVersions(id:string):Promise<Post[]>{
  if(demo)return local(async()=>{try{const versions:Post[]=JSON.parse(await readFile('.local/post-versions.json','utf8'));return versions.filter(p=>p.id===id).reverse().slice(0,20);}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw e;}});
  const {data,error}=await db().from('blog_post_versions').select('snapshot').eq('post_id',id).order('saved_at',{ascending:false}).limit(20);if(error)throw new HttpError(500,'Historique indisponible.');return data.map(v=>v.snapshot as Post);
}
export async function deleteDraft(id:string){
  if(demo)return local(posts=>{const post=posts.find(p=>p.id===id);if(!post||post.status!=='draft')throw new HttpError(409,'Seul un brouillon peut être supprimé.');posts.splice(posts.indexOf(post),1);},true);
  const {data,error}=await db().from('blog_posts').delete().eq('id',id).eq('status','draft').select('id').maybeSingle();if(error||!data)throw new HttpError(409,'Seul un brouillon peut être supprimé.');
}
