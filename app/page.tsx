import { auth } from "@/auth";
import SignInButton from "./components/signIn";
import SignOutButton from "./components/signOut";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <header>
        <h1>Project manager</h1>
        {session?.user ? (
          <div className="user">
            <Image
              src={session?.user.image as string}
              alt="Profile Image"
              width={25}
              height={25}
            />
            <p>{session.user.name}</p>
            <SignOutButton />
          </div>
        ) : (
          <SignInButton />
        )}
      </header>
      <main>{session?.user ? <h1>Helo 👋</h1> : <h1>Sign in 🗣</h1>}</main>
    </>
  );
}
