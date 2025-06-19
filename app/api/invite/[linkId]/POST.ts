import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import isAdmin from "@/lib/isAdmin";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    linkId: string;
  };
}

interface joinReqBody {
  maxUses: number;
  expires?: Date;
}

export async function mPOST(req: Request, res: ResponseInterface) {
  const session = await auth();
  if (!session?.user?.id) {
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

  const body: joinReqBody = await req.json();
  const { maxUses } = body;

  if (!maxUses || (maxUses && maxUses <= 0)) {
    return new NextResponse(
      JSON.stringify({ error: "MaxUses must be greater than 0." }),
      {
        status: 400,
      }
    );
  }

  try {
    const invite = await prisma.projectInvitation.findUnique({
      where: { linkId: linkId },
      include: {
        createdBy: true,
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!invite) {
      return new NextResponse(JSON.stringify({ error: "Invite not found." }), {
        status: 404,
      });
    }

    const admin = isAdmin(invite.projectId);
    if (!admin) {
      return new NextResponse(
        JSON.stringify({
          error: "You are not authorized to update this invite.",
        }),
        { status: 403 }
      );
    }

    const updatedInvite = await prisma.projectInvitation.update({
      where: { linkId: linkId },
      data: {
        maxUses: maxUses ? maxUses : invite.maxUses,
      },
    });

    const project = await prisma.project.findFirst({
      where: { id: updatedInvite.projectId },
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

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
      }
    );
  }
}
