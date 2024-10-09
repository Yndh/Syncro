import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
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

    return new NextResponse(
      JSON.stringify({ tasks: tasks }),
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error("Error getting user tasks:", e);
    return new NextResponse(
      JSON.stringify({ error: `Failed getting user tasks (${e})` }),
      {
        status: 500,
      }
    );
  }
}
