import {useEffect, useState} from 'react'
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import supabase from '../Auth/supabase';
import axios from 'axios';

export default function Login() {
      const navigate = useNavigate();
      const [email,setEmail]=useState('');
      const[password,setPassword]=useState('');
    
  async function handleSubmit(){
     console.log("submited");
     const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (error) {
  console.error(error.message);
} else {
  console.log(data.session);
  console.log(data.user);
}
  }

  useEffect(() => {
  async function syncUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
console.log(await supabase.auth.getSession())
    if (!session) return;

    await axios.post(
      "http://localhost:8000/profile/create",
      {
        uname:
          session.user.user_metadata.full_name ||
          session.user.email.split("@")[0],
      },
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );
  }

  syncUser();
}, []);

 const handleGoogleLogin = async () => {
  console.log("clicked");
  
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: "google",
    //  options: {
    //    redirectTo: "http://localhost:5173/"
    //  }
   });
   console.log(data);
  }

  return (
      <form
        className="flex flex-col items-center justify-center p-2 md:p-5 gap-3 md:gap-10"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-3">
          <label htmlFor="email" className="w-20 md:w-24">
          email
          </label>
          <input
            type="text"
            className="border border-periwinkle md:py-1 md:px-3"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

        </div>

        <div className="flex gap-3">
          <label
            htmlFor="password"
            className="w-20 md:w-24"
          >
            Password
          </label>

          <input
            type="password"
            className="border border-periwinkle md:py-1 md:px-3"
                        onChange={(e)=>setPassword(e.target.value)}

          />
        </div>

        <div className="flex gap-3">
            <button type='submit'
                            className='border rounded-xs border-black p-1 hover:cursor-pointer'>Signup</button>
        <button  type='button'
         className='border rounded-xs border-black p-1 hover:cursor-pointer' onClick={handleGoogleLogin} >Login with google</button>
         <div className='flex'>
            <p className='text-blackcream  font-medium'> Don't have an account- signup <span className="cursor-pointer font-bold text-rose-400 ml-1" onClick={()=>navigate('/signup')}>Signup</span></p>

          </div>
        </div>
        </form>
  )
}
