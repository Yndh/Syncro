import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface reqBody {
  name: string;
  description: string;
}

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
  if (body.name.trim().length < 1 || !body.description) {
    return new NextResponse(JSON.stringify({ error: "Invalid parameters" }), {
      status: 400,
    });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        owner: { connect: { id: session.user.id as string } },
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
