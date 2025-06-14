import { auth } from "@/auth";
import { prisma } from "./prisma";

export default async function isOwner(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const isOwner = await prisma.projectMembership.findFirst({
    where: {
      projectId: projectId,
      userId: session.user.id,
      role: "OWNER",
    },
  });

  return isOwner ? true : false;
}
