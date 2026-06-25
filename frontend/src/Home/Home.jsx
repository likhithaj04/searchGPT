import useEffect from 'react'
import Chat from './Chat'
import supabase from '../Auth/supabase';

export default function Home() {
 const useEffect=(() => {
  console.log("useffect worked");
  
  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      console.log(user);
      console.log(user.id);
      console.log(user.email);
    }
  }

  init();
}, []);
  return (
    <>
    <Chat/>
    </>
  )
}
