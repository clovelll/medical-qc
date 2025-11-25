import path from "path";
import { Sequelize } from "sequelize";
import sqlite3 from "sqlite3";
const storagePath = path.join(process.cwd(), "data", "database.sqlite");
// export let sequelize: any = null;
console.log(99999);
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false,
  dialectModule: sqlite3,
});

// export async function createSequelize() {
//   const sqlite3 = await import("sqlite3");
//   if (sequelize) {
//     return sequelize;
//   }
//   sequelize = new Sequelize({
//     dialect: "sqlite",
//     dialectModule: sqlite3,
//     storage: storagePath,
//     logging: false,
//   });
//   return sequelize;
// }

export default sequelize;
