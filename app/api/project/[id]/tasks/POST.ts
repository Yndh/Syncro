import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface reqBody {
  id?: number;
  title: string;
  description?: string;
  assignedMembers: string[]; // Ids
  dueTime?: Date;
  taskStatus?: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

interface CreateTaskReqBody {
  title: string;
  description?: string;
  assignedMembers: string[]; // Ids
  dueTime?: Date;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

interface UpdateTaskReqBody {
  id: number;
  title?: string;
  description?: string;
  assignedMembers?: string[];
  dueTime?: Date;
  taskStatus?: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
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

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project || project.ownerId !== session.user.id) {
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

  const body: CreateTaskReqBody | UpdateTaskReqBody = await req.json();

  try {
    if ("id" in body) {
      const existingTask = await prisma.task.findUnique({
        where: { id: body.id },
        include: { assignedTo: true },
      });

      if (!existingTask) {
        return new NextResponse(JSON.stringify({ error: "Task not found." }), {
          status: 404,
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id: body.id },
        data: {
          title: body.title?.trim(),
          description: body.description,
          dueTime: body.dueTime,
          taskStatus: body.taskStatus,
          assignedTo: body.assignedMembers?.length
            ? {
                set: body.assignedMembers.map((memberId) => ({ id: memberId })),
              }
            : undefined,
        },
        include: {
          assignedTo: true,
        },
      });
      return new NextResponse(
        JSON.stringify({
          task: updatedTask,
        }),
        { status: 200 }
      );
    } else {
      const newTask = await prisma.task.create({
        data: {
          title: body.title.trim(),
          description: body.description?.trim(),
          dueTime: body.dueTime,
          assignedTo: {
            connect: body.assignedMembers.map((memberId) => ({ id: memberId })),
          },
          project: {
            connect: { id: projectId },
          },
        },
        include: {
          assignedTo: true,
        },
      });
      return new NextResponse(
        JSON.stringify({
          task: newTask,
        }),
        { status: 201 }
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
}
