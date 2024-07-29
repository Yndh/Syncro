import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";


interface CreateTaskReqBody {
  title: string;
  description?: string;
  assignedMembers: string[]; // Ids
  dueTime?: Date;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  stages: string[]
}

interface UpdateTaskReqBody {
  id: number;
  title?: string;
  description?: string;
  assignedMembers?: string[];
  dueTime?: Date;
  taskStatus?: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  stages?: { id?: number; title?: string; isCompleted?: boolean }[];
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

  const body: CreateTaskReqBody | UpdateTaskReqBody = await req.json();

  try {
    if ("id" in body) {
      const admin = await isAdmin(projectId);
      if (!admin && body.taskStatus == "DONE") {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access to task." }),
          {
            status: 403,
          }
        );
      }

      const existingTask = await prisma.task.findUnique({
        where: { id: body.id },
        include: { assignedTo: true, stages: true },
      });

      if (!existingTask) {
        return new NextResponse(JSON.stringify({ error: "Task not found." }), {
          status: 404,
        });
      }

      if(!(existingTask.assignedTo.some(user => user.id === session.user?.id)) && !admin){
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access to task." }),
          {
            status: 403,
          }
        );
      }
      
      const providedStages = body.stages ?? [];

      const stageCreate = providedStages
        .filter(stage => stage.id == null)
        .map(stage => ({
          title: stage.title?.trim() as string,
          isCompleted: stage.isCompleted ?? false,
        }));

      const stageUpdate = providedStages
        .filter(stage => stage.id != null)
        .map(stage => ({
          where: { id: stage.id! },
          data: {
            title: stage.title,
            isCompleted: stage.isCompleted ?? false,
          },
        }));

      const stageDelete = existingTask.stages
        .filter(stage => !providedStages.some(ps => ps.id === stage.id))
        .map(stage => ({ id: stage.id as number }));

      const updatedTask = await prisma.task.update({
        where: { id: body.id },
        data: {
          title: body.title?.trim(),
          description: body.description,
          dueTime: body.dueTime,
          taskStatus: body.taskStatus,
          priority: body.priority,
          assignedTo: body.assignedMembers?.length
            ? {
                set: body.assignedMembers.map((memberId) => ({ id: memberId })),
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
          stages: true
        },
      });
      return new NextResponse(
        JSON.stringify({
          task: updatedTask,
        }),
        { status: 200 }
      );
    } else {
      const admin = await isAdmin(projectId);
      
      if (!admin) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access to project." }),
          {
            status: 403,
          }
        );
      }

      const existingUsers = await prisma.user.findMany({
        where: {
          id: { in: body.assignedMembers },
        },
      });
      
      const validUserIds = new Set(existingUsers.map(user => user.id));
      const invalidUserIds = body.assignedMembers.filter(id => !validUserIds.has(id));
      
      if (invalidUserIds.length > 0) {
        return new NextResponse(
          JSON.stringify({ error: `Invalid user IDs: ${invalidUserIds.join(", ")}` }),
          { status: 400 }
        );
      }

      const newTask = await prisma.task.create({
        data: {
          title: body.title.trim(),
          description: body.description?.trim(),
          dueTime: body.dueTime,
          priority: body.priority,
          assignedTo: {
            connect: body.assignedMembers.map((memberId) => ({ id: memberId })),
          },
          project: {
            connect: { id: projectId },
          },
          stages: {
            create: body.stages.map(title => ({
              title: title.trim() as string,
              isCompleted: false,
            })),
          },
        },
        include: {
          assignedTo: true,
          stages: true
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
