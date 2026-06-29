import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";


export default function Sidebar() {
  const navigate=useNavigate()
  const { session } = useAuth();

  const [titles, setTitles] = useState([]);

  useEffect(() => {
    if (!session) {
      setTitles([])
            return;

    }

    async function getTitles() {
      try {
        const res = await api.post(
          "/data/title",
          {},
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
// console.log(res.data);
// console.log(titles); 
// console.log(Array.isArray(titles));
// console.log(titles[1]);
        setTitles(res.data.data);
      } catch (err) {
        console.log(err);
      }
    }

    getTitles();
  }, [session?.user?.id]);

  // const handleChat=(chat)=>{
  //    console.log(chat.id);
  // }

  const handleNewChat=()=>{
      
    navigate("/")
  }
  return (
    <div className="w-64 bg-[#202123] text-white flex flex-col gap-3 p-3">
      <h2 className="text-xl font-semibold mb-8">SearchGPT</h2>
<div className="space-y-3">
  <button className="hover:text-slate-300" onClick={handleNewChat}>New Chat</button>
</div>
      <div className=" flex flex-col items-start gap-3">
        {titles.map((chat) => (
  <button key={chat.id} onClick={()=>navigate(`/${chat.id}`)}
  className="hover:text-slate-400 hover:cursor-pointer">
    {chat.title}
  </button>
))}
      </div>
    </div>
  );
}