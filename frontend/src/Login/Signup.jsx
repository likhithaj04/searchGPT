import {useEffect} from 'react'
import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import supabase from '../Auth/supabase'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { useAuth } from '../Context/AuthProvider'

export default function Signup() {
  const navigate = useNavigate();
  const {session,user,loading}=useAuth()

  const formSchema=z.object({
    uname:z.string({required_error:"Name is required"}).trim(),

    email:z.string({required_error:"Email is required"})
        .email({message:"invalid Email Address"})
             .max(255)
                 .transform(val => val.toLowerCase()),
    
    password:z.string({required_error:"password is required"}).trim()
              .min(8,{message:"minimum 8 charecters required"})
              .max(25,{message:"maximum 25 charects only"}),
  })


  const {
    handleSubmit,
    register,
    formState:{errors}
  }=useForm({resolver:zodResolver(formSchema)})

  async function onSubmit(formData){
   try {
    // console.log(formData);
    
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            uname: formData.uname,
          },
        },
      });

      if (error) {
        console.error(error.message);
        return;
      }

      console.log("Signup successful");
      // console.log(data);

      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }       

const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173/"
    }
  });
 
};

useEffect(() => {
          if(!user || !session) return

  async function syncUser() {

    try {
      const res = await axios.post(
        "http://localhost:8000/profile/create",
        {
          uname:
            session.user.user_metadata.full_name ||
            session.user.user_metadata.uname ||
            session.user.email.split("@")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      // console.log(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  }

  syncUser(); 

}, []);


  return (
    <>
<div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
  <div className="w-full max-w-md flex flex-col gap-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
    <h1 className="text-xl font-semibold text-gray-800 text-center">
      Create your account
    </h1>

    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1">
        <label htmlFor="uname" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="uname"
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          {...register('uname')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          {...register('email')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          {...register('password')}
        />
      </div>

      <button
        type="submit"
        className="bg-gray-800 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-700 transition cursor-pointer mt-2"
      >
        Sign up
      </button>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
      >
        Continue with Google
      </button>

      <p className="text-sm text-gray-500 text-center mt-2">
        Already have an account?{' '}
        <span
          className="font-medium text-gray-800 underline cursor-pointer"
          onClick={() => navigate('/login')}
        >
          Log in
        </span>
      </p>
    </form>
  </div>
</div>
    </>
  )
}
