import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import isOwner from "@/lib/isOwner";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
    membershipId: string;
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

  const { id, membershipId } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  if (!membershipId) {
    return new NextResponse(
      JSON.stringify({
        error: "No membership id is provided in the URL parameters.",
      }),
      {
        status: 400,
      }
    );
  }

  const membId = parseInt(membershipId);
  if (isNaN(membId)) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid membership id format." }),
      {
        status: 400,
      }
    );
  }

  let membership;
  try {
    membership = await prisma.projectMembership.findFirst({
      where: { id: membId },
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }

  if (!membership) {
    return new NextResponse(
      JSON.stringify({ error: "Membership not found." }),
      {
        status: 404,
      }
    );
  }

  if (membership?.userId == session.user.id) {
    const owner = await isOwner(id);
    if (owner) {
      return new NextResponse(
        JSON.stringify({ error: "You cannot remove yourself as the owner." }),
        {
          status: 403,
        }
      );
    }
  } else {
    const admin = isAdmin(id);
    if (!admin) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access to project." }),
        {
          status: 403,
        }
      );
    }
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: id,
        assignedTo: { some: { id: membership.userId } },
      },
    });

    const deleteTasks = tasks.map(async (task) => {
      await prisma.task.update({
        where: { id: task.id },
        data: {
          assignedTo: {
            disconnect: { id: membership.userId },
          },
        },
      });
    });

    await Promise.all(deleteTasks);

    const deleteUser = await prisma.projectMembership.delete({
      where: { id: membId },
    });

    const project = await prisma.project.findFirst({
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
    console.error(`Error kicking user: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
