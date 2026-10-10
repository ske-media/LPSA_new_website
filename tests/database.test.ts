import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('migration isolates leads, membership and rate limiter in a PostgreSQL test engine',async()=>{
  const db=new PGlite();
  try{
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.user_id',true),'')::uuid $$;
      grant usage on schema public,auth to anon,authenticated,service_role;
      grant execute on function auth.uid() to authenticated;`);
    await db.exec('create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);');
    const file=(await readdir('supabase/migrations')).find(x=>x.endsWith('_lead_foundation.sql'))!;
    await db.exec(await readFile(`supabase/migrations/${file}`,'utf8'));
    const blogFile=(await readdir('supabase/migrations')).find(x=>x.endsWith('_blog_publishing.sql'))!;
    await db.exec(await readFile(`supabase/migrations/${blogFile}`,'utf8'));
    const mediaFile=(await readdir('supabase/migrations')).find(x=>x.endsWith('_editorial_media_versions.sql'))!;
    await db.exec(await readFile(`supabase/migrations/${mediaFile}`,'utf8'));
    await db.exec(`insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
      insert into public.staff_members(user_id) values ('11111111-1111-4111-8111-111111111111');`);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.leads'),/permission denied/);
    await assert.rejects(db.query('select * from public.blog_posts'),/permission denied/);
    await assert.rejects(db.query("select public.consume_lead_limit('test')"),/permission denied/);
    await db.exec(`reset role; set role authenticated; select set_config('test.user_id','22222222-2222-4222-8222-222222222222',false);`);
    assert.equal((await db.query('select * from public.staff_members')).rows.length,0);
    await assert.rejects(db.query('select * from public.leads'),/permission denied/);
    await db.exec(`select set_config('test.user_id','11111111-1111-4111-8111-111111111111',false);`);
    assert.equal((await db.query('select * from public.staff_members')).rows.length,1);
    await db.exec('reset role; set role service_role');
    for(let i=0;i<20;i++){const result=await db.query<{allowed:boolean}>("select public.consume_lead_limit('test') as allowed");assert.equal(result.rows[0].allowed,true);}
    const capped=await db.query<{allowed:boolean}>("select public.consume_lead_limit('test') as allowed");assert.equal(capped.rows[0].allowed,false);
  }finally{await db.close();}
});
