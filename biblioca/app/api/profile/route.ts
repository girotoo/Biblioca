import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ count: 0 });

  const db = JSON.parse(fs.readFileSync(path.join(process.cwd(), "database.json"), "utf-8"));
  const count = db.materials.filter((m: any) => m.authorId === userId && m.approved).length;

  return NextResponse.json({ count });
}
