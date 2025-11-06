import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query)
        return NextResponse.json(
            { error: "Missing query parameter" },
            { status: 400 }
        );

    try {
        const res = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
                query
            )}&pageSize=10&api_key=${process.env.FOODDATA_API_KEY}`
        );

        const data = await res.json();

        // Maps the raw food data from the API to a simplified structure for the client.
        const foods =
            data.foods?.map((item: any) => ({
                name: item.description,
                calories:
                    item.foodNutrients?.find(
                        (n: any) => n.nutrientName === "Energy"
                    )?.value ?? 0,
                unit: "kcal",
            })) ?? [];

        return NextResponse.json(foods);
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch food data" },
            { status: 500 }
        );
    }
}
