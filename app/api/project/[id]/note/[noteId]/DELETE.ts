import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
    noteId: string;
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

  const { id, noteId } = res.params;
  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  if (!noteId) {
    return new NextResponse(
      JSON.stringify({ error: "No id is provided in the URL parameters." }),
      {
        status: 400,
      }
    );
  }

  const noteId2 = parseInt(noteId);
  if (isNaN(noteId2)) {
    return new NextResponse(JSON.stringify({ error: "Invalid id format." }), {
      status: 400,
    });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: id },
      select: { members: true },
    });

    if (!project) {
      return new NextResponse(JSON.stringify({ error: "Project not found." }), {
        status: 404,
      });
    }

    const note = await prisma.notes.findUnique({
      where: { id: noteId2 },
    });

    if (!note) {
      return new NextResponse(JSON.stringify({ error: "Note not found." }), {
        status: 404,
      });
    }

    const isCreatorOrOwner =
      note.createdById === session.user?.id ||
      project.members.some((member) => {
        return (
          member.userId === session.user?.id &&
          (member.role === "OWNER" || member.role === "ADMIN")
        );
      });

    if (!isCreatorOrOwner) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access." }),
        {
          status: 403,
        }
      );
    }
  } catch (e) {
    console.error(`Error deleting nonte: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }

  try {
    const deleteNote = await prisma.notes.delete({
      where: { id: noteId2 },
    });

    const notes = await prisma.notes.findMany({
      where: { projectId: id },
      include: {
        createdBy: true,
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(`Error deleting note: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
