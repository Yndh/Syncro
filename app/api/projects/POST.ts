import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface reqBody {
  name: string;
  description: string;
}

const MAX_PROJECTS = process.env.MAX_PROJECTS;

export async function mPOST(req: Request, res: NextApiResponse) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ error: "The user is not authenticated" }),
      {
        status: 401,
      }
    );
  }

  const body: reqBody = await req.json();
  if (body.name.trim().length < 1 || body.name.trim().length > 100) {
    return new NextResponse(
      JSON.stringify({
        error: "Project name must be between 1 and 100 characters",
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
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        members: {
          create: {
            userId: session.user.id as string,
            role: "OWNER",
          },
        },
      },
    });

    return new NextResponse(JSON.stringify({ id: project.id }), {
      status: 201,
    });
  } catch (e) {
    console.error("Error creating project:", e);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create project" }),
      {
        status: 500,
      }
    );
  }
}
