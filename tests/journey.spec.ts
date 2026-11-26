import {test,expect} from '@playwright/test';
test('explicit transmission, reload resume, completion, back-office status',async({page})=>{
  await page.goto('/devis/');await page.evaluate(()=>sessionStorage.clear());await page.reload();
  await page.getByRole('button',{name:/Lavage de gobelets/}).click();
  await page.getByLabel('Comment vous appelez-vous').fill('Contact fictif');await page.keyboard.press('Enter');
  await page.getByRole('button',{name:'OK'}).click();await expect(page.getByText('Indiquez au moins un email')).toBeVisible();
  await page.getByLabel('Email',{exact:true}).fill('test@example.com');await page.getByRole('button',{name:'OK'}).click();
  await page.getByLabel('Pour quelle structure').fill(`Test parcours ${Date.now()}`);
  await page.getByRole('button',{name:'Transmettre mes coordonnées'}).click();await expect(page.getByText('Vos coordonnées ont bien été transmises.')).toBeVisible();
  await page.reload();await expect(page.getByText('Comment s’appelle votre événement ?')).toBeVisible();
  await page.getByLabel('Comment s’appelle votre événement').fill('Festival de démonstration');await page.getByRole('button',{name:'OK'}).click();
  await page.getByRole('button',{name:'Passer'}).click();
  await page.getByLabel('Ville',{exact:true}).fill('Annecy');await page.getByLabel('Code postal').fill('74000');await page.getByRole('button',{name:'OK'}).click();
  await page.getByLabel('Pour cet événement').fill('50000');await page.getByRole('button',{name:'OK'}).click();
  await page.getByRole('button',{name:'Collecte et livraison'}).click();
  await page.getByRole('button',{name:'Finaliser ma demande'}).click();await expect(page.getByText('Le relais est pris')).toBeVisible();
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
test('tableware catalogue selection prefills the quote, small batches are offered',async({page})=>{
  await page.goto('/prestations/location-vaisselle/');await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.locator('#catalogue').scrollIntoViewIfNeeded();
  await page.locator('astro-island[component-url*="VaisselleCatalog"]:not([ssr])').waitFor({state:'attached'});
  await page.getByRole('button',{name:/^Verrerie/}).click();await expect(page.locator('.catalog-count')).toContainText('Verrerie');
  await page.locator('.catalog-add').first().click();
  const link=page.locator('.catalog-bar .btn');await expect(link).toHaveAttribute('href',/besoin=vaisselle&selection=/);
  await link.click();await expect(page.getByText('Question 2 sur 10')).toBeVisible();
  await page.goto('/devis/');await expect(page.getByRole('button',{name:/Petit événement ou association/})).toBeVisible();
});
test('audience pages carry their own arguments, structured data and profile to the quote',async({page,request})=>{
  for(const slug of ['clubs-sportifs','restaurants-entreprise','traiteurs','comites-des-fetes','collectivites-mairies']){
    const html=await (await request.get(`/pour/${slug}/`)).text();
    expect(html).toContain('"@type":"FAQPage"');expect(html).toContain(`profil=${slug}`);expect(html).not.toMatch(/3[\s  ]000 (gobelets|pièces)/);
  }
  await page.goto('/pour/traiteurs/');await expect(page.getByRole('heading',{level:1})).toContainText('Traiteurs');
  await page.getByRole('link',{name:'Demander un devis'}).first().click();await expect(page).toHaveURL(/besoin=vaisselle&profil=traiteurs/);
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/pour/collectivites-mairies/');
});
test('public pages never show a volume above 3 000, so small organisations feel welcome',async({page})=>{
  const fr=['/','/prestations/lavage-gobelets/','/prestations/location-gobelets/','/prestations/location-vaisselle/','/rse/','/blog/','/blog/combien-gobelets-prevoir-evenement/','/blog/lavage-gobelets-festival/','/blog/prix-lavage-gobelets/','/blog/collecte-livraison-gobelets-evenement/','/blog/rse-gobelets-reemploi-indicateurs/','/blog/acheter-ou-louer-gobelets-reutilisables/','/pour/clubs-sportifs/','/pour/restaurants-entreprise/','/pour/traiteurs/','/pour/comites-des-fetes/','/pour/collectivites-mairies/'];
  const pages=[...fr,...fr.map(u=>`/en${u}`)];
  for(const url of pages){
    await page.goto(url);await page.waitForTimeout(400);
    const text=(await page.locator('main').innerText()).replace(/0\d(?:[ .]\d{2}){4}/g,'');
    const numbers=[...text.matchAll(/(\d{1,3}(?:[   ]\d{3})+|\d{4,})(?!\s*(?:€|°|cl|cm|L\b))/g)].map(m=>Number(m[1].replace(/\D/g,''))).filter(n=>n<2000||n>2030);
    expect(numbers.filter(n=>n>3000),url).toEqual([]);
    expect(text,url).not.toMatch(/dizaines de milliers|des milliers de gobelets|cent mille|dix mille|tens of thousands|thousands of cups/i);
  }
});
test('English site: language, alternates, switch and translated quote form',async({page})=>{
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('link[rel=alternate][hreflang=fr]')).toHaveAttribute('href',/laplongesadapte\.com\/$/);
  await expect(page.getByRole('heading',{level:1})).toContainText('The crowd has gone');
  await page.locator('.lang-switch').click();await expect(page).toHaveURL(/127\.0\.0\.1:4321\/$/);
  expect((await page.context().cookies()).find(c=>c.name==='nf_lang')?.value).toBe('fr');
  await page.goto('/en/devis/');await expect(page.getByRole('heading',{name:/What do you need/i})).toBeVisible();
  await page.goto('/en/pour/traiteurs/');await expect(page.getByRole('link',{name:'Request a quote'}).first()).toHaveAttribute('href',/^\/en\/devis\/\?besoin=vaisselle&profil=traiteurs/);
});
test('blog hub, topic pages and articles are structured for search',async({page,request})=>{
  await page.goto('/blog/');
  await expect(page.getByRole('navigation',{name:'Thèmes des guides'}).getByRole('link',{name:/Gobelets/})).toHaveAttribute('href','/blog/categorie/gobelets/');
  await page.locator('[data-blog-search] input').fill('marché noël');await expect(page.locator('.search-results a').first()).toBeVisible();
  expect((await request.get('/blog/?categorie=Vaisselle',{maxRedirects:0})).headers()['location']).toBe('/blog/categorie/vaisselle/');
  await page.goto('/blog/categorie/vaisselle/');await expect(page.getByRole('heading',{level:1})).toHaveText('Vaisselle et réceptions');
  const html=await (await request.get('/blog/combien-gobelets-prevoir-evenement/')).text();
  for(const t of ['"BreadcrumbList"','"BlogPosting"','class="toc','hreflang="en"'])expect(html).toContain(t);
  await page.goto('/en/blog/combien-gobelets-prevoir-evenement/');await expect(page.locator('html')).toHaveAttribute('lang','en');
});
