import prisma from "../config/dbConfig.js";
import supabase from "../config/supabaseConfig.js";

export const title=async(req,res)=>{
    console.log("reached");
    
    const {id}=req.user?.id;
console.log("req.user.id:", req.user?.id);
    
const db = await prisma.chat.findMany({
        where:{
            user_id:req.user?.id
        },
          select: {
    id: true,
    title: true,
  },
    })    
    console.log(db)
    // console.log(titles);
    
    res.send({data:db   })
}

export const allchats=(req,res)=>{
    const {id}=req.user?.id
    console.log(id);
    
}