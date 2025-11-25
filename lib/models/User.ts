import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../sequelize";

/**
 * User 模型示例
 * 用于演示 Sequelize + SQLite 的使用
 */
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  // 属性定义
  declare id: CreationOptional<number>;
  declare phone: string;
  declare role: string;
  declare createdAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      comment: "手机号，唯一标识",
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "用户角色",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["phone"],
      },
    ],
  }
);

export default User;
