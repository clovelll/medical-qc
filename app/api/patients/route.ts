import { NextResponse } from "next/server";
import User from "@/lib/models/User";

async function ensureUserTable() {
  await User.sync();
}

export async function GET() {
  try {
    await ensureUserTable();

    const patients = await User.findAll({
      where: { role: "patient" },
      attributes: ["id", "phone"],
      order: [["phone", "ASC"]],
    });

    const data = patients.map((patient) => ({
      id: patient.id,
      phone: patient.phone,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Patients API error:", error);
    return NextResponse.json(
      { success: false, message: "无法获取患者列表" },
      { status: 500 }
    );
  }
}



