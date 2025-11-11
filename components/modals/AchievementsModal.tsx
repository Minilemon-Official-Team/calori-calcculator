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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({ isOpen, onClose }: Props) {
  const [achievements, setAchievements] = useState<
    { id: number; name: string; description: string }[]
  >([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState(0);

  const COLORS = [
    { color: "#6EC1E4", bg: "#E3F4FF" },
    { color: "#34D399", bg: "#E4FAF1" },
    { color: "#A855F7", bg: "#F3E8FF" },
    { color: "#F59E0B", bg: "#FFF3D6" },
    { color: "#EC4899", bg: "#FFE4F2" },
    { color: "#FACC15", bg: "#FFF9C2" },
  ];
  const ICONS = [Star, Medal, Target, Award, Trophy, Crown];

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil total coins user
      const { data: stats } = await supabase
        .from("user_stats")
        .select("total_coins")
        .eq("user_id", user.id)
        .single();
      const coins = stats?.total_coins || 0;
      setTotalCoins(coins);

      // Ambil semua achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("id, name, description")
        .order("id", { ascending: true });

      if (achievementsData) setAchievements(achievementsData);

      // Hitung badge yang sudah unlocked
      const unlocked = achievementsData
        ? achievementsData.filter(
            (_, i) => coins >= [100, 500, 1000, 1500, 2500, 10000][i]
          ).length
        : 0;
      setUnlockedBadges(unlocked);
    };

    fetchData();
  }, [isOpen]);

  const progress = achievements.length
    ? Math.round((unlockedBadges / achievements.length) * 100)
    : 0;

  const nextBadge = achievements[unlockedBadges];
  const remaining =
    nextBadge && unlockedBadges < 6
      ? [100, 500, 1000, 1500, 2500, 10000][unlockedBadges] - totalCoins
      : 0;

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
            {unlockedBadges} dari {achievements.length} badge terbuka
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
            {achievements.map((ach, i) => {
              const Icon = ICONS[i] || Star;
              const { color, bg } = COLORS[i % COLORS.length];
              const unlocked =
                totalCoins >= [100, 500, 1000, 1500, 2500, 10000][i];

              return (
                <div key={ach.id} className="flex flex-col items-center p-2">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-all"
                    style={{
                      backgroundColor: unlocked ? bg : "#E5E5E5",
                    }}
                  >
                    <Icon size={28} color={unlocked ? color : "#9CA3AF"} />
                  </div>

                  <p
                    className={`text-xs text-center mt-2 font-medium ${
                      unlocked ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {ach.name}
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

          {progress < 100 && nextBadge && (
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
