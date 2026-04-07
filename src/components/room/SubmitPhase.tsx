"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Send, Clock, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DrawingCanvas } from "./DrawingCanvas";

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
    inputType: "text" | "textarea" | "url" | "image-upload" | "spotify" | "drawing-canvas";
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
    placeholder: "Select an image...",
    inputType: "image-upload",
    helpText: "Capture a photo or select an image from your device",
  },
  PHOTO: {
    label: "Photo",
    placeholder: "Select a photo...",
    inputType: "image-upload",
    helpText: "Capture a photo or select an image from your device",
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
    placeholder: "Draw your response...",
    inputType: "drawing-canvas",
    helpText: "Use your finger or mouse to draw directly on the screen",
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
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const categories = room.allowedCategories || [];

  // Initialize responses: empty or pre-filled from existing submissions
  useEffect(() => {
    const userResponses = round.responses?.filter(
      (r: any) => r.authorId === room.currentUserId,
    );

    const initialResponses: Record<string, CategoryResponse> = {};
    categories.forEach((cat: string) => {
      const existing = userResponses?.find((r: any) => r.category === cat);
      if (existing) {
        initialResponses[cat] = {
          category: existing.category,
          content: existing.content || "",
          mediaUrl: existing.mediaUrl || "",
        };
      } else {
        initialResponses[cat] = {
          category: cat,
          content: "",
          mediaUrl: "",
        };
      }
    });
    setResponses(initialResponses);

    if (userResponses && userResponses.length > 0) {
      setSubmitted(true);
    }
  }, [categories, round.responses, room.currentUserId]);

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

  const handleImageUpload = async (category: string, file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setUploadingCategory(category);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${room.id}/${round.id}/${room.currentUserId}-${Date.now()}.${fileExt}`;
      const filePath = `responses/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("temix-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("temix-media")
        .getPublicUrl(filePath);

      updateResponse(category, "mediaUrl", publicUrl);
      updateResponse(category, "content", "Image uploaded successfully");
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please check your connection.");
    } finally {
      setUploadingCategory(null);
    }
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
      } else if (config.inputType === "image-upload") {
        if (!response.mediaUrl) {
          setError(`Please upload an image for ${config.label}`);
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
          content: response.content || `Submitted ${config.label}`,
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

  const submitCount = Math.floor((round.responses?.length || 0) / categories.length);

  return (
    <div>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Submitted banner */}
        {submitted && (
          <Card className="bg-emerald-500/10 border-emerald-500/20 p-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Send className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-300 text-sm">
                  Responses submitted
                </h3>
                <p className="text-emerald-400/70 text-xs">
                  Waiting for other players... You can edit your answers below.
                </p>
              </div>
            </div>
            <div className="text-sm text-zinc-500 mt-3 text-center">
              {submitCount}/{room.players.length} players submitted
            </div>
          </Card>
        )}

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
              {submitted ? "Edit your responses below" : `Submit responses for all ${categories.length} categories`}
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

                {config.inputType === "image-upload" && (
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      capture={category === "PHOTO" ? "environment" : undefined}
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[category] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(category, file);
                      }}
                      disabled={loading || !!uploadingCategory}
                    />

                    {response.mediaUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 aspect-video max-w-sm mx-auto">
                        <img 
                          src={response.mediaUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateResponse(category, "mediaUrl", "")}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => !loading && !uploadingCategory && fileInputRefs.current[category]?.click()}
                        className={`flex flex-col items-center justify-center p-12 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700 cursor-pointer hover:bg-zinc-800/80 transition-colors ${uploadingCategory === category ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {uploadingCategory === category ? (
                          <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-3" />
                        ) : (
                          <Upload className="h-10 w-10 text-zinc-500 mb-3" />
                        )}
                        <p className="text-sm font-medium text-zinc-300">
                          {uploadingCategory === category ? "Uploading..." : "Select an image"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 italic">
                          JPG, PNG or GIF up to 5MB
                        </p>
                      </div>
                    )}
                    
                    {config.helpText && (
                      <p className="text-xs text-zinc-500 text-center">{config.helpText}</p>
                    )}
                  </div>
                )}

                {config.inputType === "spotify" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-4 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
                      <ImageIcon className="h-5 w-5 text-zinc-500" />
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

                {config.inputType === "drawing-canvas" && (
                  <div className="space-y-4">
                    {response.mediaUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800 aspect-video max-w-sm mx-auto">
                        <img 
                          src={response.mediaUrl} 
                          alt="Drawing Preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateResponse(category, "mediaUrl", "")}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" /> Redraw
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {uploadingCategory === category ? (
                          <div className="flex flex-col items-center justify-center p-12 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
                            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-3" />
                            <p className="text-sm font-medium text-zinc-300">Saving drawing...</p>
                          </div>
                        ) : (
                          <DrawingCanvas
                            disabled={loading || !!uploadingCategory}
                            onSave={(blob) => {
                              // Wrap blob in File object specifically for supabase upload helper
                              const file = new File([blob], "drawing.png", { type: "image/png" });
                              handleImageUpload(category, file);
                            }}
                          />
                        )}
                      </div>
                    )}
                    {config.helpText && (
                      <p className="text-xs text-zinc-500 text-center">{config.helpText}</p>
                    )}
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
          disabled={loading || !!uploadingCategory}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {submitted ? "Updating Responses..." : "Submitting All Responses..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              {submitted ? "Update Responses" : "Submit All Responses"}
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
