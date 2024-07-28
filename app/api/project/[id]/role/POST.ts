import { ProjectRole } from "@/app/types/interfaces";
import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import memberExists from "@/lib/memberExists";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { connect } from "http2";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ReqBody {
  membershipId: number;
  role: ProjectRole;
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
      JSON.stringify({
        error: "No project id is provided in the URL parameters.",
      }),
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

  const body: ReqBody = await req.json();
  const { membershipId, role } = body;

  if (!membershipId) {
    return new NextResponse(
      JSON.stringify({ error: "No membership id is provided in body." }),
      {
        status: 400,
      }
    );
  }

  if (!role) {
    return new NextResponse(
      JSON.stringify({ error: "No role is provided in body." }),
      {
        status: 400,
      }
    );
  }

  const admin = isAdmin(projectId);
  if (!admin) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized access." }), {
      status: 403,
    });
  }

  let membership;
  try {
    membership = await prisma.projectMembership.findFirst({
      where: { id: membershipId },
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
      }
    );
  }

  if (!membership) {
    return new NextResponse(
      JSON.stringify({ error: "Project membership not found." }),
      {
        status: 404,
      }
    );
  }
  const userId = membership?.userId;

  const member = memberExists(projectId, userId);
  if (!member) {
    return new NextResponse(
      JSON.stringify({ error: "User is not a member of the project." }),
      {
        status: 404,
      }
    );
  }

  try {
    const member = await prisma.projectMembership.update({
      where: { id: membershipId, projectId: projectId, userId: userId },
      data: {
        role: role,
      },
      include: {
        user: true,
        project: true,
      },
    });

    const project = await prisma.project.findFirst({
      where: { id: projectId },
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
      { status: 201 }
    );
  } catch (e) {
    console.error(`Error updating role: ${e}`);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
      }
    );
  }
}
