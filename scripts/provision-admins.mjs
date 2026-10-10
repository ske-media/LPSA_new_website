// Creates accounts without sending email. Supply a strong initial password
// privately using LPSA_ADMIN_PASSWORD; never commit it or print it.
import {createClient} from '@supabase/supabase-js';
const password=process.env.LPSA_ADMIN_PASSWORD;
if(!password||password.length<16)throw Error('LPSA_ADMIN_PASSWORD must contain at least 16 characters.');
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
const {data:existing,error:listError}=await db.auth.admin.listUsers();if(listError)throw listError;
for(const email of ['accueil@laplongesadapte.com','vivien@laplongesadapte.com']){
 let user=existing.users.find(user=>user.email===email);
 if(!user){const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true});if(error)throw error;user=data.user;}
 const {error}=await db.from('staff_members').upsert({user_id:user.id});if(error)throw error;
 console.log(`Access configured: ${email}`);
}
