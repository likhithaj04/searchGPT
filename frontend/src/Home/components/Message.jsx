import {useRef,useEffect} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Message({ messages, loading ,chatId}) {
  const bottomRef = useRef(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);

  return (
    <div className="px-2 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto ">
      {/* {!chatId && (
        <div className=" h-full flex items-center justify-center "> 
        
        <p>Chat section, ask anything</p>

        </div>
      )} */}
      {messages.map((msg, index) => {
        const fileName = msg.file?.name || msg.file_name;
        const fileUrl = msg.file?.url || msg.file_url;

        return (
          <div
            key={index}
            className={`flex mb-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-100 md:max-w-250 px-4 py-2 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
            >
              {fileName && (
                <div
                  className={`mb-2 flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-400/40"
                      : "bg-gray-100"
                  }`}
                >
                  <i className="fa-solid fa-file"></i>

                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline truncate max-w-40"
                    >
                      {fileName}
                    </a>
                  ) : (
                    <span className="truncate max-w-40">
                      {fileName}
                    </span>
                  )}
                </div>
              )}

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
              </ReactMarkdown>
            </div>
          </div>
        );
      })}

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
  );
}