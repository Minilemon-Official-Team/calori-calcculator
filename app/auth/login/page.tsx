"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password.trim(),
        });

        if (error) {
            setLoading(false);
            setError(error.message);
            return;
        }

        const userId = data.user?.id;

        const { data: profile } = await supabase
            .from("profiles")
            .select("current_weight_kg")
            .eq("id", userId)
            .single();

        if (!profile || Number(profile.current_weight_kg) === 0) {
            router.push("/setup-profile");
        } else {
            router.push("/dashboard");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col justify-center items-center px-10">
                <div className="flex justify-center mb-10">
                    <Logo size={80} />
                </div>

                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-sm space-y-5"
                >
                    <div className="flex items-center border rounded-md px-3 py-2 gap-2">
                        <Mail className="w-5 h-5 " />
                        <Input
                            type="email"
                            placeholder="Email"
                            className="border-none shadow-none focus:ring-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center border rounded-md px-3 py-2 gap-2">
                        <Lock className="w-5 h-5 " />
                        <Input
                            type="password"
                            placeholder="Password"
                            className="border-none shadow-none focus:ring-0"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C2E66E] text-black font-semibold hover:bg-[#b8dc66]"
                    >
                        {loading ? "Loading..." : "Login"}
                    </Button>

                    <p className="text-sm text-center">
                        Apakah kamu sudah mempunyai akun?{" "}
                        <Link
                            href="/auth/register"
                            className="text-[#C2E66E] font-semibold"
                        >
                            Register
                        </Link>
                    </p>
                </form>
            </div>
            <div className="hidden md:block bg-[url('/images/auth-bg.jpg')] bg-cover bg-center" />
        </div>
    );
}
