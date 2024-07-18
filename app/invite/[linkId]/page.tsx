"use client";

import { Invite } from "@/app/types/interfaces";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
          alert(data.error);
          setIsValid(false);
          setIsLoading(false);
          return;
        }

        if (data.invite) {
          const dataInvite: Invite = data.invite;
          setIsLoading(false);

          const currentDate = new Date();
          const expiresDate = dataInvite.expires
            ? new Date(dataInvite.expires)
            : null;

          if (expiresDate && expiresDate <= currentDate) {
            alert("expired mf");
            setIsValid(false);
            return;
          }

          if (
            !(dataInvite.maxUses ?? Infinity) === null ||
            !(dataInvite.uses < (dataInvite.maxUses ?? Infinity))
          ) {
            alert("bruh used");
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
      return "członek";
    } else {
      return "członków";
    }
  };

  const handleJoin = () => {
    fetch(`/api/invite/${params.linkId}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        if (data.projectId) {
          router.push(`/app/projects/${data.projectId as number}`);
        }
      });
  };

  return (
    <>
      {isLoading && isValid && <h1>Loading..</h1>}
      {isValid && !isLoading && (
        <div className="invite">
          <span>{invite?.createdBy.name} zaprasza cie do dołączenia</span>
          <h2>{invite?.project.name}</h2>
          <p>
            {invite?.project.members.length}{" "}
            {pluralizeMembers(invite?.project.members.length ?? 1)}
          </p>

          <button onClick={handleJoin}>Dołącz</button>
        </div>
      )}
      {!isValid && !isLoading && (
        <div className="invite">
          <h2>Nieprawidłowe zaproszenie</h2>
          <p>To zaproszenie mogło już wygasnąć...</p>

          <button onClick={() => router.push("/app")}>
            Wróć do dashboardu
          </button>
        </div>
      )}
    </>
  );
};

export default InvitePage;
