"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    const passwordValidation = useMemo(() => {
        const errors = [];
        if (password.length < 8) errors.push("Minimal 8 karakter.");
        if (!/[a-z]/.test(password))
            errors.push("Setidaknya satu huruf kecil.");
        if (!/[A-Z]/.test(password))
            errors.push("Setidaknya satu huruf besar.");
        if (!/\d/.test(password)) errors.push("Setidaknya satu angka.");
        if (!/[^a-zA-Z0-9]/.test(password))
            errors.push("Setidaknya satu karakter spesial.");
        return errors;
    }, [password]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (passwordValidation.length > 0) {
            setError("Password tidak memenuhi syarat.");
            return;
        }
        if (password !== confirm) {
            return setError("Password tidak sama");
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password.trim(),
            options: {
                data: { full_name: fullname },
            },
        });

        if (error) {
            console.error("Supabase sign up error:", error);
            setError(error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            // Profile is automatically created by Supabase trigger
            // Just redirect to login
            router.push("/auth/login");
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
                    onSubmit={handleRegister}
                    className="w-full max-w-sm space-y-5"
                >
                    <div className="flex items-center border rounded-md px-3 py-2 gap-2">
                        <User className="w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Fullname"
                            className="border-none shadow-none focus:ring-0"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center border rounded-md px-3 py-2 gap-2">
                        <Mail className="w-5 h-5" />
                        <Input
                            type="email"
                            placeholder="Email Address"
                            className="border-none shadow-none focus:ring-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center border rounded-md px-3 py-2 gap-2">
                        <Lock className="w-5 h-5" />
                        <Input
                            type="password"
                            placeholder="Password"
                            className="border-none shadow-none focus:ring-0"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {password && passwordValidation.length > 0 && (
                        <div className="text-xs text-gray-500 space-y-1">
                            <p className="font-medium">
                                Password harus mengandung:
                            </p>
                            <ul className="list-disc pl-4">
                                {passwordValidation.map((err) => (
                                    <li key={err} className="text-red-500">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center border rounded-md px-3 py-2 gap-2">
                        <Lock className="w-5 h-5" />
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            className="border-none shadow-none focus:ring-0"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C2E66E] text-black font-semibold hover:bg-[#b8dc66]"
                    >
                        {loading ? "Loading..." : "Register"}
                    </Button>

                    <p className="text-sm text-center">
                        Sudah memiliki akun?{" "}
                        <Link
                            href="/auth/login"
                            className="text-[#C2E66E] font-semibold"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
            <div className="hidden md:block bg-[url('/images/auth-bg.jpg')] bg-cover bg-center" />
        </div>
    );
}
