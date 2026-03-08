import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const difficultyStr = request.nextUrl.searchParams.get('difficulty');

    try {
        let count = await prisma.question.count();

        if (count < 100) {
            await prisma.question.deleteMany({});

            const clinicalTemplates = [
                { text: "What is the primary indication for DUFOGEN in threatened miscarriage?", optionA: "Dydrogesterone 40mg stat, then 10mg TDS", optionB: "Progesterone 5mg BD", optionC: "Aspirin 75mg OD", optionD: "Folic acid 5mg OD", correctOption: "A", category: "Dosage" },
                { text: "Dydrogesterone's selectivity for which receptor minimizes androgenic side effects?", optionA: "Progesterone Receptor", optionB: "Estrogen Receptor", optionC: "Androgen Receptor", optionD: "Glucocorticoid Receptor", correctOption: "A", category: "Pharmacology" },
                { text: "Which study demonstrated dydrogesterone's non-inferiority to vaginal progesterone gel?", optionA: "LOTUS I", optionB: "ASPIRIN-2", optionC: "PROMISE", optionD: "ALIFE", correctOption: "A", category: "Evidence" },
                { text: "What is the molecular hallmark of Dydrogesterone's 'retro' structure?", optionA: "9-beta, 10-alpha configuration", optionB: "17-alpha hydroxyl group", optionC: "Carbon-21 chain length", optionD: "Double bond at C3", correctOption: "A", category: "Structure" },
                { text: "For luteal phase support in IVF, which route of dydrogesterone is clinically proven?", optionA: "Oral", optionB: "Vaginal", optionC: "Intramuscular", optionD: "Subcutaneous", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone does NOT have which of the following effects at therapeutic doses?", optionA: "Thermogenic effect", optionB: "Progestogenic effect", optionC: "Endometrial protection", optionD: "Luteal support", correctOption: "A", category: "Safety" },
                { text: "The LOTUS II trial confirmed dydrogesterone's efficacy in which patient population?", optionA: "IVF patients", optionB: "Menopausal women", optionC: "PCOS patients", optionD: "Adolescents with Dysmenorrhea", correctOption: "A", category: "Evidence" },
                { text: "Which metabolite of dydrogesterone is the most clinically significant?", optionA: "20-alpha-dihydrodydrogesterone (DHD)", optionB: "Pregnanediol", optionC: "Estradiol", optionD: "Androstenedione", correctOption: "A", category: "Metabolism" },
                { text: "In cases of habitual miscarriage, dydrogesterone treatment should ideally start:", optionA: "As soon as pregnancy is confirmed", optionB: "After 12 weeks", optionC: "Only if bleeding occurs", optionD: "Post-delivery", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone protects the endometrium in HRT without opposing the beneficial effects of:", optionA: "Estrogens", optionB: "Lipids", optionC: "Carbohydrates", optionD: "Vitamins", correctOption: "A", category: "HRT" }
            ];

            const fullSet = [];
            for (let i = 1; i <= 100; i++) {
                const template = clinicalTemplates[(i - 1) % clinicalTemplates.length];
                const setNum = Math.ceil(i / 10);
                fullSet.push({
                    text: i > 10 ? `${template.text} (Scenario ${setNum}.${i % 10 || 10})` : template.text,
                    optionA: template.optionA,
                    optionB: template.optionB,
                    optionC: template.optionC,
                    optionD: template.optionD,
                    correctOption: template.correctOption,
                    difficulty: i <= 50 ? 1 : 2,
                    category: template.category
                });
            }

            await prisma.question.createMany({ data: fullSet });
        }

        const whereClause = difficultyStr ? { difficulty: parseInt(difficultyStr) } : {};
        const questions = await prisma.question.findMany({ where: whereClause });

        return NextResponse.json(questions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const question = await prisma.question.create({
            data: {
                text: data.text,
                optionA: data.optionA,
                optionB: data.optionB,
                optionC: data.optionC,
                optionD: data.optionD,
                correctOption: data.correctOption,
                difficulty: Number(data.difficulty),
                category: data.category
            }
        });
        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        await prisma.question.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        const data = await request.json();
        const updated = await prisma.question.update({
            where: { id },
            data: {
                text: data.text,
                optionA: data.optionA,
                optionB: data.optionB,
                optionC: data.optionC,
                optionD: data.optionD,
                correctOption: data.correctOption,
                difficulty: Number(data.difficulty),
                category: data.category
            }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
