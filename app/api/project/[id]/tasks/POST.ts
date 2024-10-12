import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface CreateTaskReqBody {
  title: string;
  description?: string;
  assignedMembers: string[]; // Ids
  dueDate?: Date;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  stages: string[];
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

  const body: CreateTaskReqBody = await req.json();
  const {
    stages = [],
    assignedMembers = [],
    title,
    description = "",
    dueDate,
    priority,
  } = body;

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

  try {
    const admin = await isAdmin(projectId);

    if (!admin) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access to project." }),
        {
          status: 403,
        }
      );
    }

    const projectMembers = await prisma.projectMembership.findMany({
      where: { projectId: projectId },
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

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        dueTime: dueDate,
        priority: priority,
        assignedTo: {
          connect: assignedMembers.map((memberId) => ({ id: memberId })),
        },
        project: {
          connect: { id: projectId },
        },
        stages: {
          create: body.stages.map((title) => ({
            title: title.trim() as string,
            isCompleted: false,
          })),
        },
      },
      include: {
        assignedTo: true,
        stages: true,
      },
    });
    return new NextResponse(
      JSON.stringify({
        task: newTask,
      }),
      { status: 201 }
    );
  } catch (e) {
    console.error(`Error creating task: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
