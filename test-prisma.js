const { PrismaClient } = require('@prisma/client');
console.log("Instantiating Prisma Client...");
const prisma = new PrismaClient();

async function main() {
    console.log("Counting questions...");
    const count = await prisma.question.count();
    console.log("Count:", count);
}

main().catch(console.error);
