export const USER_ROLES = [
  { label: "医生", code: "doctor" },
  { label: "患者", code: "patient" },
];

export const DEPARTMENT_OPTIONS = [
  { label: "内科", code: "内科" },
  { label: "外科", code: "外科" },
  { label: "儿科", code: "儿科" },
  { label: "妇产科", code: "妇产科" },
  { label: "皮肤科", code: "皮肤科" },
  { label: "眼科", code: "眼科" },
  { label: "耳鼻喉科", code: "耳鼻喉科" },
  { label: "口腔科", code: "口腔科" },
  { label: "中医科", code: "中医科" },
];

export enum APPEAL_REASONS {
  PENDING = "pending",
  PROGRESS = "progress",
  APPROVE = "approve",
}
