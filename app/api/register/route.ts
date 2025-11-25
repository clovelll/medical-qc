import { NextResponse } from "next/server";
// import User from "@/lib/models/User";
import User from "@/lib/models/User";

async function ensureUserTable() {
  await User.sync();
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const phone = String(payload.phone || "").trim();
    const role = String(payload.role || "").trim();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "请输入 11 位国内手机号（模拟）" },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, message: "请输入角色" },
        { status: 400 }
      );
    }

    await ensureUserTable();

    const [user, created] = await User.findOrCreate({
      where: { phone },
      defaults: { phone, role },
    });
    console.log(created, user?.role);
    if (!created && user.role !== role) {
      user.role = role;
      await user.save();
      console.log(898989);
    }
    console.log(12828182);
    return NextResponse.json(
      {
        success: true,
        data: { id: user.id, phone: user.phone, role: user.role },
        message: created ? "注册成功" : "已更新角色",
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "注册失败，请稍后再试",
      },
      { status: 500 }
    );
  }
}
