"use client";

import { useState } from "react";
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Password tidak sama");
    if (password.length < 6) return setError("Password minimal 6 karakter");

    setLoading(true);
    setError("");

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
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: `user_${data.user.id.slice(0, 8)}`,
        full_name: fullname,
        current_weight_kg: 0.0,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

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

        <form onSubmit={handleRegister} className="w-full max-w-sm space-y-5">
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
            <Link href="/auth/login" className="text-[#C2E66E] font-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:block bg-[url('/images/auth-bg.jpg')] bg-cover bg-center" />
    </div>
  );
}
