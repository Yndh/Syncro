import { auth } from "@/auth";
import { prisma } from "./prisma";

export default async function isAdmin(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const isAdmin = await prisma.projectMembership.findFirst({
    where: {
      projectId: projectId,
      userId: session.user.id,
      role: {
        in: ["ADMIN", "OWNER"],
      },
    },
  });

  return isAdmin ? true : false;
}
