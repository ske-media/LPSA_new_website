import {test} from 'node:test';
import assert from 'node:assert/strict';
import {contactSchema,detailsSchema,qualify,type Lead} from '../src/lib/lead';
const contact={id:'f8337f5b-57e1-40bf-ac01-bb59cc065218',token:'a'.repeat(64),need:'lavage',name:'Test LPSA',email:'test@example.com',phone:'',organization:'Festival test',website:''};
test('contact accepts email or phone, rejects missing contacts and client status injection',()=>{
  assert.equal(contactSchema.safeParse(contact).success,true);
  assert.equal(contactSchema.safeParse({...contact,email:'',phone:'+33 6 11 22 33 44'}).success,true);
  assert.equal(contactSchema.safeParse({...contact,email:'',phone:''}).success,false);
  assert.equal(contactSchema.safeParse({...contact,status:'Gagnée'}).success,false);
});
test('resume token and optional volume must be valid',()=>{
  const details={token:contact.token,event:'',city:'',postalCode:'',date:'',volume:null,annualVolume:null,transport:'à définir',message:''};
  assert.equal(detailsSchema.safeParse(details).success,true);
  assert.equal(detailsSchema.safeParse({...details,token:'abc'}).success,false);
  assert.equal(detailsSchema.safeParse({...details,volume:-1}).success,false);
  assert.equal(detailsSchema.safeParse({...details,message:'x'.repeat(4001)}).success,false);
});
test('qualification respects geography, strict outside threshold and small event rule',()=>{
  const lead:Lead={...contact,need:'lavage',created_at:'',updated_at:'',status:'Nouvelle demande',details:{event:'',city:'',postalCode:'74000',date:'',volume:50000,annualVolume:null,transport:'à définir',message:''}};
  assert.deepEqual(qualify(lead),['Cœur de cible']);
  lead.details!.postalCode='69000';lead.details!.volume=100000;assert.deepEqual(qualify(lead),['À qualifier']);
  lead.details!.volume=100001;assert.deepEqual(qualify(lead),['Grand marché à étudier']);
  lead.details!.volume=2500;assert.deepEqual(qualify(lead),['Sous le seuil événement']);
});
