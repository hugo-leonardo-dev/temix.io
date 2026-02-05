"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Send, Clock, Loader2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

type CategoryResponse = {
  category: string;
  content: string;
  mediaUrl?: string;
};

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    placeholder: string;
    inputType: "text" | "textarea" | "url" | "file" | "spotify";
    helpText?: string;
  }
> = {
  TEXT: {
    label: "Text Response",
    placeholder: "Write your text response...",
    inputType: "textarea",
  },
  IMAGE: {
    label: "Image",
    placeholder: "https://example.com/image.jpg",
    inputType: "url",
    helpText: "Paste an image URL or upload (coming soon)",
  },
  PHOTO: {
    label: "Photo",
    placeholder: "https://example.com/photo.jpg",
    inputType: "url",
    helpText: "Paste a photo URL or upload (coming soon)",
  },
  VIDEO: {
    label: "Video",
    placeholder: "https://youtube.com/watch?v=... or video URL",
    inputType: "url",
    helpText: "YouTube, Vimeo, or direct video link",
  },
  AUDIO: {
    label: "Audio/Music",
    placeholder: "Search for a song...",
    inputType: "spotify",
    helpText: "Spotify integration coming soon",
  },
  DRAWING: {
    label: "Drawing",
    placeholder: "https://example.com/drawing.jpg",
    inputType: "url",
    helpText: "Paste a drawing URL or upload (coming soon)",
  },
};

export default function SubmitPhase({
  room,
  round,
}: {
  room: any;
  round: any;
}) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, CategoryResponse>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = room.allowedCategories || [];

  // Inicializar respostas vazias para cada categoria
  useEffect(() => {
    const initialResponses: Record<string, CategoryResponse> = {};
    categories.forEach((cat: string) => {
      initialResponses[cat] = {
        category: cat,
        content: "",
        mediaUrl: "",
      };
    });
    setResponses(initialResponses);
  }, [categories]);

  // Verificar se já submeteu
  useEffect(() => {
    const userResponses = round.responses?.filter(
      (r: any) => r.playerId === room.currentUserId,
    );
    if (userResponses && userResponses.length > 0) {
      setSubmitted(true);
    }
  }, [round.responses, room.currentUserId]);

  const updateResponse = (
    category: string,
    field: "content" | "mediaUrl",
    value: string,
  ) => {
    setResponses((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    setError(null);
  };

  const validateResponses = (): boolean => {
    for (const category of categories) {
      const response = responses[category];
      const config = CATEGORY_CONFIG[category];

      if (config.inputType === "textarea" || config.inputType === "text") {
        if (!response.content?.trim()) {
          setError(`Please fill in the ${config.label} field`);
          return false;
        }
      } else if (config.inputType === "url") {
        if (!response.content?.trim() && !response.mediaUrl?.trim()) {
          setError(`Please provide a URL for ${config.label}`);
          return false;
        }
        const urlToValidate = response.mediaUrl || response.content;
        if (urlToValidate && !isValidUrl(urlToValidate)) {
          setError(`Invalid URL for ${config.label}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateResponses()) return;

    setLoading(true);
    setError(null);

    try {
      // Preparar array de respostas
      const responsesToSubmit = categories.map((cat: string) => {
        const response = responses[cat];
        const config = CATEGORY_CONFIG[cat];

        // Para URLs, usar mediaUrl ou content como fallback
        if (config.inputType === "url") {
          return {
            category: cat,
            content: response.content || `Submitted ${config.label}`,
            mediaUrl: response.mediaUrl || response.content,
          };
        }

        return {
          category: cat,
          content: response.content,
          mediaUrl: response.mediaUrl || null,
        };
      });

      const res = await fetch(
        `/api/rooms/${room.id}/rounds/${round.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responsesToSubmit }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);

      if (data.allSubmitted) {
        setTimeout(() => router.refresh(), 1000);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-zinc-900/50 border-zinc-800 p-8 text-center max-w-md">
          <div className="mb-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Send className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">
            All Responses Submitted!
          </h2>
          <p className="text-zinc-400 mb-4">
            Waiting for other players to submit...
          </p>
          <div className="text-sm text-zinc-500">
            {Math.floor((round.responses?.length || 0) / categories.length)}/
            {room.players.length} players submitted
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Round {round.roundNumber} of {room.totalRounds}
          </Badge>

          <h1 className="text-4xl font-bold text-zinc-100 mb-2">
            {round.theme.title}
          </h1>
          {round.theme.description && (
            <p className="text-zinc-400 mb-4">{round.theme.description}</p>
          )}

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {categories.map((cat: string) => (
              <Badge key={cat} variant="outline">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Submit responses for all {categories.length} categories
            </span>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          {categories.map((category: string) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.TEXT;
            const response = responses[category] || {
              category,
              content: "",
              mediaUrl: "",
            };

            return (
              <Card
                key={category}
                className="bg-zinc-900/50 border-zinc-800 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{category}</Badge>
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {config.label}
                  </h3>
                </div>

                {config.inputType === "textarea" && (
                  <Textarea
                    value={response.content}
                    onChange={(e) =>
                      updateResponse(category, "content", e.target.value)
                    }
                    placeholder={config.placeholder}
                    className="min-h-[120px]"
                    disabled={loading}
                  />
                )}

                {config.inputType === "text" && (
                  <Input
                    value={response.content}
                    onChange={(e) =>
                      updateResponse(category, "content", e.target.value)
                    }
                    placeholder={config.placeholder}
                    disabled={loading}
                  />
                )}

                {config.inputType === "url" && (
                  <div className="space-y-2">
                    <Input
                      type="url"
                      value={response.content}
                      onChange={(e) =>
                        updateResponse(category, "content", e.target.value)
                      }
                      placeholder={config.placeholder}
                      disabled={loading}
                    />
                    {config.helpText && (
                      <p className="text-xs text-zinc-500">{config.helpText}</p>
                    )}
                  </div>
                )}

                {config.inputType === "spotify" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-4 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
                      <Upload className="h-5 w-5 text-zinc-500" />
                      <span className="text-sm text-zinc-400">
                        Spotify integration coming soon...
                      </span>
                    </div>
                    <Input
                      type="url"
                      value={response.content}
                      onChange={(e) =>
                        updateResponse(category, "content", e.target.value)
                      }
                      placeholder="For now, paste a Spotify URL"
                      disabled={loading}
                    />
                  </div>
                )}

                {config.inputType === "file" && (
                  <div className="flex items-center justify-center p-8 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">
                        Upload coming soon...
                      </p>
                      <Input
                        type="url"
                        value={response.content}
                        onChange={(e) =>
                          updateResponse(category, "content", e.target.value)
                        }
                        placeholder="For now, paste a URL"
                        className="mt-2"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting All Responses...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit All Responses
            </>
          )}
        </Button>

        <div className="mt-4 text-center text-sm text-zinc-400">
          <p>
            {Math.floor((round.responses?.length || 0) / categories.length)}/
            {room.players.length} players submitted
          </p>
        </div>
      </div>
    </div>
  );
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
