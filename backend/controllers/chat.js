import prisma from "../config/dbConfig.js";
import supabase from "../config/supabaseConfig.js";

export const title=async(req,res)=>{
    console.log("reached");
    
    const {id}=req.user?.id;
// console.log("req.user.id:", req.user?.id);
    
const db = await prisma.chat.findMany({
        where:{
            user_id:req.user?.id
        },
          select: {
    id: true,
    title: true,
  },
    })    
    // console.log(db)
    // console.log(titles);
    
    res.send({data:db   })
}

export const allchats=async(req,res)=>{
    // console.log("hit");

    const { chatId } = req.params;
// console.log(chatId);

    const chats=await prisma.chat.findMany({
        where:{
           id:chatId,
           user_id:req.user?.id
        },
        select:{
            id:true,
            title:true,
            messages:{
                select:{
                    role:true,
                    content:true,
                },
            orderBy:{
                created_at:'asc'
            }
        }
        }
    })
        // console.log(chats);

    res.json({data:chats})
}