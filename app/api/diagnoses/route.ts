import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Diagnosis from "@/lib/models/diagnosis";

async function ensureDiagnosisTable() {
  await Diagnosis.sync({ alter: true });
}

const REQUIRED_FIELDS = [
  "patientPhone",
  "gender",
  "age",
  "department",
] as const;
const OPTIONAL_FIELDS = [
  "chiefComplaint",
  "presentIllness",
  "allergyHistory",
  "familyHistory",
  "tcmInspection",
  "physicalExam",
  "auxiliaryExam",
  "tcmDiagnosisPrimary",
  "tcmDiagnosisSecondary",
  "treatmentRequest",
  "prescription",
  "suggestion",
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];
type OptionalField = (typeof OPTIONAL_FIELDS)[number];

type DiagnosisPayload = Record<RequiredField, string> &
  Partial<Record<OptionalField, string | null>>;

function normalizeOptional(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(request: NextRequest) {
  try {
    await ensureDiagnosisTable();

    const body = (await request.json()) as Partial<DiagnosisPayload>;
    const payload: DiagnosisPayload = {
      patientPhone: "",
      gender: "",
      age: "",
      department: "",
    };

    for (const field of REQUIRED_FIELDS) {
      const value = body[field];
      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { success: false, message: `字段 ${field} 为必填项` },
          { status: 400 }
        );
      }
      payload[field] = value.trim();
    }

    for (const field of OPTIONAL_FIELDS) {
      const value = normalizeOptional(body[field] ?? null);
      if (value !== null) {
        payload[field] = value;
      } else {
        payload[field] = null;
      }
    }

    const diagnosis = await Diagnosis.create(payload);

    return NextResponse.json({
      success: true,
      data: {
        id: diagnosis.id,
      },
    });
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return NextResponse.json(
      { success: false, message: "保存诊疗信息失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDiagnosisTable();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );
    const offset = (page - 1) * limit;
    const phone = (searchParams.get("patientPhone") || "").trim();
    const department = (searchParams.get("department") || "").trim();

    const where: Record<string, unknown> = {};
    if (phone) {
      where.patientPhone = {
        [Op.like]: `%${phone}%`,
      };
    }
    if (department) {
      where.department = department;
    }

    const { rows, count } = await Diagnosis.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      where,
    });

    return NextResponse.json({
      success: true,
      data: rows.map((record) => record.toJSON()),
      pagination: {
        total: count,
        page,
        pageSize: limit,
        pages: Math.ceil(count / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return NextResponse.json(
      { success: false, message: "获取诊疗信息失败" },
      { status: 500 }
    );
  }
}
