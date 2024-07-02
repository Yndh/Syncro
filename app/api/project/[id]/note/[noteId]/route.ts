import { NextApiResponse } from "next";
import { mDELETE } from "./DELETE";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
    noteId: string;
  };
}

export function DELETE(req: Request, res: ResponseInterface) {
  return mDELETE(req, res);
}
