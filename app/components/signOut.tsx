import { signOut } from "next-auth/react";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SignOutButton = () => {
  return (
    <form
      action={() => {
        signOut();
      }}
    >
      <button type="submit">
        <FontAwesomeIcon icon={faRightFromBracket} />
      </button>
    </form>
  );
};
export default SignOutButton;
