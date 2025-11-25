import { NextResponse } from "next/server";
import User from "@/lib/models/User";

async function ensureUserTable() {
  await User.sync();
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const phone = String(payload.phone || "").trim();

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "请输入 11 位国内手机号（模拟）" },
        { status: 400 }
      );
    }

    await ensureUserTable();

    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "账号不存在，请先注册" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
      message: "登录成功",
    });

    response.cookies.set("qc_role", user.role, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "登录失败，请稍后再试" },
      { status: 500 }
    );
  }
}
