import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="landing" id="home">
      <div className="navbar">
        <div className="logo">
          <Image src="/logo.svg" alt="Logo" width={35} height={35} />
          <h1>Syncro</h1>
        </div>

        <ul>
          <li>
            <Link href={"#home"}>Home</Link>
          </li>
          <li>
            <Link href={"#home"}>Home</Link>
          </li>
          <li>
            <Link href={"#home"}>Home</Link>
          </li>
        </ul>

        <button className="login">
          <Link href="/signIn">Sign in</Link>
        </button>
      </div>

      <div className="hero">
        <h1>
          Tame the Chaos, Conquer the Deadlines, and Actually Enjoy Project
          Management
        </h1>
        <p>
          Managing projects shouldn&apos;t feel like a high-stakes juggling act
          with flaming swords. With our tool, you&apos;ll turn chaos into
          clarity, keep your team on the same page, and still have time for a
          coffee that&apos;s actually hot
        </p>
        <button>
          <Link href={"/app"}>Start Organizing the Fun!</Link>
        </button>
      </div>
    </div>
  );
}
