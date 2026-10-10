import {test,expect} from '@playwright/test';
test('explicit transmission, reload resume, completion, back-office status',async({page})=>{
  await page.goto('/devis/');await page.evaluate(()=>sessionStorage.clear());await page.reload();
  await page.getByLabel('Prénom et nom').fill('Contact fictif');await page.getByLabel('Email',{exact:true}).fill('test@example.com');await page.getByLabel('Organisation',{exact:true}).fill(`Test parcours ${Date.now()}`);
  await page.getByRole('button',{name:'Transmettre et préciser mon projet'}).click();await expect(page.getByText('Vos coordonnées ont bien été transmises.')).toBeVisible();
  await page.reload();await expect(page.getByText('Les détails, à votre rythme.')).toBeVisible();
  await page.getByLabel('Nom de l’événement').fill('Festival de démonstration');await page.getByLabel('Ville',{exact:true}).fill('Annecy');await page.getByLabel('Code postal').fill('74000');await page.getByLabel('Volume de l’événement').fill('50000');
  await page.getByRole('button',{name:'Finaliser ma demande'}).click();await expect(page.getByText('Le relais est pris.')).toBeVisible();
  await page.getByRole('link',{name:'Voir la demande dans le back-office'}).click();await page.locator('.lead-card').first().click();await expect(page.getByRole('heading',{name:'Festival de démonstration'})).toBeVisible();await expect(page.getByText('Cœur de cible',{exact:true})).toBeVisible();
  await page.getByLabel('Statut',{exact:true}).selectOption('Gagnée');await expect(page.locator('.lead-card').first().getByText('Gagnée')).toBeVisible();await page.reload();await expect(page.locator('.lead-card').first().getByText('Gagnée')).toBeVisible();
});
test('API refuses cross-origin, invalid input and wrong resume token',async({request})=>{
  const origin=process.env.BASE_URL||'http://127.0.0.1:4321';
  const id=crypto.randomUUID(),token='b'.repeat(64);const contact={id,token,need:'lavage',name:'API fictive',email:'api@example.com',phone:'',organization:'Test sécurité',website:''};
  const denied=await request.post('/api/leads/',{headers:{origin:'https://foreign.example'},data:contact});expect(denied.status()).toBe(403);
  const invalid=await request.post('/api/leads/',{headers:{origin},data:{...contact,email:''}});expect(invalid.status()).toBe(400);
  const created=await request.post('/api/leads/',{headers:{origin},data:contact});expect(created.status()).toBe(201);
  const again=await request.post('/api/leads/',{headers:{origin},data:contact});expect(again.status()).toBe(201);
  const details={token:'c'.repeat(64),event:'',city:'',postalCode:'',date:'',volume:null,annualVolume:null,transport:'à définir',message:''};
  const wrong=await request.patch(`/api/leads/${id}/`,{headers:{origin},data:details});expect(wrong.status()).toBe(404);
  const list=await request.get('/api/leads/');expect((await list.json()).leads.filter((l:{id:string})=>l.id===id)).toHaveLength(1);expect(JSON.stringify(await list.json())).not.toContain('resume_hash');
});
test('home and quote fit mobile and keep HTML headings',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('Le public est parti');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});await page.goto('/devis/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
