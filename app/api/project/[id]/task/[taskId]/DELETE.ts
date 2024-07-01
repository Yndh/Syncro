import { auth } from "@/auth";
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

  const id = res.params.id;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    return new NextResponse(JSON.stringify({ error: "Invalid id format." }), {
      status: 400,
    });
  }

  const taskId = res.params.taskId;
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

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });

    if (!project) {
      return new NextResponse(JSON.stringify({ error: "Project not found." }), {
        status: 404,
      });
    }

    const isOwnerOrAdmin = project.members.some((member) => {
      return (
        member.userId === session.user?.id &&
        (member.role === "OWNER" || member.role === "ADMIN")
      );
    });

    if (!isOwnerOrAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access to project." }),
        {
          status: 403,
        }
      );
    }
  } catch (e) {
    console.error(`Error creating/updating task: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }

  try {
    const deleteTask = await prisma.task.delete({
      where: { id: taskId2 },
    });

    const tasks = await prisma.task.findMany({
      where: { projectId: projectId },
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
