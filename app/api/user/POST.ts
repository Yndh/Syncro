import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface reqBody {
  username: string;
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
  const { username } = body;

  if (username.trim().length < 1 && username.trim().length > 39) {
    return new NextResponse(
      JSON.stringify({
        error: "Username must be between 1 and 39 characters",
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: username,
      },
    });

    console.log(user.name);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 201,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update user profile" }),
      {
        status: 500,
      }
    );
  }
}
