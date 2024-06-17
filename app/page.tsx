import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/sidebar";

export default async function Home() {
  return (
    <div className="dashboard">
      <h1>app 👍</h1>
    </div>
  );
}
