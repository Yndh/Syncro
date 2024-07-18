import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import isOwner from "@/lib/isOwner";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    linkId: string;
  };
}

export async function mDELETE(req: Request, res: ResponseInterface) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ error: "The user is not authenticated" }),
      {
        status: 401,
      }
    );
  }

  const { linkId } = res.params;
  if (!linkId) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  let invitation;
  try {
    invitation = await prisma.projectInvitation.findFirst({
      where: { linkId: linkId },
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }

  if (!invitation) {
    return new NextResponse(JSON.stringify({ error: "Invite not found." }), {
      status: 404,
    });
  }

  const admin = isAdmin(invitation.projectId);
  if (!admin) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to project." }),
      {
        status: 403,
      }
    );
  }

  try {
    const deleteInvite = await prisma.projectInvitation.delete({
      where: { linkId: linkId },
    });

    const project = await prisma.project.findMany({
      where: { id: invitation.projectId },
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
    console.error(`Error deleting invite: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
