import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface CreateNoteReqBody {
  title: string;
  description?: string;
}

interface UpdateNoteReqBody {
  id: number;
  title?: string;
  description?: string;
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

  const body: CreateNoteReqBody | UpdateNoteReqBody = await req.json();

  try {
    if ("id" in body) {
      const existingNote = await prisma.notes.findUnique({
        where: { id: body.id },
        include: { createdBy: true },
      });

      if (!existingNote) {
        return new NextResponse(JSON.stringify({ error: "Note not found." }), {
          status: 404,
        });
      }

      const updatedNote = await prisma.notes.update({
        where: { id: body.id },
        data: {
          title: body.title?.trim(),
          description: body.description,
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
    } else {
      const newNote = await prisma.notes.create({
        data: {
          title: body.title.trim(),
          description: body.description?.trim(),
          project: {
            connect: { id: projectId },
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
    }
  } catch (e) {
    console.error(`Error creating/updating note: ${e}`);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
