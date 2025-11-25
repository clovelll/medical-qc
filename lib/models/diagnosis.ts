import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../sequelize";
import { APPEAL_REASONS } from "../../constants";

class Diagnosis extends Model<
  InferAttributes<Diagnosis>,
  InferCreationAttributes<Diagnosis>
> {
  declare id: CreationOptional<number>;
  declare patientPhone: string;
  declare gender: string;
  declare age: string;
  declare department: string;
  declare chiefComplaint: string | null;
  declare presentIllness: string | null;
  declare allergyHistory: string | null;
  declare familyHistory: string | null;
  declare tcmInspection: string | null;
  declare physicalExam: string | null;
  declare auxiliaryExam: string | null;
  declare tcmDiagnosisPrimary: string | null;
  declare tcmDiagnosisSecondary: string | null;
  declare treatmentRequest: string | null;
  declare prescription: string | null;
  declare suggestion: string | null;
  declare appealStatus: APPEAL_REASONS | null;
  declare appealReply: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Diagnosis.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patientPhone: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "患者电话",
    },
    gender: {
      type: DataTypes.STRING(4),
      allowNull: false,
      comment: "性别",
    },
    age: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: "年龄",
    },
    department: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: "所在科室编码",
    },
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    presentIllness: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    allergyHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    familyHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tcmInspection: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    physicalExam: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    auxiliaryExam: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tcmDiagnosisPrimary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tcmDiagnosisSecondary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    treatmentRequest: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    suggestion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    appealStatus: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "上诉状态",
      defaultValue: APPEAL_REASONS.PENDING,
    },
    appealReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "上诉和回复内容（JSON字符串）",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "diagnoses",
    timestamps: true,
    indexes: [
      {
        fields: ["patientPhone"],
      },
    ],
  }
);

export default Diagnosis;
