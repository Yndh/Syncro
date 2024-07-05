import { auth } from "@/auth";
import isAdmin from "@/lib/isAdmin";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { connect } from "http2";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ReqBody {
  maxUses: number | null;
  expires: Date | null;
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
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
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

  const admin = isAdmin(projectId);
  if (!admin) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to project." }),
      {
        status: 403,
      }
    );
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const len = 6;
  let linkId = "";
  for (let i = 0; i < len; i++) {
    linkId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const body: ReqBody = await req.json();
  try {
    const invite = await prisma.projectInvitation.create({
      data: {
        linkId: linkId,
        maxUses: body.maxUses,
        project: {
          connect: {
            id: projectId,
          },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
        expires: body.expires,
      },
    });

    return new NextResponse(
      JSON.stringify({
        invite: invite,
      }),
      { status: 201 }
    );
  } catch (e) {
    console.error(`Error creating invite: ${e}`);
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
