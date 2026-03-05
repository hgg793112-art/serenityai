import express from "express";
import cors from "cors";
import decisionRoutes from "./routes/decision";
import profileRoutes from "./routes/profile";
import { PrismaClient } from "@prisma/client";
import { SEED_PRODUCTS } from "./seedData";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/", decisionRoutes);
app.use("/", profileRoutes);

async function ensureSeed() {
  try {
    const count = await prisma.product.count();
    if (count >= 50) return;
    await prisma.product.createMany({ data: SEED_PRODUCTS, skipDuplicates: true });
    console.log("Seed 完成，Product 數量:", await prisma.product.count());
  } catch (e) {
    console.warn("資料庫未連接或 Seed 跳過:", (e as Error).message);
  }
}

const PORT = process.env.PORT || 3001;

ensureSeed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT} (無資料庫，API 可能失敗)`);
    });
  });
