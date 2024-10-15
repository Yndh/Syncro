"use client";

import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="loginContainerr">
      <div className="login">
        <div className="logo">
          <Image src="/logo.svg" alt="Logo" width={25} height={25} />
          <h3>Syncro</h3>
        </div>

        <div className="header">
          <h2>Access Your Projects with Ease</h2>
          <p>
            Log in to your account to streamline your workflow, collaborate with
            your team, and stay organized.
          </p>
        </div>

        <button onClick={() => signIn("github", { callbackUrl: "/app" })}>
          <FontAwesomeIcon icon={faGithub as IconDefinition} />
          Sign in using GitHub
        </button>
        <span className="or">or</span>
        <button>
          <FontAwesomeIcon icon={faGoogle as IconDefinition} />
          Sign in using Google
        </button>
      </div>
    </div>
  );
}
