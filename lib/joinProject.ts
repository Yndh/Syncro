import { prisma } from "./prisma";

export async function joinProject(userId: string, projectId: number) {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  if (!project) {
    return null;
  }

  const membership = await prisma.projectMembership.create({
    data: {
      project: {
        connect: {
          id: projectId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      role: "MEMBER",
    },
  });

  return membership.projectId;
}
