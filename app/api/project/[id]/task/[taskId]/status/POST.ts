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

interface UpdateStatusReq {
  taskStatus: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
}

export async function mPOST(req: Request, res: ResponseInterface) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ error: "The user is not authenticated" }),
      {
        status: 401,
      }
    );
  }

  const { id, taskId: taskIdPar } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  if (!taskIdPar) {
    return new NextResponse(
      JSON.stringify({
        error: "No task id is provided in the URL parameters.",
      }),
      {
        status: 400,
      }
    );
  }

  const taskId = parseInt(taskIdPar);
  if (isNaN(taskId)) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid task id format." }),
      {
        status: 400,
      }
    );
  }

  const body: UpdateStatusReq = await req.json();
  const { taskStatus } = body;

  const admin = await isAdmin(id);
  if (!admin && body.taskStatus == "DONE") {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to task." }),
      {
        status: 403,
      }
    );
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignedTo: true, stages: true },
  });

  if (!existingTask) {
    return new NextResponse(JSON.stringify({ error: "Task not found." }), {
      status: 404,
    });
  }

  if (
    !existingTask.assignedTo.some((user) => user.id === session.user?.id) &&
    !admin
  ) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to task." }),
      {
        status: 403,
      }
    );
  }

  const projectMembers = await prisma.projectMembership.findMany({
    where: { projectId: id },
  });

  if (
    !existingTask.assignedTo.some((user) => user.id === session.user?.id) &&
    !admin
  ) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to task." }),
      { status: 403 }
    );
  }

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        taskStatus: taskStatus,
      },
      include: {
        assignedTo: true,
        stages: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        task: updatedTask,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating user:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update task status" }),
      {
        status: 500,
      }
    );
  }
}
