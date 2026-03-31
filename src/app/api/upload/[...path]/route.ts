import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const filename = segments.join("/");

    // Prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    const buffer = await readFile(filePath);
    const ext = safeName.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
