import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
   <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1  ">
          <Outlet />
        </div>
      </div>
  );
}