import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/sidebar";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="dashboard">
      <h1>app 👍</h1>
      <Link href={"/app"}>Go to app</Link>
    </div>
  );
}
