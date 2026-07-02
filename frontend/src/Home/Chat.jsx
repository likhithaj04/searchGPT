import React, { useState } from 'react'
import api from '../utils/api'
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
  const [showUploadMenu,setShowUploadMenu]=useState(false)
const [hasStarted, setHasStarted] = useState(false);


const handlleCLick = async () => {
  if (!data.trim()) return;

  const formData = new FormData();

  if (!hasStarted) setHasStarted(true);

  formData.append("question", data);

  if (threadId) {
    formData.append("threadId", threadId);
  }

  if (file) {
    formData.append("file", file);
  }

  // Save current values before clearing state
  const currentText = data;
  const currentFile = file;

  // Add the user's message immediately
  setMessages(prev => [
    ...prev,
    {
      role: "user",
      content: currentText,
      file: currentFile
        ? {
            name: currentFile.name,
            type: currentFile.type,
          }
        : null,
    },
  ]);

  // Clear UI
  setData("");
  setFile(null);
  setShowUploadMenu(false);
  setLoading(true);

  try {
    const res = await api.post(
      "/data/search",
      formData,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: res.data.data,
      },
    ]);

    setThreadId(res.data.chatId);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setData(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

  };

const handleFile=(e)=>{
  const selectedFile=e.target.files[0]

  if(!selectedFile) return
  setFile(selectedFile)
  setShowUploadMenu(false)
}


useEffect(() => {
    setThreadId(chatId || null);

    if (!chatId) {
      setMessages([])
      setFile(null)
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
        // console.log("res............", res.data)
        const chat = res.data.data?.[0]
        // console.log("chats", chat);

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
 <div className="h-screen flex flex-1 flex-col bg-gray-300 overflow-hidden">
  <UserSession session={session} setMessages={setMessages} logout={logout} />

  <div className="flex-1 min-h-0 overflow-y-auto pt-4">
    <Message messages={messages} loading={loading} chatId={chatId} />
  </div>
  
      <ChatInput
        handleChange={handleChange}
        handlleCLick={handlleCLick}
        data={data}
        setData={setData}
        showUploadMenu={showUploadMenu}
        setShowUploadMenu={setShowUploadMenu}
        handleFile={handleFile}
        file={file}
        setFile={setFile}
        hasStarted={hasStarted}
      />
   

    </div>
  )
}
