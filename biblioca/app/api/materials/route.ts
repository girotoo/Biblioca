import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "database.json");
const ADMINS_PATH = path.join(process.cwd(), "admins.json");

function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data: object) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function isAdmin(userId: string): boolean {
  const raw = fs.readFileSync(ADMINS_PATH, "utf-8");
  const { admins } = JSON.parse(raw);
  return admins.includes(userId);
}

// GET /api/materials?subject=Matemática
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");

  const db = readDB();
  let materials = db.materials.filter((m: any) => m.approved);

  if (subject) {
    materials = materials.filter((m: any) => m.subject === subject);
  }

  return NextResponse.json({ materials, subjects: db.subjects });
}

// POST /api/materials — upload a new material
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { title, subject, description, fileUrl, fileName, fileType, authorName, authorImageUrl } = body;

  if (!title || !subject || !fileUrl) {
    return NextResponse.json({ error: "Título, matéria e ficheiro são obrigatórios" }, { status: 400 });
  }

  const db = readDB();

  const newMaterial = {
    id: `mat_${Date.now()}`,
    title,
    subject,
    description: description || "",
    fileUrl,
    fileName,
    fileType,
    authorId: userId,
    authorName,
    authorImageUrl,
    approved: false,
    createdAt: new Date().toISOString(),
  };

  db.materials.push(newMaterial);
  writeDB(db);

  return NextResponse.json({ success: true, material: newMaterial });
}
