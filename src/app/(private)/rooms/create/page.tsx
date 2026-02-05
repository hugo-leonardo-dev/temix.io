"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Highlighter,
  Image,
  Camera,
  Video,
  Music,
  Paintbrush,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Category = "TEXT" | "IMAGE" | "PHOTO" | "VIDEO" | "AUDIO" | "DRAWING";

interface RoomFormData {
  name: string;
  maxPlayers: number;
  totalRounds: number;
  upvotesPerPlayer: number;
  downvotesPerPlayer: number;
  allowedCategories: Category[];
}

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode }[] =
  [
    { value: "TEXT", label: "Text", icon: <Highlighter className="h-5 w-5" /> },
    { value: "IMAGE", label: "Image", icon: <Image className="h-5 w-5" /> },
    { value: "PHOTO", label: "Photo", icon: <Camera className="h-5 w-5" /> },
    { value: "VIDEO", label: "Video", icon: <Video className="h-5 w-5" /> },
    { value: "AUDIO", label: "Audio", icon: <Music className="h-5 w-5" /> },
    {
      value: "DRAWING",
      label: "Drawing",
      icon: <Paintbrush className="h-5 w-5" />,
    },
  ];

export default function CreateRoom() {
  const router = useRouter();
  // const { toast } = useToast(); // descomente se tiver toast
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    maxPlayers: 6,
    totalRounds: 7,
    upvotesPerPlayer: 3,
    downvotesPerPlayer: 1,
    allowedCategories: [],
  });

  const totalSteps = 5;

  const updateFormData = (updates: Partial<RoomFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const toggleCategory = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(category)
        ? prev.allowedCategories.filter((c) => c !== category)
        : [...prev.allowedCategories, category],
    }));
    setError(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 3;
      case 2:
        return formData.maxPlayers >= 2 && formData.totalRounds >= 3;
      case 3:
        return true;
      case 4:
        return formData.allowedCategories.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      // toast({ // descomente se tiver toast
      //   title: "Room created!",
      //   description: `Room code: ${data.room.code}`,
      // });

      // Redirecionar para a room criada
      router.push(`/rooms/${data.room.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);

      // toast({ // descomente se tiver toast
      //   title: "Error",
      //   description: errorMessage,
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-zinc-400">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-900 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl text-zinc-100">
            {currentStep === 1 && "Name your room"}
            {currentStep === 2 && "Basic settings"}
            {currentStep === 3 && "Voting system"}
            {currentStep === 4 && "Content types"}
            {currentStep === 5 && "Review & create"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Steps 1-4 permanecem iguais */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-zinc-300">
                  Room name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Friday Night Game"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className="mt-2 bg-zinc-800 border-zinc-700 text-zinc-100"
                  autoFocus
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Choose a memorable name for your room
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="maxPlayers" className="text-zinc-300">
                  Maximum players
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        maxPlayers: Math.max(2, formData.maxPlayers - 1),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold text-zinc-100 w-16 text-center">
                    {formData.maxPlayers}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        maxPlayers: Math.min(20, formData.maxPlayers + 1),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Between 2 and 20 players
                </p>
              </div>

              <div>
                <Label htmlFor="totalRounds" className="text-zinc-300">
                  Total rounds
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        totalRounds: Math.max(3, formData.totalRounds - 1),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold text-zinc-100 w-16 text-center">
                    {formData.totalRounds}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        totalRounds: Math.min(15, formData.totalRounds + 1),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Between 3 and 15 rounds
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-zinc-300">Upvotes per player</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        upvotesPerPlayer: Math.max(
                          1,
                          formData.upvotesPerPlayer - 1,
                        ),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    -
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-zinc-100 w-12 text-center">
                      {formData.upvotesPerPlayer}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        upvotesPerPlayer: Math.min(
                          10,
                          formData.upvotesPerPlayer + 1,
                        ),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  How many upvotes each player can give per round
                </p>
              </div>

              <div>
                <Label className="text-zinc-300">Downvotes per player</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        downvotesPerPlayer: Math.max(
                          0,
                          formData.downvotesPerPlayer - 1,
                        ),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    -
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-zinc-100 w-12 text-center">
                      {formData.downvotesPerPlayer}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFormData({
                        downvotesPerPlayer: Math.min(
                          5,
                          formData.downvotesPerPlayer + 1,
                        ),
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  How many downvotes each player can give per round
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Select the types of content players can submit
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${
                        formData.allowedCategories.includes(category.value)
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      {formData.allowedCategories.includes(category.value) && (
                        <Check className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    <p className="font-semibold text-zinc-100">
                      {category.label}
                    </p>
                  </button>
                ))}
              </div>
              {formData.allowedCategories.length === 0 && (
                <p className="text-xs text-red-400 mt-2">
                  Please select at least one content type
                </p>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Room name</span>
                  <span className="text-zinc-100 font-semibold">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Max players</span>
                  <span className="text-zinc-100 font-semibold">
                    {formData.maxPlayers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total rounds</span>
                  <span className="text-zinc-100 font-semibold">
                    {formData.totalRounds}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Voting</span>
                  <span className="text-zinc-100 font-semibold">
                    ↑{formData.upvotesPerPlayer} / ↓
                    {formData.downvotesPerPlayer}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-zinc-400">Categories</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {formData.allowedCategories.map((cat) => {
                      const category = CATEGORIES.find((c) => c.value === cat);
                      return (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="bg-zinc-700 flex items-center gap-1"
                        >
                          <span className="text-xs">{category?.icon}</span>
                          {category?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 text-center">
                Ready to create your room? Click the button below!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={isLoading}
                className="flex-1 bg-zinc-800 border-zinc-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed() || isLoading}
                className="flex-1"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Room
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
