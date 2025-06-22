import { auth } from "@/auth";
import isMember from "@/lib/isMember";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface CreateNoteReqBody {
  title: string;
  description: string;
}

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
  };
}

const MAX_NOTES = process.env.MAX_NOTES;

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

  const { id } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const membership = isMember(id);
  if (!membership) {
    return new NextResponse(JSON.stringify({ error: "Access denied." }), {
      status: 403,
    });
  }

  const body: CreateNoteReqBody = await req.json();
  const { title, description = "" } = body;

  if (title.trim().length < 1 || title.trim().length > 100) {
    return new NextResponse(
      JSON.stringify({
        error: "Note title must be between 1 and 100 characters",
      }),
      {
        status: 400,
      }
    );
  }

  if (description.trim().length > 400) {
    return new NextResponse(
      JSON.stringify({ error: "Description must be at most 400 characters" }),
      {
        status: 400,
      }
    );
  }

  const projectNotes = await prisma.notes.findMany({
    where: { projectId: id },
    select: {
      id: true,
    },
  });

  if (projectNotes && projectNotes.length >= Number(MAX_NOTES)) {
    return new NextResponse(
      JSON.stringify({
        error: "Maximum number of notes reached for this project.",
      }),
      { status: 400 }
    );
  }

  try {
    const newNote = await prisma.notes.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim(),
        project: {
          connect: { id: id },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
      },
      include: {
        createdBy: true,
      },
    });
    return new NextResponse(
      JSON.stringify({
        note: newNote,
      }),
      { status: 201 }
    );
  } catch (e) {
    console.error(`Error creating note: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
