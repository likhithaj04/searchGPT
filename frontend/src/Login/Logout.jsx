import React from 'react'
import supabase from '../Auth/supabase';


export default function Logout() {
  
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
