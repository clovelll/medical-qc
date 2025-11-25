import { NextRequest, NextResponse } from "next/server";
import Diagnosis from "@/lib/models/diagnosis";
import { APPEAL_REASONS } from "@/constants";

async function ensureDiagnosisTable() {
  await Diagnosis.sync({ alter: true });
}

type AppealPayload = {
  content?: unknown;
  user?: unknown;
};

function parseHistory(raw: string | null) {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse appeal history", error);
  }
  return [];
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDiagnosisTable();

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "无效的诊疗记录 ID" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as AppealPayload;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json(
        { success: false, message: "上诉内容不能为空" },
        { status: 400 }
      );
    }
    const rawUser =
      typeof body.user === "string" && body.user.trim()
        ? body.user.trim()
        : "patient";
    const user = rawUser === "doctor" ? "doctor" : "patient";

    const diagnosis = await Diagnosis.findByPk(id);
    if (!diagnosis) {
      return NextResponse.json(
        { success: false, message: "诊疗记录不存在" },
        { status: 404 }
      );
    }

    if (
      user === "doctor" &&
      diagnosis.appealStatus !== APPEAL_REASONS.PROGRESS
    ) {
      return NextResponse.json(
        { success: false, message: "当前状态不可回复" },
        { status: 400 }
      );
    }

    const history = parseHistory(diagnosis.appealReply);
    history.push({ [user]: content });

    diagnosis.appealReply = JSON.stringify(history);
    diagnosis.appealStatus =
      user === "doctor" ? APPEAL_REASONS.APPROVE : APPEAL_REASONS.PROGRESS;
    await diagnosis.save();

    return NextResponse.json({
      success: true,
      data: diagnosis.toJSON(),
    });
  } catch (error) {
    console.error("Appeal API error:", error);
    return NextResponse.json(
      { success: false, message: "提交上诉失败" },
      { status: 500 }
    );
  }
}
