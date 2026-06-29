import supabase from "../config/supabaseConfig.js";

import { Router } from "express";
const router=Router();

const authMiddlware=async(req,res,next)=>{
  try{
     
    const authHeader=req.headers.authorization;
    //  console.log("middleware hit")
     if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const token=authHeader.split(" ")[1];

    const {
        data:{user},
        error,
    }=await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }

  }
 
export default authMiddlware