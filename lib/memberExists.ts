import { prisma } from "./prisma";

export default async function memberExists(projectId: number, userId: string) {
  const memberExists = await prisma.projectMembership.findFirst({
    where: { projectId: projectId, userId: userId },
  });

  return memberExists ? true : false;
}
