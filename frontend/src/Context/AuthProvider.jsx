import {createContext,useContext,useEffect,useState} from 'react'
import supabase from '../Auth/supabase'

const AuthContext=createContext();

export default function AuthProvider({children}) {
    const[session, setSession]=useState(null)
    const [user,setUser]=useState(null)  
    const [loading,setLoading]=useState(false)

    useEffect(()=>{
   async function loadSession(){
      
    const{
      data:{session},
    }=await supabase.auth.getSession();

    setSession(session)
    setUser(session?.user??null)
          setLoading(false);

   }
   loadSession();
    

   const {
    data:{subscription}
   }=supabase.auth.onAuthStateChange((_event,session)=>{
    setSession(session);
   setUser(session?.user ?? null);

   })
       return () => subscription.unsubscribe();

   },[])

  return (
    <AuthContext.Provider
    value={{
      session,
      user,
      loading
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth=()=>useContext(AuthContext)
