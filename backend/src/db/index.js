import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    const [{ now }] = await prisma.$queryRaw`SELECT NOW() as now`;
    console.log(`\n PostgreSQL connected !! DB Time: ${now}`);
  } catch (error) {
    console.error("PostgreSQL connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;