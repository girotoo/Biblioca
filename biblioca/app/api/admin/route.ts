import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "database.json");
const ADMINS_PATH = path.join(process.cwd(), "admins.json");

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data: object) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function isAdmin(userId: string): boolean {
  const { admins } = JSON.parse(fs.readFileSync(ADMINS_PATH, "utf-8"));
  return admins.includes(userId);
}

// PATCH /api/admin — approve or reject a material
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { materialId, action } = await req.json(); // action: "approve" | "reject"
  const db = readDB();

  if (action === "approve") {
    const mat = db.materials.find((m: any) => m.id === materialId);
    if (mat) mat.approved = true;
  } else if (action === "reject") {
    db.materials = db.materials.filter((m: any) => m.id !== materialId);
  }

  writeDB(db);
  return NextResponse.json({ success: true });
}

// POST /api/admin — add a new subject
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { subject } = await req.json();
  if (!subject) return NextResponse.json({ error: "Nome da matéria obrigatório" }, { status: 400 });

  const db = readDB();
  if (!db.subjects.includes(subject)) {
    db.subjects.push(subject);
    writeDB(db);
  }

  return NextResponse.json({ success: true, subjects: db.subjects });
}

// GET /api/admin — get pending materials (not yet approved)
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const db = readDB();
  const pending = db.materials.filter((m: any) => !m.approved);
  return NextResponse.json({ pending });
}
