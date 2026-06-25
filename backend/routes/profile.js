import supabase from '../config/supabaseConfig.js';
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js'
import prisma from '../config/dbConfig.js';

const router = Router();

router.post("/create",authMiddleware,async(req,res)=>{
   try{
    console.log("reached");
    
       const {uname}=req.body;
console.log(uname);

       const existingUser=await prisma.user.findUnique({
        where:{
            id:req.user.id
        }
       })

         if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "Profile already exists",
        data: existingUser,
      });
    }
    const profile=await prisma.user.create({
        data:{
             id: req.user.id,
        email: req.user.email,
        name:uname,
        }
    })
   
    res.status(201).json({
      success: true,
      data: profile,
    });
    console.log(profile);
    
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
})

export default router;