import { z } from 'zod';

export const needs = ['lavage', 'gobelets', 'vaisselle', 'conseil', 'stockage'] as const;
export const statuses = ['À compléter', 'Nouvelle demande', 'À qualifier', 'Devis envoyé', 'Gagnée', 'Perdue', 'Hors cible'] as const;
const short = z.string().trim().max(200);
export const contactSchema = z.object({
  id: z.uuid(), token: z.string().regex(/^[a-f0-9]{64}$/),
  need: z.enum(needs), name: short.min(2),
  email: z.union([z.email().trim().max(254), z.literal('')]),
  phone: z.string().trim().max(40), organization: short,
  website: z.string().max(200).default(''),
}).strict().refine(v => Boolean(v.email || /^[+\d\s().-]{6,40}$/.test(v.phone)), {message:'Indiquez un email valide ou un numéro de téléphone.', path:['email']});

export const detailsSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  event: short, city: short, postalCode: z.string().trim().regex(/^$|^\d{5}$/),
  date: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
  volume: z.union([z.number().int().min(0).max(10_000_000),z.null()]),
  annualVolume: z.union([z.number().int().min(0).max(100_000_000),z.null()]),
  transport: z.enum(['à définir', 'collecte et livraison', 'collecte', 'livraison', 'dépôt et retrait']),
  message: z.string().trim().max(4000),
}).strict();
export const statusSchema = z.object({status:z.enum(statuses)}).strict();
export type Contact = z.infer<typeof contactSchema>;
export type Details = Omit<z.infer<typeof detailsSchema>, 'token'>;
export type Lead = {
  id:string; need: typeof needs[number]; name:string; email:string; phone:string; organization:string;
  created_at:string; updated_at:string; status:typeof statuses[number]; details:Details|null;
};
export const labels:Record<Lead['need'],string> = {lavage:'Lavage de gobelets',gobelets:'Location de gobelets',vaisselle:'Location de vaisselle',conseil:'Conseil à l’achat',stockage:'Stockage de parc'};
export function qualify(lead:Lead):string[] {
  const d=lead.details;if(!d)return ['À préciser'];const tags:string[]=[];
  if((d.annualVolume??0)>0)tags.push('Récurrence à étudier');
  const local=['74','73','01'].includes(d.postalCode.slice(0,2));
  if(d.volume!==null && d.volume>=50_000 && local)tags.push('Cœur de cible');
  if(d.volume!==null && d.volume>100_000 && !local)tags.push('Grand marché à étudier');
  if(lead.need==='lavage' && d.volume!==null && d.volume<3000)tags.push('Sous le seuil événement');
  return tags.length?tags:['À qualifier'];
}
