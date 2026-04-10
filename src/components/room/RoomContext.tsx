"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface RoomContextType {
  room: any;
  players: any[];
  currentRound: any;
  isLoading: boolean;
  refresh: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode; 
  initialData: any 
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
        console.log("🔄 Triggering router.refresh()");
        router.refresh();
      });
    }, 500); // 500ms debounce
  };

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Sync local state with initialData if it changes from props (e.g. on navigation)
    setRoom(initialData);
    setPlayers(initialData.players || []);
    setCurrentRound(initialData.rounds?.[0] || null);
  }, [initialData]);

  useEffect(() => {
    const roomId = room.id;
    
    const channel = supabase
      .channel(`room-sync-${roomId}`)
      // 1. Listen to Room status changes
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          console.log("Room updated:", payload.new);
          setRoom((prev: any) => ({ ...prev, ...payload.new }));
          // If status changed, we might want to refresh the whole page to swap components (Lobby -> Gameplay)
          if (payload.new.status !== room.status) {
            triggerRefresh();
          }
        }
      )
      // 2. Listen to Rounds (Status changes, new round)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds", filter: `roomId=eq.${roomId}` },
        (payload) => {
          console.log("Round event:", payload.eventType, payload.new);
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            // For rounds, a status change often means we need new theme/responses data
            // which the payload might not have in full (like the theme object).
            // So we trigger a refresh to let Server Components fetch the full nested data.
            triggerRefresh();
          }
        }
      )
      // 3. Listen to Player joins/leaves (room_players table)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `roomId=eq.${roomId}` },
        () => {
          console.log("Players changed");
          triggerRefresh(); // Refresh to get the Player profile (relation)
        }
      )
      // 4. Listen to Responses (submissions)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "responses", filter: `roomId=eq.${roomId}` },
        () => {
          console.log("Response submitted");
          // Debounced refresh for responses to show count increment
          triggerRefresh();
        }
      )
      // 5. Listen to Votes
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `roomId=eq.${roomId}` },
        () => {
          console.log("Vote cast");
          // Only refresh if we are in the voting phase and need to show real-time counts
          triggerRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, room.status]);

  return (
    <RoomContext.Provider value={{ room, players, currentRound, isLoading: isPending, refresh: triggerRefresh }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoom must be used within a RoomProvider");
  return context;
};
