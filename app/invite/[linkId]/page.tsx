import { JoinProjectButton } from "@/app/components/JoinProjectButton";
import { Invite } from "@/app/types/interfaces";
import Link from "next/link";

interface ProjectParams {
  params: {
    linkId: string;
  };
}

const InvitePage = async ({ params }: ProjectParams) => {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/invite/${params.linkId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return (
      <div className="invite__container">
        <div className="invite">
          <h2>Invalid invite</h2>
          <p>We couldn't retrieve the invite details. Please check the link.</p>
          <Link href={"/app"}>Go back to dashboard</Link>
        </div>
      </div>
    );
  }

  const data = await res.json();
  const invite: Invite = data.invite;

  if (!invite) {
    return (
      <div className="invite__container">
        <div className="invite">
          <h2>Invalid invite</h2>
          <p>We couldn't find the invite. Please check the link.</p>
          <Link href={"/app"}>Go back to dashboard</Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const expiresDate = invite.expires ? new Date(invite.expires) : null;

  if (expiresDate && expiresDate < now) {
    return (
      <div className="invite__container">
        <div className="invite">
          <h2>Invalid invite</h2>
          <p>
            This invitation has already expired. Please ask for a new
            invitation.
          </p>
          <Link href={"/app"}>Go back to dashboard</Link>
        </div>
      </div>
    );
  }

  const maxUses = invite.maxUses ?? Infinity;
  if (invite.uses >= maxUses) {
    return (
      <div className="invite__container">
        <div className="invite">
          <h2>Invalid invite</h2>
          <p>
            This invitation has reached its maximum usage. Please ask for a new
            invitation.
          </p>
          <Link href={"/app"}>Go back to dashboard</Link>
        </div>
      </div>
    );
  }

  const pluralizeMembers = (count: number) =>
    count === 1 ? "member" : "members";

  return (
    <div className="invite__container">
      <div className="invite">
        <span>You're Invited by {invite.createdBy.name}</span>
        <h2>{invite.project.name}</h2>
        <p>
          {invite.project.members.length}{" "}
          {pluralizeMembers(invite.project.members.length)}
        </p>
        <JoinProjectButton id={params.linkId} />
      </div>
    </div>
  );
};

export default InvitePage;
