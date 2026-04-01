"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RoomRealtime({ roomId }: { roomId: string }) {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const refresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        router.refresh();
      }, 500); // 500ms debounce
    };

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds", filter: `roomId=eq.${roomId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "responses" },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        refresh
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Connected and listening to Room ${roomId}`);
        }
      });

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [roomId, router]);

  return null; // Componente fantasma (sem UI)
}
