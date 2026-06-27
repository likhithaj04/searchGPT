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
    <div className=' flex flex-col justify-center items-center min-h-screen'>
    <div className=' w-190 flex flex-col justify-center items-center h-110 border rounded-2xl border-black'>
        <form className='flex flex-col justify-center items-center gap-7 ' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex gap-2'>
                <label htmlFor='uname'>Name</label>
                <input type='text' className=' border border-black '
                {...register('uname')}
                ></input>
            </div>
            <div className='flex gap-2'>
                <label htmlFor='email'>Email</label>
                <input type='text' className=' border border-black '
                {...register('email')}
                ></input>
            </div>
            <div className='flex gap-2'>
                <label htmlFor='password'>Password</label>
                <input type='password' className=' border border-black' 
                {...register('password')}
                ></input>
            </div>
                        <div className='flex  flex-row gap-4'>
                            <button type='submit'
                            className='border rounded-xs border-black p-1 hover:cursor-pointer'>Signup</button>
                            <button onClick={handleGoogleLogin}
                             className='border rounded-xs border-black p-3 hover:cursor-pointer'>signup using google google</button>
</div>
 <div className='flex'>
            <p className='text-blackcream  font-medium'> Already have an account <span className="cursor-pointer font-bold text-rose-400 ml-1" onClick={()=>navigate('/login')}>LogIn</span></p>

          </div>
        </form>
    </div>
    </div>
    </>
  )
}
