"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { Search, Utensils } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function LogFoodModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Masukkan nama makanan dulu");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/food-search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Gagal mengambil data dari USDA API");

      const data = await res.json();
      setResults(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFood) return;
    setSaving(true);
    setError("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setError("User belum login");
      setSaving(false);
      return;
    }

    try {
      const qtyNum = Number(quantity);
      if (Number.isNaN(qtyNum) || qtyNum <= 0) {
        setError("Jumlah porsi tidak valid");
        setSaving(false);
        return;
      }

      const { data: rpcData, error: insertError } = await supabase.rpc(
        "log_food",
        {
          p_user_id: user.id,
          p_food_name: selectedFood.name,
          p_calories_kcal: Math.round(Number(selectedFood.calories)),
          p_serving_qty: qtyNum,
          p_serving_unit: selectedFood.unit || "portion",
        }
      );

      if (insertError) throw insertError;
      if (rpcData) console.log("✅ log_food result:", rpcData);

      alert("✅ Log makanan berhasil disimpan!");
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-visible">
        <DialogHeader className="flex items-center justify-start px-4 pt-4">
          <Logo size={35} className="mr-auto" />
          <VisuallyHidden>
            <DialogTitle>Log Makanan</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-gray-700" />
            <h3 className="text-sm font-medium text-gray-800">
              Catatan Makanan
            </h3>
          </div>

          {!selectedFood && (
            <>
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari makanan (misal: apel)"
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-black hover:bg-gray-400 text-white px-3"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <ScrollArea className="max-h-80 mt-4 border rounded-md overflow-auto">
                {loading ? (
                  <p className="text-center text-gray-500 p-3 text-sm">
                    Mencari...
                  </p>
                ) : results.length > 0 ? (
                  results.map((food, idx) => (
                    <div
                      key={idx}
                      className="p-3 border-b hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedFood(food)}
                    >
                      <p className="font-medium text-gray-800 text-sm">
                        {food.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {food.calories} kcal
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm p-3">
                    Belum ada hasil pencarian
                  </p>
                )}
              </ScrollArea>
            </>
          )}

          {selectedFood && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {selectedFood.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedFood.calories} kcal / {selectedFood.unit || "porsi"}
                </p>
              </div>

              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Jumlah porsi"
                className="text-sm"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedFood(null)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ backgroundColor: "#C2E66E" }}
                  className="text-black hover:brightness-95"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
