import { NextApiResponse } from "next";
import { mGET } from "./GET";
import { mPOST } from "./POST";
import { mDELETE } from "./DELETE";

interface ResponseInterface<T = any> extends NextApiResponse<T> {
  params: {
    linkId: string;
  };
}

export function GET(req: Request, res: ResponseInterface) {
  return mGET(req, res);
}

export function POST(req: Request, res: ResponseInterface) {
  return mPOST(req, res);
}

export function DELETE(req: Request, res: ResponseInterface) {
  return mDELETE(req, res);
}
