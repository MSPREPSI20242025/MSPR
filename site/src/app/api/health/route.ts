import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
    return NextResponse.json({ status: "healthy" }, { status: 200 });
}
