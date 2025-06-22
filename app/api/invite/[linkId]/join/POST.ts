import { Project } from "@/app/types/interfaces";
import { auth } from "@/auth";
import { joinProject } from "@/lib/joinProject";
import { prisma } from "@/lib/prisma";
import { ProjectMembership } from "@prisma/client";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    linkId: string;
  };
}

const MAX_PROJECTS = process.env.MAX_PROJECTS;
const MAX_USERS = process.env.MAX_USERS;

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

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: {
      projectMembership: {
        select: {
          id: true,
        },
      },
    },
  });

  if (
    user &&
    user.projectMembership &&
    user.projectMembership.length >= Number(MAX_PROJECTS)
  ) {
    return new NextResponse(
      JSON.stringify({
        error: `You have reached the maximum number of projects.`,
      }),
      { status: 400 }
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

    const projectMembers = await prisma.project.findFirst({
      where: { id: invite.projectId },
      select: {
        members: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      projectMembers &&
      projectMembers.members &&
      projectMembers.members.length >= Number(MAX_USERS)
    ) {
      return new NextResponse(
        JSON.stringify({
          error: `This project has reached the maximum number of members.`,
        }),
        { status: 400 }
      );
    }

    const membership = joinProject(session.user.id, invite.projectId);
    if (!membership) {
      return new NextResponse(
        JSON.stringify({ error: "Internal server error." }),
        {
          status: 500,
        }
      );
    }

    await prisma.projectInvitation.update({
      where: { linkId: linkId },
      data: {
        uses: invite.uses + 1,
      },
    });

    return new NextResponse(JSON.stringify({ projectId: invite.projectId }), {
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
