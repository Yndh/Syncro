import SignInButton from "../components/signIn";

const signIn = () => {
  return (
    <div className="loginContainerr">
      <div className="loginFormContainer">
        <h2>Let's get Started!</h2>
        <p>Sign in and ship projects faster</p>

        <SignInButton />
      </div>
    </div>
  );
};

export default signIn;
