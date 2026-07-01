import React, { useRef } from 'react';

export default function ChatInput({ handleChange, handlleCLick, data, setData, showUploadMenu, handleFile, setShowUploadMenu, file, setFile }) {
  const fileInputRef = useRef(null);

  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-gray-300 px-2 pb-2 md:px-4 md:pb-4 pt-3">
      <div className="max-w-4xl mx-auto">

        {file && (
          <div className="mb-2 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
            <span className="truncate">{file.name}</span>
            <button className="ml-auto text-red-500" onClick={() => setFile(null)}>
              ✕
            </button>
          </div>
        )}

        <div className="relative">
          <i
            className="fa-solid fa-plus absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-lg md:text-xl cursor-pointer"
            onClick={() => setShowUploadMenu((prev) => !prev)}
          ></i>

          {showUploadMenu && (
            <div className="absolute bottom-16 left-0 w-48 md:w-56 bg-slate-300 rounded-md shadow-lg border py-2 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>PDF</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>Word Document</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>Image</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>Excel Spreadsheet</button>
            </div>
          )}

          <textarea
            rows={1}
            placeholder="Type a message..."
            value={data}
            onChange={handleChange}
            className="w-full border border-slate-900 rounded-2xl pl-9 md:pl-12 pr-9 md:pr-12 py-3 md:py-4 text-base md:text-lg resize-none overflow-hidden min-h-14 md:min-h-15 max-h-50"
          />

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,image/*"
            onChange={handleFile}
          />

          <i
            className="fa-solid fa-magnifying-glass-arrow-right absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl cursor-pointer"
            onClick={handlleCLick}
          ></i>
        </div>
      </div>
    </div>
  );
}