import Image from "next/image";
import Link from "next/link";
import ProjectPagePhoto from "@/public/project-page.png";
import LightProjectPagePhoto from "@/public/light-project-page.png";
import ProjectPageMobilePhoto from "@/public/project-page-mobile.png";
import LightProjectPageMobilePhoto from "@/public/light-project-page-mobile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsProgress,
  faHandshakeAngle,
  faHandshakeSimple,
  faNoteSticky,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";

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
            <Link href={"#about"}>About</Link>
          </li>
          <li>
            <Link href={"#howItWorks"}>How It Works</Link>
          </li>
          <li>
            <Link href={"#getStarted"}>Get Started</Link>
          </li>
        </ul>

        <Link href="/signIn">
          <button className="login">Sign in</button>
        </Link>
      </div>

      <div className="hero">
        <h1>
          Tame the Chaos, Conquer the Deadlines, and Enjoy Project Management!
        </h1>
        <p>
          The intuitive project management app designed to streamline your
          workflow, empower your team, and accelerate success in{" "}
          {new Date().getFullYear()} and beyond.
        </p>
        <Link href={"/app"}>
          <button>Get Started for Free Now!</button>
        </Link>
        <span>No credit card required. Forever free.</span>

        <Image
          src={ProjectPagePhoto.src}
          width={ProjectPagePhoto.width}
          height={ProjectPagePhoto.height}
          alt="Project Page Screenshot"
          className="desktop dark"
        />
        <Image
          src={LightProjectPagePhoto.src}
          width={LightProjectPagePhoto.width}
          height={LightProjectPagePhoto.height}
          alt="Project Page Screenshot"
          className="desktop light"
        />
        <Image
          src={ProjectPageMobilePhoto.src}
          width={ProjectPageMobilePhoto.width}
          height={ProjectPageMobilePhoto.height}
          alt="Project Page Screenshot"
          className="mobile dark"
        />
        <Image
          src={LightProjectPageMobilePhoto.src}
          width={LightProjectPageMobilePhoto.width}
          height={LightProjectPageMobilePhoto.height}
          alt="Project Page Screenshot"
          className="mobile light"
        />
      </div>

      <div className="about">
        <div id="about" className="scroll"></div>
        <p>Drowning in emails and endless spreadsheets?</p>
        <h1>Everything You Need to Succeed, Built-In.</h1>

        <div className="cards">
          <div className="card">
            <div className="icon">
              <FontAwesomeIcon icon={faHandshakeAngle} />
            </div>
            <h2>Create & Collaborate, Limitlessly.</h2>
            <p>
              Launch up to {process.env.MAX_PROJECTS} projects as you need and
              invite your entire team - no per-user fees, ever.
            </p>
          </div>
          <div className="card">
            <div className="icon">
              <FontAwesomeIcon icon={faBarsProgress} />
            </div>
            <h2>See Your Progress, Instantly.</h2>
            <p>
              Track tasks through clear &quot;To Do,&quot; &quot;Ongoing,&quot;
              &quot;Reviewing&quot;, and &quot;Done&quot; statuses. Drag and
              drop to update, keeping everyone in sync.
            </p>
          </div>
          <div className="card">
            <div className="icon">
              <FontAwesomeIcon icon={faSquareCheck} />
            </div>
            <h2> Break It Down, Build It Up.</h2>
            <p>
              Each task supports subtasks to ensure every detail is covered. Add
              notes, attachments, and more for complete clarity.
            </p>
          </div>
          <div className="card">
            <div className="icon">
              <FontAwesomeIcon icon={faNoteSticky} />
            </div>
            <h2> All Your Information, Always Accessible.</h2>
            <p>
              Keep project-related notes, ideas, and files directly within your
              tasks. No more searching through scattered documents.
            </p>
          </div>
        </div>
      </div>

      <div className="howItWorks">
        <div id="howItWorks" className="scroll"></div>

        <p>How It Works</p>
        <h1>Get Started in 3 Simple Steps.</h1>

        <div className="roadmap">
          <div className="step">
            <p>#1 Create Your Free Account.</p>
            <h2>Sign up in seconds – no credit card needed.</h2>
          </div>
          <div className="step">
            <p>#2 Launch Your First Project.</p>
            <h2>
              Set up your project, define your tasks, and invite your team
              members.
            </h2>
          </div>
          <div className="step">
            <p>#3 Start Getting Things Done!</p>
            <h2>
              Track progress, collaborate, and celebrate your team&apos;s
              achievements.
            </h2>
          </div>
        </div>
      </div>

      <div className="getStarted">
        <div id="getStarted" className="scroll"></div>

        <div className="join">
          <div className="center">
            <h1>Ready to Transform Your Team&apos;s Productivity?</h1>
            <p>
              Organize your projects, collaborate with your team, and crush your
              goals - all without spending a dime.
            </p>
          </div>
          <Link href={"/app"}>
            <button> Start Your Free Project Today!</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
