import { signIn } from "@/auth";
import { redirect } from "next/navigation";

const SignInButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" });
      }}
    >
      <button type="submit">Signin with GitHub</button>
    </form>
  );
};
export default SignInButton;
