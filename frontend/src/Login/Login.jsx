import {useEffect, useState} from 'react'
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import supabase from '../Auth/supabase';
import axios from 'axios';
import { useAuth } from '../Context/AuthProvider';

export default function Login() {
  const { session, user, loading } = useAuth();

      const navigate = useNavigate();
      const [email,setEmail]=useState('');
      const[password,setPassword]=useState('');
    const [synced, setSynced] = useState(false);

  async function handleSubmit(){
     console.log("submited");
     const {  error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (error) {
  console.error(error.message);
} 
  }

  useEffect(() => {
    if(loading) return;
    if(!user || !session) return
 if (synced) return; 
  async function syncUser() {
    try {
    await axios.post(
      "http://localhost:8000/profile/create",
      {
        uname:
          user.user_metadata.full_name ||
           user.user_metadata.uname ||
          user.email.split("@")[0],
      },
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );
          setSynced(true);
            // navigate("/chat");
  }
  catch (err) {
        console.log(err.response?.data || err.message);
      }
  }

  syncUser();
},  [session, user, loading,synced, navigate]);

 const handleGoogleLogin = async () => {
  console.log("clicked");
  
   const {error} = await supabase.auth.signInWithOAuth({
     provider: "google",
     options: {
       redirectTo: "http://localhost:5173/"
     }
   });
  //  console.log(data);
  }

  return (
    
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
  <div className="w-full max-w-md flex flex-col gap-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
    <h1 className="text-xl font-semibold text-gray-800 text-center">
      Sign in to your account
    </h1>

    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
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
        Don't have an account?{' '}
        <span
          className="font-medium text-gray-800 underline cursor-pointer"
          onClick={() => navigate('/signup')}
        >
          Sign up
        </span>
      </p>
    </form>
  </div>
</div>
  )
}
