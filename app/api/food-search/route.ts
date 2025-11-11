import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabaseClient";

// 1. Get API Key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

// 2. Initialize Gemini AI with the previously successful model
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const query = url.searchParams.get("q");

        if (!query || typeof query !== "string" || !query.trim()) {
            return NextResponse.json(
                { error: "Query parameter 'q' dibutuhkan" },
                { status: 400 }
            );
        }

        // Search USDA FoodData Central API
        const fooddata_api_key = process.env.FOODDATA_API_KEY;

        if (fooddata_api_key) {
            try {
                const usdaUrl = `https://fdc.nal.usda.gov/api/foods/search?query=${encodeURIComponent(
                    query
                )}&pageSize=10&api_key=${fooddata_api_key}`;
                const response = await fetch(usdaUrl);

                if (response.ok) {
                    const data = await response.json();

                    // Transform USDA response to our format
                    interface USDAFood {
                        description: string;
                        servingSizeUnit?: string;
                        foodPortions?: Array<{
                            measure?: { abbreviation?: string };
                        }>;
                        foodNutrients?: Array<{
                            nutrientCode: string;
                            value: number;
                        }>;
                    }

                    const foods = (data.foods || [])
                        .slice(0, 10)
                        .map((food: USDAFood) => {
                            // Find serving size and calories
                            const servingSize =
                                food.servingSizeUnit ||
                                food.foodPortions?.[0]?.measure?.abbreviation ||
                                "portion";
                            const calories =
                                food.foodNutrients?.find(
                                    (n: {
                                        nutrientCode: string;
                                        value: number;
                                    }) => n.nutrientCode === "1008"
                                )?.value || 0; // 1008 = Energy (kcal)

                            return {
                                name: food.description || "",
                                calories: Math.round(Number(calories)),
                                unit: servingSize,
                            };
                        });

                    return NextResponse.json(foods);
                }
            } catch (error) {
                console.error("Error calling USDA API:", error);
                // Fall through to demo data
            }
        }

        // Fallback: Return demo/hardcoded data if API fails or key not set
        // This is based on common food items
        const demoData: Record<
            string,
            Array<{ name: string; calories: number; unit: string }>
        > = {
            apple: [
                {
                    name: "APPLE, RAW",
                    calories: 52,
                    unit: "per 100g",
                },
                {
                    name: "APPLE, DRIED",
                    calories: 243,
                    unit: "per 100g",
                },
                {
                    name: "APPLE, BAKED",
                    calories: 113,
                    unit: "per 100g",
                },
            ],
            banana: [
                {
                    name: "BANANA, RAW",
                    calories: 89,
                    unit: "per 100g",
                },
            ],
            chicken: [
                {
                    name: "CHICKEN BREAST, RAW",
                    calories: 165,
                    unit: "per 100g",
                },
                {
                    name: "CHICKEN BREAST, COOKED",
                    calories: 165,
                    unit: "per 100g",
                },
            ],
            rice: [
                {
                    name: "RICE, WHITE, COOKED",
                    calories: 130,
                    unit: "per 100g",
                },
            ],
            egg: [
                {
                    name: "EGG, WHOLE, RAW",
                    calories: 155,
                    unit: "per 100g",
                },
            ],
            bread: [
                {
                    name: "BREAD, WHITE",
                    calories: 265,
                    unit: "per 100g",
                },
                {
                    name: "BREAD, WHOLE WHEAT",
                    calories: 247,
                    unit: "per 100g",
                },
            ],
            fish: [
                {
                    name: "SALMON, RAW",
                    calories: 208,
                    unit: "per 100g",
                },
                {
                    name: "TUNA, RAW",
                    calories: 144,
                    unit: "per 100g",
                },
            ],
            milk: [
                {
                    name: "MILK, WHOLE",
                    calories: 61,
                    unit: "per 100g",
                },
                {
                    name: "MILK, SKIMMED",
                    calories: 33,
                    unit: "per 100g",
                },
            ],
            cheese: [
                {
                    name: "CHEESE, CHEDDAR",
                    calories: 402,
                    unit: "per 100g",
                },
            ],
            beef: [
                {
                    name: "BEEF, RAW",
                    calories: 250,
                    unit: "per 100g",
                },
                {
                    name: "BEEF, COOKED",
                    calories: 271,
                    unit: "per 100g",
                },
            ],
            yogurt: [
                {
                    name: "YOGURT, PLAIN",
                    calories: 61,
                    unit: "per 100g",
                },
            ],
            broccoli: [
                {
                    name: "BROCCOLI, RAW",
                    calories: 34,
                    unit: "per 100g",
                },
            ],
            carrot: [
                {
                    name: "CARROT, RAW",
                    calories: 41,
                    unit: "per 100g",
                },
            ],
            tomato: [
                {
                    name: "TOMATO, RAW",
                    calories: 18,
                    unit: "per 100g",
                },
            ],
            potato: [
                {
                    name: "POTATO, BAKED",
                    calories: 77,
                    unit: "per 100g",
                },
            ],
        };

        // Search: convert query to lowercase and find best match
        const queryLower = query.toLowerCase().trim();
        let results: Array<{ name: string; calories: number; unit: string }> =
            [];

        // First, try exact key match or prefix match
        for (const [key, foods] of Object.entries(demoData)) {
            if (
                key === queryLower ||
                key.startsWith(queryLower) ||
                queryLower.includes(key)
            ) {
                results = foods;
                break;
            }
        }

        // If no match, try substring match
        if (results.length === 0) {
            for (const [key, foods] of Object.entries(demoData)) {
                if (key.includes(queryLower) || queryLower.includes(key)) {
                    results = foods;
                    break;
                }
            }
        }

        console.log(
            `[food-search GET] query="${query}" matched=${results.length > 0}`
        );
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in food-search GET:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        const sourceText = text?.trim().toLowerCase();

        if (!sourceText || typeof sourceText !== "string") {
            return NextResponse.json(
                {
                    error: "Parameter 'text' dibutuhkan dan harus berupa string.",
                },
                { status: 400 }
            );
        }

        // 4. Check cache in the database first
        const { data: cachedTranslation, error: cacheError } = await supabase
            .from("translations")
            .select("translated_text")
            .eq("source_text", sourceText)
            .single();

        if (cacheError && cacheError.code !== "PGRST116") {
            // Ignore 'PGRST116' error (row not found), but log other errors
            console.error("Supabase cache check error:", cacheError);
        }

        if (cachedTranslation) {
            // Cache Hit: Return result from the database
            return NextResponse.json({
                translatedText: cachedTranslation.translated_text,
            });
        }

        // Cache Miss: Call Gemini API
        const prompt = `Terjemahkan nama makanan berikut ke Bahasa Inggris. Hanya kembalikan teks terjemahannya saja, tanpa penjelasan. Teks Asli: "${sourceText}". Terjemahan:`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.0 },
        });

        const translatedText = result.response.text().trim();

        // Save the new result to the database for the next request
        const { error: insertError } = await supabase
            .from("translations")
            .insert({
                source_text: sourceText,
                translated_text: translatedText,
            });

        if (insertError) {
            console.error("Supabase cache insert error:", insertError);
        }

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error("Error calling Gemini API for translation:", error);
        return NextResponse.json(
            {
                error: "Gagal menerjemahkan teks.",
                detail: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
