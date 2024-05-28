import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const { image } = await req.json();

  const company = await db.company.findUnique({
    where: {
      representativeId: session.user.id,
    },
  });

  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 400 });
  }

  const buffer = Buffer.from(image, "base64");

  await db.company.update({
    where: {
      id: company.id,
    },
    data: {
      factoryPlan: buffer,
    },
  });

  return NextResponse.json(
    { message: "Factory plan uploaded successfully" },
    { status: 200 },
  );
}
