import { NextApiResponse } from "next";
import { mGET } from "./GET";
import { mPOST } from "./POST";
import { mDELETE } from "./DELETE";

export function GET(req: Request, res: NextApiResponse) {
  return mGET(req, res);
}

export function POST(req: Request, res: NextApiResponse) {
  return mPOST(req, res);
}

export function DELETE(req: Request, res: NextApiResponse) {
  return mDELETE(req, res);
}
