import React from 'react'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Message({messages,loading}) {
  return (
      
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
      
     
  )
}
