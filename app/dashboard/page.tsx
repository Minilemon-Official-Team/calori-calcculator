"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import dayjs from "dayjs";

export default function DashboardPage() {
    const [date, setDate] = useState(new Date());
    const [summary, setSummary] = useState({
        total_calories_in: 0,
        total_calories_out: 0,
        net_calories: 0,
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: summaryData } = await supabase.rpc(
                "get_daily_summary",
                {
                    p_user_id: user.id,
                    p_log_date: dayjs(date).format("YYYY-MM-DD"),
                }
            );
            if (summaryData && summaryData.length > 0) {
                setSummary(summaryData[0]);
            }

            const { data: foodLogs } = await supabase
                .from("food_logs")
                .select("id, food_name, calories_kcal, log_date")
                .eq("user_id", user.id)
                .eq("log_date", dayjs(date).format("YYYY-MM-DD"));

            const { data: activityLogs } = await supabase
                .from("activity_logs")
                .select(
                    "id, duration_minutes, calories_burned, log_date, met_activity_id"
                )
                .eq("user_id", user.id)
                .eq("log_date", dayjs(date).format("YYYY-MM-DD"));

            const merged = [
                ...(foodLogs?.map((f) => ({
                    id: f.id,
                    item: f.food_name,
                    detail: "Makanan",
                    calories: f.calories_kcal,
                })) ?? []),
                ...(activityLogs?.map((a) => ({
                    id: a.id,
                    item: `Aktivitas #${a.met_activity_id}`,
                    detail: `Durasi ${a.duration_minutes} menit`,
                    calories: -a.calories_burned,
                })) ?? []),
            ];

            setLogs(merged);
            setLoading(false);
        };

        fetchData();
    }, [date]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <CalendarDays className="w-4 h-4" />
                            {dayjs(date).format("DD MMM YYYY")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Ringkasan Kalori */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Kalori Masuk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {summary.total_calories_in} kkal
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kalori Terbakar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {summary.total_calories_out} kkal
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kalori Bersih</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {summary.net_calories} kkal
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabel Log */}
            <Card>
                <CardHeader>
                    <CardTitle>Log Hari Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Detail</TableHead>
                                    <TableHead>Kalori</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.item}</TableCell>
                                            <TableCell>{log.detail}</TableCell>
                                            <TableCell>
                                                {log.calories} kkal
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-center text-gray-500"
                                        >
                                            Belum ada data hari ini
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
