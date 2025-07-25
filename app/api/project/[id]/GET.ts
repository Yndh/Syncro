import { auth } from "@/auth";
import isMember from "@/lib/isMember";
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

  const { id } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const membership = isMember(id);

  if (!membership) {
    return new NextResponse(JSON.stringify({ error: "Access denied." }), {
      status: 403,
    });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            assignedTo: true,
            stages: true,
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

    if (!project) {
      return new NextResponse(JSON.stringify({ error: "Project not found." }), {
        status: 404,
      });
    }

    const me = project.members.find(
      (member) => member.userId === session.user?.id
    );
    if (!me) {
      return new NextResponse(JSON.stringify({ error: "Member not found." }), {
        status: 404,
      });
    }

    return new NextResponse(
      JSON.stringify({
        project: project,
        role: me?.role,
        membershipId: me?.id,
      }),
      {
        status: 200,
      }
    );
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
      }
    );
  }
}
