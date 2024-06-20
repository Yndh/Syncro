import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
  };
}

export async function mGET(req: Request, res: ResponseInterface) {
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
      include: {
        members: true,
        owner: true,
        Tasks: true
      },
    });

    if (!project) {
      return new NextResponse(JSON.stringify({ error: "Project not found." }), {
        status: 404,
      });
    }

    const isOwner = project.ownerId == session.user.id;
    const isMember = project.members.some(
      (member) => member.id == session.user?.id
    );

    if (isOwner || isMember) {
      return new NextResponse(
        JSON.stringify({ project: project, owner: isOwner }),
        {
          status: 200,
        }
      );
    } else {
      return new NextResponse(JSON.stringify({ error: "Access denied." }), {
        status: 403,
      });
    }
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
      }
    );
  }
}
