"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetupProfilePage() {
    const router = useRouter();
    const [weight, setWeight] = useState("");
    const [target, setTarget] = useState("2000");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return setError("User tidak ditemukan.");

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                current_weight_kg: Number(weight),
                target_calories: Number(target),
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (updateError) setError(updateError.message);
        else router.push("/dashboard");

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Satu Langkah Terakhir!</CardTitle>
                    <CardDescription>
                        Kami perlu info ini untuk menghitung kalori Anda secara
                        akurat.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="number"
                            placeholder="Berat Badan Saat Ini (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Target Kalori Harian (kkal)"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading
                            ? "Menyimpan..."
                            : "Simpan & Lanjutkan ke Dashboard"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
