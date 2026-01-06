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

interface UpdateTaskReqBody {
  title: string;
  description: string;
  assignedMembers: string[];
  dueDate: Date;
  taskStatus: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  stages: { id?: number; title?: string; isCompleted?: boolean }[];
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

  const body: UpdateTaskReqBody = await req.json();
  const {
    stages = [],
    assignedMembers = [],
    title = "",
    description = "",
    dueDate,
    taskStatus,
    priority,
  } = body;

  const admin = await isAdmin(id);
  if (!admin && body.taskStatus == "DONE") {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to task." }),
      {
        status: 403,
      }
    );
  }

  if (title.trim().length < 1 || title.trim().length > 100) {
    return new NextResponse(
      JSON.stringify({
        error: "Task title must be between 1 and 100 characters",
      }),
      {
        status: 400,
      }
    );
  }

  if (description.trim().length > 400) {
    return new NextResponse(
      JSON.stringify({ error: "Description must be at most 400 characters" }),
      {
        status: 400,
      }
    );
  }

  if (assignedMembers.length < 1) {
    return new NextResponse(
      JSON.stringify({ error: "No members assigned to task" }),
      {
        status: 400,
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

  const validMembers = projectMembers.map((member) => member.userId);
  const invalidMembers = assignedMembers.filter(
    (memberId) => !validMembers.includes(memberId)
  );

  if (invalidMembers.length > 0) {
    return new NextResponse(
      JSON.stringify({
        error: "Some assigned members are not part of the project.",
        invalidMembers,
      }),
      { status: 400 }
    );
  }

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
    const stageCreate = stages
      .filter((stage) => stage.id == null)
      .map((stage) => ({
        title: stage.title?.trim() as string,
        isCompleted: stage.isCompleted ?? false,
      }));

    const stageUpdate = stages
      .filter((stage) => stage.id != null)
      .map((stage) => ({
        where: { id: stage.id },
        data: {
          title: stage.title,
          isCompleted: stage.isCompleted ?? false,
        },
      }));

    const stageDelete = existingTask.stages
      .filter((stage) => !stages.some((ps) => ps.id === stage.id))
      .map((stage) => ({ id: stage.id as number }));

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title.trim(),
        description: description.trim(),
        dueTime: dueDate,
        taskStatus: taskStatus ?? undefined,
        priority: priority,
        assignedTo: assignedMembers?.length
          ? {
              set: assignedMembers.map((memberId) => ({ id: memberId })),
            }
          : undefined,
        stages: {
          create: stageCreate,
          update: stageUpdate,
          deleteMany: stageDelete,
        },
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
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to update task" }),
      {
        status: 500,
      }
    );
  }
}
