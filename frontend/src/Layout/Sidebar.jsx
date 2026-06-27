import React, { useEffect } from 'react'
import api from '../utils/api'

export default function Sidebar() {
  useEffect(()=>{
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
    console.log("sesssion",session.id);
    

    // const res=await api.post("/data/title",
    // {
    //   id:"session.id"
    // }
    // )
  }})
  
  return (
    <div className="w-64 bg-[#202123] text-white flex flex-col p-4">

      <h2 className="text-xl font-semibold mb-8">SearchGPT</h2>
    </div>
  )
}
