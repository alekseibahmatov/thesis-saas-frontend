import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const company = await db.company.findUnique({
    where: {
      representativeId: session.user.id,
    },
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 400 });
  }

  const factoryPlan = company.factoryPlan;

  if (!factoryPlan) {
    return NextResponse.json({ message: "Image not found" }, { status: 404 });
  }

  return new NextResponse(factoryPlan, {
    headers: {
      "Content-Type": "image/jpeg", // Adjust this if the image format is different
    },
  });
}
