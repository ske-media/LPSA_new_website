import type {APIRoute} from 'astro';
import sharp from 'sharp';import {mkdir,writeFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {db,demo,handle,HttpError,json,requireStaff} from '../../../lib/server';
export const prerender=false;
export const POST:APIRoute=({request})=>handle(async()=>{
  if(request.headers.get('origin')!==new URL(request.url).origin)throw new HttpError(403,'Origine non autorisée.');
  await requireStaff(request);
  const declared=Number(request.headers.get('content-length')||0);if(declared>5_500_000)throw new HttpError(413,'Image trop volumineuse. Maximum 5 Mo.');
  const form=await request.formData(),file=form.get('image');
  if(!(file instanceof File)||file.size>5_000_000||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new HttpError(400,'Choisissez une image JPEG, PNG ou WebP de moins de 5 Mo.');
  let bytes:Buffer;try{bytes=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:25_000_000}).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:82}).toBuffer();}catch{throw new HttpError(400,'Cette image ne peut pas être traitée.');}
  const name=`${randomUUID()}.webp`;
  if(demo){await mkdir('.local/media',{recursive:true});await writeFile(`.local/media/${name}`,bytes);return json({url:`/api/media/${name}`,name});}
  const client=db();const {error}=await client.storage.from('blog-media').upload(name,bytes,{contentType:'image/webp',upsert:false});if(error)throw new HttpError(500,'Impossible d’enregistrer l’image.');
  return json({url:client.storage.from('blog-media').getPublicUrl(name).data.publicUrl,name});
});
