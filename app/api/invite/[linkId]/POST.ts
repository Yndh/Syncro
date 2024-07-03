import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    linkId: string;
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

  const linkId = res.params.linkId;
  if (!linkId) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
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

    const currentDate = new Date();
    const expiresDate = invite.expires ? new Date(invite.expires) : null;

    if (expiresDate && expiresDate <= currentDate) {
      return new NextResponse(JSON.stringify({ error: "Invite is expired." }), {
        status: 410,
      });
    }

    if (
      !(invite.maxUses ?? Infinity) === null ||
      !(invite.uses < (invite.maxUses ?? Infinity))
    ) {
      return new NextResponse(JSON.stringify({ error: "Invite is expired." }), {
        status: 410,
      });
    }

    const isMember = invite.project.members.some(
      (member) => member.userId === session.user?.id
    );

    if (isMember) {
      return new NextResponse(
        JSON.stringify({ error: "User is already a member of this project." }),
        {
          status: 409,
        }
      );
    }

    const membership = await prisma.projectMembership.create({
      data: {
        project: {
          connect: {
            id: invite?.projectId,
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
        role: "MEMBER",
      },
    });

    await prisma.projectInvitation.update({
      where: { linkId: linkId },
      data: {
        uses: invite.uses + 1,
      },
    });

    return new NextResponse(
      JSON.stringify({ projectId: membership.projectId }),
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
