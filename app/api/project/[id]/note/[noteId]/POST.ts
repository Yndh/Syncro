import { auth } from "@/auth";
import isMember from "@/lib/isMember";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
    noteId: string;
  };
}

interface UpdateNoteReqBody {
  title: string;
  description: string;
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

  const { id, noteId: noteIdPar } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  if (!noteIdPar) {
    return new NextResponse(
      JSON.stringify({
        error: "No note id is provided in the URL parameters.",
      }),
      {
        status: 400,
      }
    );
  }

  const noteId = parseInt(noteIdPar);
  if (isNaN(noteId)) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid note id format." }),
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

  const body: UpdateNoteReqBody = await req.json();
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

  try {
    const existingNote = await prisma.notes.findUnique({
      where: { id: noteId },
      include: { createdBy: true },
    });

    if (!existingNote) {
      return new NextResponse(JSON.stringify({ error: "Note not found." }), {
        status: 404,
      });
    }

    const updatedNote = await prisma.notes.update({
      where: { id: noteId },
      data: {
        title: title?.trim(),
        description: description.trim(),
      },
      include: {
        createdBy: true,
      },
    });
    return new NextResponse(
      JSON.stringify({
        note: updatedNote,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(`Error updating note: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
