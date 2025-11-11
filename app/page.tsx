"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { BarChart, Zap, Award, BrainCircuit } from "lucide-react";

export default function LandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                // If a session exists, redirect to the dashboard
                router.replace("/dashboard");
            } else {
                // If no session, stop loading and show the landing page
                setLoading(false);
            }
        };

        checkSession();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Logo size={80} />
            </div>
        );
    }

    const handleProtectedAction = () => {
        alert(
            "Silakan login atau register terlebih dahulu untuk menggunakan fitur ini."
        );
    };

    const features = [
        {
            icon: <BarChart className="w-8 h-8 text-[#C2E66E]" />,
            title: "Lacak Kalori",
            description:
                "Catat asupan makanan dan minuman harian Anda dengan mudah.",
        },
        {
            icon: <Zap className="w-8 h-8 text-[#C2E66E]" />,
            title: "Catat Aktivitas",
            description:
                "Monitor kalori yang terbakar dari setiap aktivitas fisik.",
        },
        {
            icon: <BrainCircuit className="w-8 h-8 text-[#C2E66E]" />,
            title: "AI Coach",
            description:
                "Dapatkan motivasi dan masukan cerdas dari pelatih AI.",
        },
        {
            icon: <Award className="w-8 h-8 text-[#C2E66E]" />,
            title: "Gamifikasi",
            description:
                "Kumpulkan koin dan raih pencapaian untuk tetap termotivasi.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Logo size={40} />
                <div className="space-x-2">
                    <Button variant="ghost" asChild>
                        <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button className="bg-[#C2E66E] text-black hover:bg-[#b8dc66]">
                        <Link href="/auth/register">Register</Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-6 text-center py-20 md:py-32">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Mulai Perjalanan Sehatmu dengan{" "}
                    <span className="text-[#C2E66E]">CalPal</span>
                </h1>
                <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                    Lacak kalori, monitor aktivitas, dan capai target kebugaran
                    Anda dengan cara yang cerdas dan menyenangkan.
                </p>
                <div className="mt-8">
                    <Button
                        size="lg"
                        className="bg-[#C2E66E] text-black hover:bg-[#b8dc66]"
                        onClick={handleProtectedAction}
                    >
                        Mulai Lacak Sekarang
                    </Button>
                </div>
            </main>

            <section id="features" className="bg-gray-800 py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Fitur Unggulan Kami
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-gray-700 p-6 rounded-lg text-center"
                            >
                                <div className="flex justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
