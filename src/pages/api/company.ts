import type {APIRoute} from 'astro';
import {handle,HttpError,json,rateLimit} from '../../lib/server';
export const prerender=false;
export const GET:APIRoute=({url,clientAddress})=>handle(async()=>{
  const q=url.searchParams.get('q')?.trim()||'';if(q.length<3||q.length>100)throw new HttpError(400,'Indiquez un SIREN ou un nom d’entreprise.');
  await rateLimit(clientAddress);
  const response=await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q)}&page=1&per_page=5`,{signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new HttpError(503,'La recherche publique est temporairement indisponible.');
  const data=await response.json();return json({companies:(data.results||[]).map((c:Record<string,unknown>)=>({siren:c.siren,name:c.nom_complet,effectif:c.tranche_effectif_salarie??null,year:c.annee_tranche_effectif_salarie??null}))});
});
