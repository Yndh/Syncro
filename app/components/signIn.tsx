import { signIn } from "@/auth";

const SignInButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <button type="submit">Signin with GitHub</button>
    </form>
  );
};
export default SignInButton;
