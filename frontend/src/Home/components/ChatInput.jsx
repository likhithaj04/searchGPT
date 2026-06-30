import React from 'react'

export default function ChatInput({handleChange,handlleCLick,data,setData}) {
  return (
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
  )
}
