import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const difficultyStr = request.nextUrl.searchParams.get('difficulty');

    try {
        let count = await prisma.question.count();

        if (count < 40) {
            await prisma.question.deleteMany({});
            const clinicalTemplates = [
                { text: "Dydrogesterone (Dufogen) is primarily indicated for:", optionA: "Bacterial infections", optionB: "Progesterone deficiency disorders", optionC: "Viral infections", optionD: "Hypertension", correctOption: "B", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) works mainly by:", optionA: "Blocking estrogen receptors", optionB: "Mimicking progesterone hormone", optionC: "Increasing insulin secretion", optionD: "Reducing cortisol levels", correctOption: "B", category: "Mechanism" },
                { text: "Dydrogesterone (Dufogen) is commonly used in the treatment of:", optionA: "Diabetes", optionB: "Endometriosis", optionC: "Tuberculosis", optionD: "Asthma", correctOption: "B", category: "Indication" },
                { text: "Which dosage form is most common for Dydrogesterone (Dufogen)?", optionA: "Injection", optionB: "Tablet", optionC: "Cream", optionD: "Syrup", correctOption: "B", category: "Formulation" },
                { text: "Dydrogesterone (Dufogen) is most often prescribed by:", optionA: "Dermatologists", optionB: "Gynecologists", optionC: "Cardiologists", optionD: "Orthopedic doctors", correctOption: "B", category: "Prescription" },
                { text: "Dydrogesterone (Dufogen) is helpful in managing:", optionA: "Amenorrhea", optionB: "Malaria", optionC: "Hypertension", optionD: "Arthritis", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) supports which phase of the menstrual cycle?", optionA: "Follicular phase", optionB: "Luteal phase", optionC: "Ovulation phase", optionD: "Menopause phase", correctOption: "B", category: "Mechanism" },
                { text: "Dydrogesterone (Dufogen) can help prevent:", optionA: "Kidney stones", optionB: "Recurrent miscarriage", optionC: "Pneumonia", optionD: "Migraine", correctOption: "B", category: "Prevention" },
                { text: "Dydrogesterone (Dufogen) acts on the:", optionA: "Uterus lining (endometrium)", optionB: "Kidneys", optionC: "Lungs", optionD: "Pancreas", correctOption: "A", category: "Action" },
                { text: "Dydrogesterone (Dufogen) belongs to which pharmacological group?", optionA: "Progestins", optionB: "Antibiotics", optionC: "Antivirals", optionD: "Antihistamines", correctOption: "A", category: "Classification" },
                { text: "The brand name of Dydrogesterone mentioned here is:", optionA: "Duphaston", optionB: "Dufogen", optionC: "Provera", optionD: "Femoston", correctOption: "B", category: "Brand" },
                { text: "Dydrogesterone (Dufogen) helps maintain:", optionA: "Bone marrow", optionB: "Endometrial lining", optionC: "Kidney function", optionD: "Blood sugar", correctOption: "B", category: "Benefit" },
                { text: "One common side effect of Dydrogesterone (Dufogen) is:", optionA: "Headache", optionB: "Hearing loss", optionC: "Vision blindness", optionD: "Hair loss", correctOption: "A", category: "Side Effect" },
                { text: "Dydrogesterone (Dufogen) is often used in:", optionA: "Hormone Replacement Therapy", optionB: "Antibiotic therapy", optionC: "Insulin therapy", optionD: "Cancer chemotherapy", correctOption: "A", category: "Usage" },
                { text: "Dydrogesterone (Dufogen) is mainly metabolized in the:", optionA: "Liver", optionB: "Brain", optionC: "Heart", optionD: "Lung", correctOption: "A", category: "Metabolism" },
                { text: "Which condition involving painful menstruation may be treated with Dydrogesterone (Dufogen)?", optionA: "Dysmenorrhea", optionB: "Leukemia", optionC: "Hepatitis", optionD: "Asthma", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) is useful in infertility caused by:", optionA: "Luteal phase defect", optionB: "Kidney failure", optionC: "Diabetes", optionD: "Thyroid cancer", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) is a synthetic form of:", optionA: "Estrogen", optionB: "Progesterone", optionC: "Testosterone", optionD: "Cortisol", correctOption: "B", category: "Mechanism" },
                { text: "Dydrogesterone (Dufogen) may help regulate:", optionA: "Blood pressure", optionB: "Menstrual cycle", optionC: "Heart rate", optionD: "Blood glucose", correctOption: "B", category: "Benefit" },
                { text: "Which hormone deficiency is corrected by Dydrogesterone (Dufogen)?", optionA: "Estrogen deficiency", optionB: "Progesterone deficiency", optionC: "Insulin deficiency", optionD: "Thyroxine deficiency", correctOption: "B", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) may be used for treatment of:", optionA: "Premenstrual syndrome", optionB: "Kidney stones", optionC: "Ulcer", optionD: "Pneumonia", correctOption: "A", category: "Indication" },
                { text: "The target organ for Dydrogesterone (Dufogen) is primarily:", optionA: "Uterus", optionB: "Heart", optionC: "Brain", optionD: "Liver", correctOption: "A", category: "Action" },
                { text: "Dydrogesterone (Dufogen) is taken mainly by:", optionA: "Oral route", optionB: "Intravenous route", optionC: "Intramuscular route", optionD: "Topical route", correctOption: "A", category: "Route" },
                { text: "Dydrogesterone (Dufogen) helps maintain pregnancy by stabilizing:", optionA: "Endometrium", optionB: "Skin", optionC: "Bones", optionD: "Eyes", correctOption: "A", category: "Benefit" },
                { text: "Dydrogesterone (Dufogen) therapy is often started after:", optionA: "Ovulation", optionB: "Birth", optionC: "Menopause", optionD: "Childhood", correctOption: "A", category: "Usage" },
                { text: "A possible mild side effect of Dydrogesterone (Dufogen) is:", optionA: "Nausea", optionB: "Paralysis", optionC: "Blindness", optionD: "Deafness", correctOption: "A", category: "Side Effect" },
                { text: "Dydrogesterone (Dufogen) is commonly used in cases of:", optionA: "Threatened abortion", optionB: "Heart attack", optionC: "Stroke", optionD: "Epilepsy", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) supports the hormone balance in:", optionA: "Female reproductive system", optionB: "Digestive system", optionC: "Respiratory system", optionD: "Nervous system", correctOption: "A", category: "Action" },
                { text: "Dydrogesterone (Dufogen) is structurally related to:", optionA: "Steroid hormones", optionB: "Proteins", optionC: "Vitamins", optionD: "Enzymes", correctOption: "A", category: "Structure" },
                { text: "Dydrogesterone (Dufogen) is mainly prescribed for:", optionA: "Women of reproductive age", optionB: "Children", optionC: "Elderly men", optionD: "Athletes", correctOption: "A", category: "Prescription" },
                { text: "Dydrogesterone (Dufogen) can be used in:", optionA: "Endometriosis treatment", optionB: "Bacterial pneumonia", optionC: "Viral fever", optionD: "Tuberculosis", correctOption: "A", category: "Indication" },
                { text: "The pharmacological action of Dydrogesterone (Dufogen) resembles:", optionA: "Natural progesterone", optionB: "Insulin", optionC: "Adrenaline", optionD: "Dopamine", correctOption: "A", category: "Mechanism" },
                { text: "Which reproductive condition involves absence of menstruation treated with Dydrogesterone (Dufogen)?", optionA: "Amenorrhea", optionB: "Leukemia", optionC: "Gastritis", optionD: "Pneumonia", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) supports implantation by preparing the:", optionA: "Endometrium", optionB: "Lungs", optionC: "Liver", optionD: "Skin", correctOption: "A", category: "Action" },
                { text: "Dydrogesterone (Dufogen) therapy may reduce symptoms of:", optionA: "Premenstrual syndrome", optionB: "Asthma", optionC: "Diabetes", optionD: "Tuberculosis", correctOption: "A", category: "Benefit" },
                { text: "Dydrogesterone (Dufogen) tablets are usually taken:", optionA: "Orally", optionB: "Intravenously", optionC: "Subcutaneously", optionD: "Rectally", correctOption: "A", category: "Route" },
                { text: "Dydrogesterone (Dufogen) mainly affects the:", optionA: "Female reproductive organs", optionB: "Lungs", optionC: "Kidneys", optionD: "Skin", correctOption: "A", category: "Action" },
                { text: "Dydrogesterone (Dufogen) can help prevent:", optionA: "Recurrent miscarriage", optionB: "Skin infections", optionC: "Eye disease", optionD: "Hearing loss", correctOption: "A", category: "Prevention" },
                { text: "Dydrogesterone (Dufogen) is used to treat:", optionA: "Hormonal imbalance", optionB: "Bacterial infection", optionC: "Viral infection", optionD: "Parasitic infection", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) helps regulate:", optionA: "Female hormones", optionB: "Blood glucose", optionC: "Blood pressure", optionD: "Body temperature", correctOption: "A", category: "Benefit" },
                { text: "Dydrogesterone (Dufogen) can support fertility treatment in:", optionA: "IVF cycles", optionB: "Kidney transplant", optionC: "Liver disease", optionD: "Heart surgery", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) maintains pregnancy by:", optionA: "Supporting progesterone action", optionB: "Increasing insulin", optionC: "Decreasing estrogen", optionD: "Increasing adrenaline", correctOption: "A", category: "Mechanism" },
                { text: "The primary benefit of Dydrogesterone (Dufogen) is:", optionA: "Hormonal support", optionB: "Pain relief", optionC: "Antibacterial action", optionD: "Antiviral action", correctOption: "A", category: "Benefit" },
                { text: "Dydrogesterone (Dufogen) therapy may help reduce:", optionA: "Menstrual irregularities", optionB: "Blood sugar", optionC: "Blood cholesterol", optionD: "Blood pressure", correctOption: "A", category: "Benefit" },
                { text: "Dydrogesterone (Dufogen) acts mainly on:", optionA: "Progesterone receptors", optionB: "Insulin receptors", optionC: "Dopamine receptors", optionD: "Histamine receptors", correctOption: "A", category: "Action" },
                { text: "Dydrogesterone (Dufogen) may help women experiencing:", optionA: "Infertility", optionB: "Hypertension", optionC: "Asthma", optionD: "Arthritis", correctOption: "A", category: "Indication" },
                { text: "Dydrogesterone (Dufogen) is classified as:", optionA: "Hormonal therapy", optionB: "Antibiotic therapy", optionC: "Antifungal therapy", optionD: "Antiviral therapy", correctOption: "A", category: "Classification" },
                { text: "Dydrogesterone (Dufogen) is primarily used in:", optionA: "Gynecology", optionB: "Cardiology", optionC: "Neurology", optionD: "Dermatology", correctOption: "A", category: "Usage" },
                { text: "Dydrogesterone (Dufogen) can help prepare the uterus for:", optionA: "Pregnancy", optionB: "Surgery", optionC: "Digestion", optionD: "Breathing", correctOption: "A", category: "Benefit" },
                { text: "The therapeutic effect of Dydrogesterone (Dufogen) is mainly due to:", optionA: "Progesterone activity", optionB: "Estrogen inhibition", optionC: "Insulin stimulation", optionD: "Cortisol release", correctOption: "A", category: "Action" }
            ];

            const fullSet = clinicalTemplates.map((template, i) => ({
                text: template.text,
                optionA: template.optionA,
                optionB: template.optionB,
                optionC: template.optionC,
                optionD: template.optionD,
                correctOption: template.correctOption,
                difficulty: i < 25 ? 1 : 2, // Split 50/50 for Round 1 and Round 2
                category: template.category
            }));

            await prisma.question.createMany({ data: fullSet });
        }

        const whereClause = difficultyStr ? { difficulty: parseInt(difficultyStr) } : {};
        const questions = await prisma.question.findMany({ where: whereClause });

        return NextResponse.json(questions);
    } catch (error) {
        console.error("API GET Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
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
