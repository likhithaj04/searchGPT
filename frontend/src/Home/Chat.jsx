import React, { useState } from 'react'
import api from '../utils/api'

export default function Chat() {
const [threadId] = useState(
  () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
);
  const [data,setData]=useState('')
  const [messages,setMessages]=useState([])
  const [loading,setLoading]=useState(false)

 const handlleCLick = async () => {
  if (!data.trim()) return;
  const userMessage = data;

  setMessages(prev => [
    ...prev,
    {
      role: "user",
      text: userMessage
    }
  ]);

  setData("");
setLoading(true)
  try {
    // console.log("res.sent");
    const res = await api.post("/search", {
      question: userMessage,
      threadId:threadId
    });
setLoading(false)
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
      text: res.data.data      }
    ]);
   
  } catch (err) {
    console.log(err);
  }
};

    const handleChange = (e) => {
    setData(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

  };

  return (
   <div className="h-screen flex flex-col bg-gray-300">
      
      <div className="flex-1 overflow-y-auto p-4">


  {messages.map((msg, index) => (
    <div
      key={index}
      className={`flex mb-3 ${
        msg.role === "user"
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          msg.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-white"
        }`}
      >
        {msg.text}
      </div>
    </div>
  ))}
        {loading && (
  <div className="flex justify-start mb-3">
    <div className="bg-white px-4 py-2 rounded-2xl flex gap-1">
            <span className="animate-pulse">Thinking</span>
      <span className="animate-pulse delay-200">.</span>
            <span className="animate-pulse delay-400">.</span>
      <span className="animate-pulse delay-500">.</span>

    </div>
  </div>
)}

</div>

      <div className="p-4">
        <div className="relative max-w-4xl mx-auto">
              <i className="fa-solid fa-plus absolute left-4 top-1/2 -translate-y-1/2 text-xl cursor-pointer"></i>
 <textarea
  rows={1}
  placeholder="Type a message..."
 value={data}
 onChange={handleChange}
  className="
    w-full
    border border-slate-900
    rounded-2xl
    pl-12 pr-12 py-4
    text-lg
    resize-none
    overflow-hidden
    min-h-15
    max-h-50
  "
/>
          <i className="fa-solid fa-magnifying-glass-arrow-right absolute right-4 top-1/2 -translate-y-1/2 text-2xl cursor-pointer" onClick={handlleCLick}></i>
        </div>
      </div>

    </div>
  )
}
