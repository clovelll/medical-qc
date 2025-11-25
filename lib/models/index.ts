/**
 * 模型导出索引
 * 统一导出所有模型，方便导入和使用
 */

import sequelize from "../sequelize";
import User from "./User";
import Diagnosis from "./diagnosis";

// 导出所有模型
export { User, Diagnosis };

// 如果需要定义模型之间的关联关系，可以在这里添加
// 例如：
// User.hasMany(Order, { foreignKey: "userId" });
// Order.belongsTo(User, { foreignKey: "userId" });

// 导出 sequelize 实例
export { sequelize };

/**
 * 初始化所有模型
 * 在应用启动时调用此函数以确保所有模型都已加载
 */
export function initializeModels() {
  console.log("📦 模型初始化完成");
}
