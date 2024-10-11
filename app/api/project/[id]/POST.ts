import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import isMember from "@/lib/isMember";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
  };
}

interface ReqBody {
  name: string;
  description: string;
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

  const admin = isAdmin(projectId);
  if (!admin) {
    return new NextResponse(JSON.stringify({ error: "Access denied." }), {
      status: 403,
    });
  }

  const body: ReqBody = await req.json();
  const { name, description } = body;
  if (!name && !description) {
    return new NextResponse(
      JSON.stringify({ error: "You need at least one value to edit." }),
      {
        status: 400,
      }
    );
  }
  if (body.name.trim().length > 100) {
    return new NextResponse(
      JSON.stringify({
        error: "Project name must be at most 100 characters",
      }),
      {
        status: 400,
      }
    );
  }
  if (body.description.trim().length > 400) {
    return new NextResponse(
      JSON.stringify({ error: "Description must be at most 400 characters" }),
      {
        status: 400,
      }
    );
  }

  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name,
        description: description,
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
          },
        },
        notes: {
          include: {
            createdBy: true,
          },
        },
        projectInvitations: {
          include: {
            project: true,
            createdBy: true,
          },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        project: project,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(`Error updating project: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
