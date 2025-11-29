import { NextRequest, NextResponse } from 'next/server';
import { ChatResponse } from '@/types';

// Note: Chat functionality is now handled client-side using transformers.js
// This endpoint is kept for backward compatibility but redirects to client-side processing
export async function POST(request: NextRequest) {
    return NextResponse.json(
        {
            message: "Chat functionality is now handled client-side. Please use the client-side AI Stylist.",
            outfits: [],
        } as ChatResponse,
        { status: 200 }
    );
}
