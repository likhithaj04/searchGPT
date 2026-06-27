import prisma from "../config/dbConfig.js";
import supabase from "../config/supabaseConfig.js";

export const title=async(req,res)=>{
    const {id}=req.body;
    console.log(id);
    
    const db=await prisma.user.findUnique({
        where:{
            id:id
        },
            include:{
                    chats:{
                        select:{
                    title:true
                }
            }
            }
        
        
    })    
    console.log(db)
    const titles=db.chats.map(chat=>chat.title)
    res.send(titles)
}

