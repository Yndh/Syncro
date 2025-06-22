import { TaskStatus } from "@/app/types/interfaces";
import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface UpdateStageReqBody {
  id: number;
  taskId: number;
  isCompleted: boolean;
}

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
  };
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

  const { id } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const body: UpdateStageReqBody = await req.json();
  const { id: stageId, taskId, isCompleted } = body;

  try {
    const admin = await isAdmin(id);

    const taskStage = await prisma.taskStage.findUnique({
      where: { id: stageId },
      include: {},
    });

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignedTo: true, stages: true },
    });

    if (!taskStage) {
      return new NextResponse(
        JSON.stringify({ error: "Task stage not found." }),
        {
          status: 404,
        }
      );
    }

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

    if (
      !admin &&
      (existingTask.taskStatus == "REVIEWING" ||
        existingTask.taskStatus == "DONE")
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access to task." }),
        {
          status: 403,
        }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        taskStatus:
          isCompleted && existingTask.taskStatus == TaskStatus.TO_DO
            ? TaskStatus.ONGOING
            : existingTask.taskStatus,
        stages: {
          update: {
            where: { id: stageId },
            data: { isCompleted: isCompleted },
          },
        },
      },
      include: {
        stages: true,
        assignedTo: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        task: updatedTask,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(`Error updating task stage: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
