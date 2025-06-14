import { auth } from "@/auth";
import { prisma } from "./prisma";

export default async function isMember(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const isMember = await prisma.projectMembership.findFirst({
    where: { projectId: projectId, userId: session.user.id },
  });

  return isMember ? true : false;
}
