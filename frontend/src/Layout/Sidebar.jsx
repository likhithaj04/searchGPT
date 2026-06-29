import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../Context/AuthProvider";

export default function Sidebar() {
  const { session } = useAuth();

  const [titles, setTitles] = useState([]);

  useEffect(() => {
    if (!session) return;

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
console.log(res.data);
console.log(titles);
console.log(Array.isArray(titles));
console.log(titles[0]);
        setTitles(res.data.data);
      } catch (err) {
        console.log(err);
      }
    }

    getTitles();
  }, [session]);

  return (
    <div className="w-64 bg-[#202123] text-white flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-8">SearchGPT</h2>

      <div className="space-y-2">
        {titles.map((chat, index) => (
  <button key={index}>
    {chat.title}
  </button>
))}
      </div>
    </div>
  );
}