import React from 'react'
import { useNavigate} from 'react-router-dom';

export default function UserSession({session,setMessages,logout}) {
      const navigate = useNavigate()

  return (
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


      </div>
  )
}
