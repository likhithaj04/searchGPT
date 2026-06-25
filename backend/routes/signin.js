import supabase from '../config/supabaseConfig.js';
import { Router } from 'express';

const router = Router();;

router.post('/signup',async(req,res)=>{
   const {uname,email,password}=req.body;
     
   const {data,error}=await supabase.auth.admin.createUser({
       uname,
       email,
       password,
       email_confirm:true
   })

   if(error){
     return res.status(400).json({error: error.message});
   }
   res.json(data);
})


router.post("/signin",async(req,res)=>{
   
    const{email,password}=req.body;

    const{data,error}=await supabase.auth.signInWithPassword({
        email,
        password
    })
    if(error){
   return res.status(400).json({
     error:error.message
   });
 }
console.log("Login successfull");

     res.json(data);

})

export default router;