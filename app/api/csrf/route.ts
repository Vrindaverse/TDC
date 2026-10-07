import { getCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getCsrfToken();
  return NextResponse.json({ token });
}