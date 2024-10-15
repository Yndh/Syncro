import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    linkId: string;
  };
}

interface reqBody {
  maxUses?: number;
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

  const linkId = res.params.linkId;
  if (!linkId) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const body: reqBody = await req.json();
  const { maxUses } = body;

  if (maxUses && maxUses <= 0) {
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

    console.log(maxUses);

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

    return new NextResponse(JSON.stringify({ project: project }), {
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
