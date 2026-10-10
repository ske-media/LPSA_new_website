export function reuseScenario(park:number,uses:number){
  if(!Number.isFinite(park)||!Number.isFinite(uses)||park<0||uses<0)throw new Error('Volumes invalides.');
  const disposableEquivalent=uses,averageRotations=park?uses/park:0;
  return {disposableEquivalent,averageRotations,park};
}
export function oethScenario({eligibleLabor,contribution,employmentRate,otherDeductions}:{eligibleLabor:number;contribution:number;employmentRate:number;otherDeductions:number}){
  if([eligibleLabor,contribution,employmentRate,otherDeductions].some(n=>!Number.isFinite(n)||n<0)||employmentRate>100)throw new Error('Montants invalides.');
  const potential=.3*eligibleLabor,cap=contribution*(employmentRate<3?.5:.75),remaining=Math.max(0,cap-otherDeductions);
  return {potential,cap,remaining,deduction:Math.min(potential,remaining)};
}
