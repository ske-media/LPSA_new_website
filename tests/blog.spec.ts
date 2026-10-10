import {test,expect} from '@playwright/test';
test('editor saves draft, previews sanitized content, schedules and publishes through protected backend',async({page,request})=>{
  const suffix=Date.now(),slug=`guide-test-${suffix}`;
  await page.goto('/admin/blog/');await page.getByRole('button',{name:'Nouvel article'}).click();
  await page.getByLabel('Titre *',{exact:true}).fill('Guide fictif de démonstration');await page.getByLabel('Adresse de l’article').fill(slug);
  await page.getByLabel('Résumé *',{exact:true}).fill('Un article fictif pour vérifier le parcours éditorial.');
  await page.getByLabel('Contenu Markdown').fill('## Organiser le lavage\n\nVoici un contenu fictif suffisamment long pour tester la publication.\n\n<script>alert(1)</script>');
  await page.getByRole('button',{name:'Voir l’aperçu'}).click();await expect(page.locator('.editor-preview').getByRole('heading',{name:'Organiser le lavage'})).toBeVisible();await expect(page.locator('.editor-preview script')).toHaveCount(0);
  const saved=page.waitForResponse(r=>r.url().includes('/api/admin/posts/')&&r.request().method()==='POST'&&!r.url().includes('preview'));
  await page.getByRole('button',{name:'Enregistrer'}).click();const post=(await (await saved).json()).post;
  await expect(page.getByText('Brouillon enregistré.')).toBeVisible();expect((await request.get(`/blog/${slug}/`)).status()).toBe(404);
  await page.getByLabel('Publication',{exact:true}).selectOption('scheduled');const future=new Date(Date.now()+86400000);const local=new Date(future.getTime()-future.getTimezoneOffset()*60000).toISOString().slice(0,16);
  await page.getByLabel('Date de publication programmée').fill(local);await page.getByRole('button',{name:'Enregistrer'}).click();await expect(page.getByText('Publication programmée.',{exact:false})).toBeVisible();expect((await request.get(`/blog/${slug}/`)).status()).toBe(404);
  await page.getByLabel('Publication',{exact:true}).selectOption('published');await page.getByRole('button',{name:'Enregistrer'}).click();await expect(page.getByText('Article publié.',{exact:true})).toBeVisible();
  const article=await request.get(`/blog/${slug}/`);expect(article.status()).toBe(200);expect(await article.text()).toContain('Organiser le lavage');expect(await article.text()).not.toContain('<script>alert(1)</script>');
  expect(await (await request.get('/sitemap.xml')).text()).toContain(`/blog/${slug}/`);
  const origin=process.env.BASE_URL||'http://127.0.0.1:4321';const {created_at:_created,updated_at,...input}=post;
  const conflict=await request.post('/api/admin/posts/',{headers:{origin},data:{...input,expected_updated_at:updated_at}});expect(conflict.status()).toBe(409);
});
test('3D scene responds to scroll without moving the document automatically',async({page})=>{
  await page.goto('/');const scene=page.locator('#cup-story');
  await expect(scene).toHaveAttribute('data-scene',/ready|fallback/,{timeout:15000});
  if(await scene.getAttribute('data-scene')==='fallback')return;
  const start=Number(await scene.getAttribute('data-progress'));
  await page.evaluate(()=>scrollTo(0,innerHeight*2.6));
  await expect.poll(async()=>Number(await scene.getAttribute('data-progress'))).toBeGreaterThan(start+.6);
  const position=await page.evaluate(()=>scrollY);await page.waitForTimeout(300);expect(await page.evaluate(()=>scrollY)).toBe(position);
});
