import prisma from './src/lib/prisma';

async function main() {
    const questions = await prisma.question.findMany();
    console.log(`Found ${questions.length} questions in the database.`);
    if (questions.length > 0) {
        console.log("Sample question:");
        console.log(questions[0].text);
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
