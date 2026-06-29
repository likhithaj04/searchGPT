import React, { useState } from 'react'
import api from '../utils/api'
import supabase from '../Auth/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthProvider';
import { useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  // const [threadId] = useState(
  //   () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  // );
  const navigate = useNavigate()
  const { chatId } = useParams();
  const { session, user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState('')
  const [messages, setMessages] = useState([])
  const [threadId, setThreadId] = useState(null);


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

      <div className="flex-1 overflow-y-auto p-4">
        {!session ? (
          <>
            <div className='flex justify-end gap-6'>
              <button className='border border-black rounded-r  px-2 hover:cursor-pointer hover:bg-slate-400' onClick={() => navigate("/login")}>Login</button>
              <button className='border border-black rounded-r  px-2 hover:cursor-pointer  hover:bg-slate-400' onClick={() => navigate("/signup")}>Signup</button>
            </div>
          </>
        ) : (
          <div className='flex justify-end gap-6'>

            <button
              className="border border-black text-black rounded px-4 py-2 mb-4"

              onClick={async () => {
                await logout();
                navigate("/");
                setMessages([])

              }}
            >
              Logout
            </button>
          </div>
        )}
        <div className='px-120'>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-3 p-3  ${msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
                }`}
            >
              <div
                className={`max-w-full px-4 py-2 rounded-2xl ${msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                  }`}
              >

                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>      </div>
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
