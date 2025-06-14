import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
    taskId: string;
  };
}

export async function mDELETE(req: Request, res: ResponseInterface) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ error: "The user is not authenticated" }),
      {
        status: 401,
      }
    );
  }

  const { id, taskId } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  if (!taskId) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const taskId2 = parseInt(taskId); // taskId was so good that they made a sequel 🔥🔥
  if (isNaN(taskId2)) {
    return new NextResponse(JSON.stringify({ error: "Invalid id format." }), {
      status: 400,
    });
  }

  const admin = isAdmin(id);
  if (!admin) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to project." }),
      {
        status: 403,
      }
    );
  }

  try {
    const deleteTask = await prisma.task.delete({
      where: { id: taskId2 },
    });

    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      include: {
        assignedTo: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        tasks: tasks,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(`Error deleting task: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
