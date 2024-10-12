import { NextApiResponse } from "next";
import { mDELETE } from "./DELETE";
import { mPOST } from "./POST";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    id: string;
    noteId: string;
  };
}

export function DELETE(req: Request, res: ResponseInterface) {
  return mDELETE(req, res);
}

export function POST(req: Request, res: ResponseInterface) {
  return mPOST(req, res);
}
