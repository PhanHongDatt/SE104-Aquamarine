import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Logic to export reports to Excel / PDF
  return NextResponse.json({ message: "Export API endpoint" });
}
