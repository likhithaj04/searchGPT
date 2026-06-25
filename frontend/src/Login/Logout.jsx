import {useEffect} from 'react'
import supabase from '../Auth/supabase';


export default function Logout() {
   useEffect(() => {
    console.log("useffect worked");
  
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (session) {
        console.log("Logged In");
        console.log(session.user);
                console.log("session id",session.access_token);

      }
    }
  
    checkUser();
  }, []);
    const handleLogout = async () => {
            console.log("ccc");
            
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error.message);
    return;
  }

  console.log("Logged out");
};
    

  return (
    <div>
      <button 
      className='border rounded-2xl border-black hover:cursor-pointer'
      onClick={handleLogout}>Logout</button>
    </div>
  )
}
