import { auth } from "@/auth";
import isMember from "@/lib/isMember";
import isOwner from "@/lib/isOwner";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
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

  const { id } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const ownership = isOwner(id);

  if (!ownership) {
    return new NextResponse(JSON.stringify({ error: "Access denied." }), {
      status: 403,
    });
  }

  try {
    const project = await prisma.project.delete({
      where: { id: id },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
      }),
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
