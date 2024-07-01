import Image from "next/image";
import { ProjectMembership } from "../types/interfaces";

interface MembersListProps {
  members: ProjectMembership[];
}

export const MembersList = ({ members }: MembersListProps) => {
  return (
    <div className="membersContainer">
      <h2>Members</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <Image
              src={member.user.image}
              alt={member.user.name}
              width={40}
              height={40}
            />
            <div className="details">
              <p>
                {member.user.name} <span className="role">{member.role}</span>
              </p>
              <span>{member.user.email}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
