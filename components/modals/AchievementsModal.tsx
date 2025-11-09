"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

import { Star, Medal, Target, Award, Trophy, Crown } from "lucide-react";

const BADGES = [
  { name: "First Step", coins: 100, color: "#6EC1E4", bg: "#E3F4FF" },
  { name: "Getting Started", coins: 500, color: "#34D399", bg: "#E4FAF1" },
  { name: "On Track", coins: 1000, color: "#A855F7", bg: "#F3E8FF" },
  { name: "Dedicated", coins: 1500, color: "#F59E0B", bg: "#FFF3D6" },
  { name: "Superstar", coins: 2500, color: "#EC4899", bg: "#FFE4F2" },
  { name: "Champion", coins: 10000, color: "#FACC15", bg: "#FFF9C2" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({ isOpen, onClose }: Props) {
  const [totalCoins, setTotalCoins] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_stats")
        .select("total_coins")
        .eq("user_id", user.id)
        .single();

      const coins = data?.total_coins || 0;
      setTotalCoins(coins);
      setUnlockedBadges(BADGES.filter((b) => coins >= b.coins).length);
    };

    fetchStats();
  }, [isOpen]);

  const progress = Math.round((unlockedBadges / BADGES.length) * 100);
  const nextBadge = BADGES.find((b) => b.coins > totalCoins);
  const remaining = nextBadge ? nextBadge.coins - totalCoins : 0;

  const ICONS = [Star, Medal, Target, Award, Trophy, Crown];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl bg-white -p6 shadow-xl">
        <div className="flex items-center gap-3 mb-7 -ml-4">
          <Logo size={45} />
        </div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <Trophy className="w-5 h-5 text-[#A8D96F]" />
            Pencapaian Kamu
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-600">
            {unlockedBadges} dari {BADGES.length} badge terbuka
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-4 max-h-[60vh] pr-2">
          <div className="mt-2">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <Progress value={progress} />
          </div>

          <div className="mt-4 bg-[#F0FCD9] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-700 font-medium">Total Koin Kamu</p>

            <p className="text-2xl font-semibold text-gray-900">
              {totalCoins} Koin
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {BADGES.map((b, i) => {
              const Icon = ICONS[i];
              const unlocked = totalCoins >= b.coins;

              return (
                <div key={i} className="flex flex-col items-center p-2">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-all"
                    style={{
                      backgroundColor: unlocked ? b.bg : "#E5E5E5",
                    }}
                  >
                    <Icon size={28} color={unlocked ? b.color : "#9CA3AF"} />
                  </div>

                  <p
                    className={`text-xs text-center mt-2 font-medium ${
                      unlocked ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {b.name}
                  </p>
                </div>
              );
            })}
          </div>

          {progress === 100 && (
            <div className="mt-6 p-3 bg-[#F6FBEF] border border-[#DCEFCC] rounded-xl text-center">
              <p className="text-sm">🎉 Selamat!</p>
              <p className="text-sm text-gray-600">
                Kamu telah membuka semua pencapaian!
              </p>
            </div>
          )}

          {progress < 100 && (
            <div className="mt-6 bg-[#E6F2FF] p-3 rounded-lg text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <p className="font-semibold">Pencapaian Selanjutnya</p>
              </div>
              <p className="mt-1">
                Kumpulkan <b>{remaining}</b> koin lagi untuk membuka{" "}
                <b>{nextBadge?.name}</b>
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
