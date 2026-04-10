"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface RoomContextType {
  room: any;
  players: any[];
  currentRound: any;
  currentUserId: string | null;
  isLoading: boolean;
  refresh: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ 
  children, 
  initialData,
  userId = null
}: { 
  children: React.ReactNode; 
  initialData: any;
  userId?: string | null;
}) {
  const [room, setRoom] = useState(initialData);
  const [players, setPlayers] = useState(initialData.players || []);
  const [currentRound, setCurrentRound] = useState(initialData.rounds?.[0] || null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const refreshTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Helper to refresh data from server (RSC refresh)
  const triggerRefresh = () => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    
    refreshTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        console.log("🔄 [Realtime] Triggering router.refresh() to sync with server");
        router.refresh();
      });
    }, 800); // Increased debounce to ensure DB has finished writing
  };

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Sincroniza o estado local quando as props do servidor mudam (após o refresh)
    console.log("📦 [Realtime] Initial data updated from server:", initialData.status);
    setRoom(initialData);
    setPlayers(initialData.players || []);
    setCurrentRound(initialData.rounds?.[0] || null);
  }, [initialData]);

  useEffect(() => {
    const roomId = room.id;
    console.log(`🔌 [Realtime] Connecting to room channel: room-sync-${roomId}`);
    
    const channel = supabase
      .channel(`room-sync-${roomId}`)
      // 1. Mudanças na Sala (Status, etc)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          console.log("🏠 [Realtime] Room updated:", payload.new.status);
          const newRoom = payload.new;
          setRoom((prev: any) => ({ ...prev, ...newRoom }));
          
          if (newRoom.status !== room.status) {
            triggerRefresh();
          }
        }
      )
      // 2. Mudanças nas Rodadas
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds", filter: `roomId=eq.${roomId}` },
        (payload) => {
          console.log("🔄 [Realtime] Round event:", payload.eventType);
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
             setCurrentRound((prev: any) => {
               // Evita sobrescrever se for um round antigo (opcional, mas seguro)
               if (prev && payload.new.roundNumber < prev.roundNumber) return prev;
               return { ...prev, ...payload.new };
             });
          }
          triggerRefresh();
        }
      )
      // 3. Jogadores (Entrada/Saída)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `roomId=eq.${roomId}` },
        (payload) => {
          console.log("👥 [Realtime] Players changed:", payload.eventType);
          triggerRefresh();
        }
      )
      // 4. Respostas (Submissões)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "responses", filter: `roomId=eq.${roomId}` },
        (payload) => {
          console.log("📝 [Realtime] Response event:", payload.eventType);
          triggerRefresh();
        }
      )
      // 5. Votos
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `roomId=eq.${roomId}` },
        (payload) => {
          console.log("🗳️ [Realtime] Vote event:", payload.eventType);
          triggerRefresh();
        }
      )
      .subscribe((status) => {
        console.log(`📡 [Realtime] Subscription status: ${status}`);
        if (status === "CHANNEL_ERROR") {
          console.error("❌ [Realtime] Error connecting to Supabase Realtime. Check if Realtime is enabled in the dashboard.");
        }
      });

    return () => {
      console.log("🔌 [Realtime] Disconnecting from room channel");
      supabase.removeChannel(channel);
    };
  }, [room.id, room.status]); // Re-subscribe if status changes to ensure fresh listeners if needed

  return (
    <RoomContext.Provider value={{ room, players, currentRound, currentUserId: userId, isLoading: isPending, refresh: triggerRefresh }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoom must be used within a RoomProvider");
  return context;
};
