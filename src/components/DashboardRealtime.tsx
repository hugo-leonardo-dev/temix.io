"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardRealtime() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const refresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        router.refresh();
      }, 1500);
    };

    const channel = supabase
      .channel("dashboard-rooms")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms" },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        refresh
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
