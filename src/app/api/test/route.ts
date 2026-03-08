import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const localPrisma = new PrismaClient();
        const count = await localPrisma.question.count();
        return NextResponse.json({ count });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
