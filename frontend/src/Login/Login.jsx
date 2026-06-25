import {useEffect, useState} from 'react'
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import supabase from '../Auth/supabase';

export default function Login() {
      const navigate = useNavigate();
      const [email,setEmail]=useState('');
      const[password,setPassword]=useState('');
    
//      const formSchema = z.object({
//     email: z
//       .string({ required_error: "Name is required" })
//       .trim()
//       .min(3, { message: "Name must have atleast 3 characters" })
//       .max(250, { message: "Maximum characters exceeded" }),

//     password: z
//       .string({ required_error: "Password is required" })
//       .trim()
//       .min(8, { message: "Minimum 8 characters required" })
//       .max(25, { message: "Maximum 25 characters only" }),
//   });
//    const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(formSchema),
//   });


  
  async function handleSubmit(){
     console.log("submit");
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
  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      console.log("Logged In");
      console.log(session.user);
    }
  }

  checkUser();
}, []);

  const handleClick=async()=>{
     await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: 'http://localhost:5173/',
  },
});
  }

  return (
      <form
        className="flex flex-col items-center justify-center p-2 md:p-5 gap-3 md:gap-10"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-3">
          <label htmlFor="username" className="w-20 md:w-24">
            Username
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
          />
        </div>

        <div className="flex gap-3">
            <button type='submit'
                            className='border rounded-xs border-black p-1 hover:cursor-pointer'>Signup</button>
        <button type='submit'
         className='border rounded-xs border-black p-1 hover:cursor-pointer' onClick={()=>handleClick} >Login with google</button>
         <div className='flex'>
            <p className='text-blackcream  font-medium'> Already have an account <span className="cursor-pointer font-bold text-rose-400 ml-1" onClick={()=>navigate('/signup')}>Signup</span></p>

          </div>
        </div>
        </form>
  )
}
