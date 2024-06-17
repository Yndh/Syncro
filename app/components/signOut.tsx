import { signOut } from "@/auth";

const SignOutButton = () => {
  return (
    <form
      action={() => {
        signOut();
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  );
};
export default SignOutButton;
