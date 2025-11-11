import { NextRequest, NextResponse } from "next/server";
import { indonesianFoodTranslations } from "@/lib/foodTranslations";

/**
 * POST /api/translate
 * Translate food name from Indonesian/local language to English
 */ export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== "string" || !text.trim()) {
            return NextResponse.json(
                { error: "Text harus diisi" },
                { status: 400 }
            );
        }

        const trimmedText = text.trim().toLowerCase();
        console.log(`[translate] Translating: "${trimmedText}"`);

        // Check if text is in translation map
        if (indonesianFoodTranslations[trimmedText]) {
            const translated = indonesianFoodTranslations[trimmedText];
            console.log(
                `[translate] Found in map: "${trimmedText}" -> "${translated}"`
            );
            return NextResponse.json(
                { translatedText: translated },
                { status: 200 }
            );
        }

        // If not found in map, return original (might be English already)
        console.log(
            `[translate] Not in map, returning original: "${trimmedText}"`
        );
        return NextResponse.json(
            { translatedText: trimmedText },
            { status: 200 }
        );
    } catch (error) {
        console.error("[translate] Error:", error);
        return NextResponse.json(
            { error: "Gagal memproses terjemahan" },
            { status: 500 }
        );
    }
}
