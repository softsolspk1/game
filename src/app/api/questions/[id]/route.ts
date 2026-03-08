import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
    try {
        const id = request.url.split('/').pop() || "";
        await prisma.question.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const id = request.url.split('/').pop() || "";
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
