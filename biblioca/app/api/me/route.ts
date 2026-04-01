import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ isAdmin: false, userId: null });

  const raw = fs.readFileSync(path.join(process.cwd(), "admins.json"), "utf-8");
  const { admins } = JSON.parse(raw);

  return NextResponse.json({ isAdmin: admins.includes(userId), userId });
}
