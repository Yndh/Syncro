"use client";

import { Invite } from "@/app/types/interfaces";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ProjectParams {
  params: {
    linkId: string;
  };
}

const InvitePage = ({ params }: ProjectParams) => {
  const router = useRouter();

  const [invite, setInvite] = useState<Invite>();
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/invite/${params.linkId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setIsValid(false);
          setIsLoading(false);
          return;
        }

        if (data.invite) {
          const dataInvite: Invite = data.invite;
          setIsLoading(false);

          const now = new Date();
          const expiresDate = dataInvite.expires
            ? new Date(dataInvite.expires)
            : null;

          if (expiresDate && expiresDate < now) {
            setIsValid(false);
            return;
          }

          if (
            !(dataInvite.maxUses ?? Infinity) === null ||
            !(dataInvite.uses < (dataInvite.maxUses ?? Infinity))
          ) {
            setIsValid(false);
            return;
          }

          setInvite(dataInvite);
          setIsValid(true);
        }
      });
  }, []);

  const pluralizeMembers = (count: number) => {
    if (count === 1) {
      return "member";
    } else {
      return "members";
    }
  };

  const handleJoin = () => {
    fetch(`/api/invite/${params.linkId}/join`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Uh-oh! We couldn't complete your request to join the project. Please try again!")
          return;
        }

        if (data.projectId) {
          router.push(`/app/projects/${data.projectId}`);
          toast.success("Hooray! You've successfully joined the project! Let's get started!")
        }
      });
  };

  return (
    <>
      {isLoading && isValid && <h1>Loading..</h1>}
      {isValid && !isLoading && (
        <div className="invite">
          <span>{invite?.createdBy.name} invites you to join</span>
          <h2>{invite?.project.name}</h2>
          <p>
            {invite?.project.members.length}{" "}
            {pluralizeMembers(invite?.project.members.length ?? 1)}
          </p>

          <button onClick={handleJoin}>Join Project</button>
        </div>
      )}
      {!isValid && !isLoading && (
        <div className="invite">
          <h2>Invalid invite</h2>
          <p>This invitation has already expired...</p>

          <button onClick={() => router.push("/app")}>
            Go back to dashboard
          </button>
        </div>
      )}
    </>
  );
};

export default InvitePage;
