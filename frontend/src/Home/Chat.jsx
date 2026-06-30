import React, { useState } from 'react'
import api from '../utils/api'
import supabase from '../Auth/supabase';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthProvider';
import { useEffect } from 'react';
import ChatInput from './components/ChatInput';
import Message from './components/Message';
import UserSession from './components/UserSession';

export default function Chat() {
 
  const { chatId } = useParams();
  const { session, user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState('')
  const [messages, setMessages] = useState([])
  const [threadId, setThreadId] = useState(null);
  const [file,setFile]=useState(null)


const handlleCLick = async () => {
    if (!data.trim()) return;
    const userMessage = data;

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: userMessage
      }
    ]);

    setData("");
    setLoading(true)
    try {
      const res = await api.post("/data/search", {
        question: userMessage,
        threadId: threadId
      },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      setLoading(false)
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: res.data.data
        }
      ]);
      setThreadId(res.data.chatId)
      //  console.log("Threadid.........",threadId)
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setData(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

  };




useEffect(() => {
    if (!chatId) {
      setMessages([])
      return
    }
    async function loadChats() {
      try {
        const res = await api.post(`/data/${chatId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
        console.log("res............", res.data)
        const chat = res.data.data?.[0]
        console.log("chats", chat);

        setMessages(Array.isArray(chat?.messages) ? chat.messages : []);
        console.log("messages", messages);

      }
      catch (err) {
        console.log(err);
      }
    }
    loadChats()
}, [chatId])



  return (
    <div className="h-screen flex flex-col bg-gray-300">

      <UserSession
      session={session}
      setMessages={setMessages}
      logout={logout}
      />
   
      <Message
         messages={messages}
         loading={loading}
      />

      <ChatInput
        handleChange={handleChange}
        handlleCLick={handlleCLick}
        data={data}
        setData={setData}
      />
   

    </div>
  )
}
