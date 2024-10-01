import { auth } from "@/auth";
import { NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function mGET(req: Request, res: NextApiResponse) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ error: "The user is not authenticated" }),
      {
        status: 401,
      }
    );
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        assignedTo: true,
        project: true,
        stages: true,
      },
    });

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            assignedTo: true,
            stages: true,
          },
        },
        notes: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({ tasks: tasks, projects: projects }),
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error("Error getting user data:", e);
    return new NextResponse(
      JSON.stringify({ error: `Failed getting user data (${e})` }),
      {
        status: 500,
      }
    );
  }
}
