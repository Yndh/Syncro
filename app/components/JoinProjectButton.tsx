"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface JoinProjectInterface {
  id: string;
}

export const JoinProjectButton = ({ id }: JoinProjectInterface) => {
  const router = useRouter();

  const handleJoin = () => {
    fetch(`/api/invite/${id}/join`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(
            "Uh-oh! We couldn't complete your request to join the project. Please try again!"
          );
          return;
        }

        if (data.projectId) {
          router.push(`/app/projects/${data.projectId}`);
          toast.success(
            "Hooray! You've successfully joined the project! Let's get started!"
          );
        }
      });
  };

  return <button onClick={handleJoin}>Accept Invite</button>;
};
