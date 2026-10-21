import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useInfiniteScroll } from "../../hooks/use-infinite-scroll";
import { useSoundSearch } from "../use-sound-search";
import { useSoundsStore } from "../sounds-store";
import type { SavedSound, SoundEffect } from "../types";
import { cn } from "../../utils/ui";
import { EditorCore } from "../../core";
import {
  FavouriteIcon,
  FilterIcon,
  PauseIcon,
  PlayIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SoundsView() {
  useUiLocale();
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="sound-effects" className="flex h-full flex-col">
        <div className="px-3 pt-4 pb-0">
          <TabsList>
            <TabsTrigger value="sound-effects">{uiText("video-editor.sound.effects")}</TabsTrigger>
            <TabsTrigger value="saved">{uiText("common.saved")}</TabsTrigger>
          </TabsList>
        </div>
        <Separator className="my-4" />
        <TabsContent
          value="sound-effects"
          className="mt-0 flex min-h-0 flex-1 flex-col p-5 pt-0"
        >
          <SoundEffectsView />
        </TabsContent>
        <TabsContent
          value="saved"
          className="mt-0 flex min-h-0 flex-1 flex-col p-5 pt-0"
        >
          <SavedSoundsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SoundEffectsView() {
  useUiLocale();
  const {
    topSoundEffects,
    isLoading,
    searchQuery,
    setSearchQuery,
    scrollPosition,
    setScrollPosition,
    loadSavedSounds,
    showCommercialOnly,
    toggleCommercialFilter,
    hasLoaded,
    setTopSoundEffects,
    setLoading,
    setError,
    setHasLoaded,
    setCurrentPage,
    setHasNextPage,
    setTotalCount,
  } = useSoundsStore();
  const {
    results: searchResults,
    isLoading: isSearching,
    loadMore,
    hasNextPage,
    isLoadingMore,
  } = useSoundSearch({
    query: searchQuery,
    commercialOnly: showCommercialOnly,
  });

  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  const { scrollAreaRef, handleScroll } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hasNextPage,
    isLoading: isLoadingMore || isSearching,
  });

  useEffect(() => {
    loadSavedSounds();
  }, [loadSavedSounds]);

  useEffect(() => {
    if (hasLoaded) {
      return undefined;
    }

    let shouldIgnore = false;

    const fetchTopSounds = async () => {
      try {
        if (!shouldIgnore) {
          setLoading({ loading: true });
          setError({ error: null });
        }

        const adapter = EditorCore.getInstance().adapters.soundsAdapter;
        const results = await adapter.getTopSounds({
          commercialOnly: showCommercialOnly,
        });

        if (!shouldIgnore) {
          setTopSoundEffects({ sounds: results });
          setHasLoaded({ loaded: true });

          setCurrentPage({ page: 1 });
          setHasNextPage({ hasNext: false });
          setTotalCount({ count: results.length });
        }
      } catch (error) {
        if (!shouldIgnore) {
          console.error("Failed to fetch top sounds:", error);
          setError({
            error:
              error instanceof Error ? error.message : uiText("desktop.failed.to.load.sounds"),
          });
        }
      } finally {
        if (!shouldIgnore) {
          setLoading({ loading: false });
        }
      }
    };

    const timeoutId = setTimeout(fetchTopSounds, 100, {});

    return () => {
      shouldIgnore = true;
      clearTimeout(timeoutId);
    };
  }, [
    hasLoaded,
    showCommercialOnly,
    setTopSoundEffects,
    setLoading,
    setError,
    setHasLoaded,
    setCurrentPage,
    setHasNextPage,
    setTotalCount,
  ]);

  useEffect(() => {
    if (!scrollAreaRef.current || scrollPosition <= 0) {
      return undefined;
    }

    const restoreScrollPosition = () => {
      scrollAreaRef.current?.scrollTo({ top: scrollPosition });
    };

    const timeoutId = setTimeout(restoreScrollPosition, 100, {});

    return () => clearTimeout(timeoutId);
  }, [scrollPosition, scrollAreaRef]);

  const handleScrollWithPosition = ({
    currentTarget,
  }: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = currentTarget;
    setScrollPosition({ position: scrollTop });
    handleScroll({ currentTarget } as React.UIEvent<HTMLDivElement>);
  };

  const displayedSounds = searchQuery ? searchResults : topSoundEffects;

  const playSound = ({ sound }: { sound: SoundEffect }) => {
    if (playingId === sound.id) {
      audioElement?.pause();
      setPlayingId(null);
      return;
    }

    audioElement?.pause();

    if (sound.previewUrl) {
      const audio = new Audio(sound.previewUrl);
      audio.addEventListener("ended", () => {
        setPlayingId(null);
      });
      audio.addEventListener("error", () => {
        setPlayingId(null);
      });
      audio.play().catch((error) => {
        console.error("Failed to play sound preview:", error);
        setPlayingId(null);
      });

      setAudioElement(audio);
      setPlayingId(sound.id);
    }
  };

  return (
    <div className="mt-1 flex h-full flex-col gap-5">
      <div className="flex items-center gap-3">
        <Input
          placeholder={uiText("video-editor.search.sound.effects")}
          className="w-full"
          containerClassName="w-full"
          value={searchQuery}
          onChange={({ currentTarget }) =>
            setSearchQuery({ query: currentTarget.value })
          }
          showClearIcon
          onClear={() => setSearchQuery({ query: "" })}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="text"
              size="icon"
              className={cn(showCommercialOnly && "text-primary")}
            >
              <HugeiconsIcon icon={FilterIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuCheckboxItem
              checked={showCommercialOnly}
              onCheckedChange={() => toggleCommercialFilter()}
            >{uiText("video-editor.show.only.commercially.licensed")}{" "}</DropdownMenuCheckboxItem>
            <div className="text-muted-foreground px-2 py-1.5 text-xs">
              {showCommercialOnly
                ? uiText("video-editor.only.showing.sounds.licensed.for.commercial.use")
                : uiText("video-editor.showing.all.sounds.regardless.of.license")}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative h-full overflow-hidden">
        <ScrollArea
          className="h-full flex-1"
          ref={scrollAreaRef}
          onScrollCapture={handleScrollWithPosition}
        >
          <div className="flex flex-col gap-4">
            {isLoading && !searchQuery && (
              <div className="text-muted-foreground text-sm">{uiText("video-editor.loading.sounds")}{" "}</div>
            )}
            {isSearching && searchQuery && (
              <div className="text-muted-foreground text-sm">{uiText("video-editor.searching")}</div>
            )}
            {displayedSounds.map((sound) => (
              <AudioItem
                key={sound.id}
                sound={sound}
                isPlaying={playingId === sound.id}
                onPlay={playSound}
              />
            ))}
            {!isLoading && !isSearching && displayedSounds.length === 0 && (
              <div className="text-muted-foreground text-sm">
                {searchQuery ? uiText("video-editor.no.sounds.found") : uiText("video-editor.no.sounds.available")}
              </div>
            )}
            {isLoadingMore && (
              <div className="text-muted-foreground py-4 text-center text-sm">{uiText("video-editor.loading.more.sounds")}{" "}</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function SavedSoundsView() {
  useUiLocale();
  const {
    savedSounds,
    isLoadingSavedSounds,
    savedSoundsError,
    loadSavedSounds,
    clearSavedSounds,
  } = useSoundsStore();

  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    loadSavedSounds();
  }, [loadSavedSounds]);

  const playSound = ({ sound }: { sound: SoundEffect }) => {
    if (playingId === sound.id) {
      audioElement?.pause();
      setPlayingId(null);
      return;
    }

    audioElement?.pause();

    if (sound.previewUrl) {
      const audio = new Audio(sound.previewUrl);
      audio.addEventListener("ended", () => {
        setPlayingId(null);
      });
      audio.addEventListener("error", () => {
        setPlayingId(null);
      });
      audio.play().catch((error) => {
        console.error("Failed to play sound preview:", error);
        setPlayingId(null);
      });

      setAudioElement(audio);
      setPlayingId(sound.id);
    }
  };

  const convertToSoundEffect = ({
    savedSound,
  }: {
    savedSound: SavedSound;
  }): SoundEffect => ({
    id: savedSound.id,
    name: savedSound.name,
    description: "",
    url: "",
    previewUrl: savedSound.previewUrl,
    downloadUrl: savedSound.downloadUrl,
    duration: savedSound.duration,
    filesize: 0,
    type: "audio",
    channels: 0,
    bitrate: 0,
    bitdepth: 0,
    samplerate: 0,
    username: savedSound.username,
    tags: savedSound.tags,
    license: savedSound.license,
    created: savedSound.savedAt,
    downloads: 0,
    rating: 0,
    ratingCount: 0,
  });

  if (isLoadingSavedSounds) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">{uiText("video-editor.loading.saved.sounds")}{" "}</div>
      </div>
    );
  }

  if (savedSoundsError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-destructive text-sm">{uiText("video-editor.error")}{" "}{savedSoundsError}
        </div>
      </div>
    );
  }

  if (savedSounds.length === 0) {
    return (
      <div className="bg-background flex h-full flex-col items-center justify-center gap-3 p-4">
        <HugeiconsIcon
          icon={FavouriteIcon}
          className="text-muted-foreground size-10"
        />
        <div className="flex flex-col gap-2 text-center">
          <p className="text-lg font-medium">{uiText("video-editor.no.saved.sounds")}</p>
          <p className="text-muted-foreground text-sm text-balance">{uiText("video-editor.click.the.heart.icon.on.any.sound.to.save.it.here")}{" "}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 flex h-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {savedSounds.length}{" "}{uiText("video-editor.saved")}{" "}
          {savedSounds.length === 1 ? uiText("video-editor.sound") : uiText("video-editor.sounds.2")}
        </p>
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger asChild>
            <Button
              variant="text"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-auto !opacity-100"
            >{uiText("common.clear.all")}{" "}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{uiText("video-editor.clear.all.saved.sounds")}</DialogTitle>
              <DialogDescription>{uiText("video-editor.this.will.permanently.remove.all")}{" "}{savedSounds.length}{" "}{uiText("video-editor.saved.sounds.from.your.collection.this.action.cannot.be.undone")}{" "}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="text" onClick={() => setShowClearDialog(false)}>{uiText("common.cancel")}{" "}</Button>
              <Button
                variant="destructive"
                onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  await clearSavedSounds();
                  setShowClearDialog(false);
                }}
              >{uiText("video-editor.clear.all.sounds")}{" "}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative h-full overflow-hidden">
        <ScrollArea className="h-full flex-1">
          <div className="flex flex-col gap-4">
            {savedSounds.map((sound) => (
              <AudioItem
                key={sound.id}
                sound={convertToSoundEffect({ savedSound: sound })}
                isPlaying={playingId === sound.id}
                onPlay={playSound}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface AudioItemProps {
  sound: SoundEffect;
  isPlaying: boolean;
  onPlay: ({ sound }: { sound: SoundEffect }) => void;
}

function AudioItem({ sound, isPlaying, onPlay }: AudioItemProps) {
  useUiLocale();
  const { addSoundToTimeline, isSoundSaved, toggleSavedSound } =
    useSoundsStore();
  const isSaved = isSoundSaved({ soundId: sound.id });

  const handleClick = () => {
    onPlay({ sound });
  };

  const handleSaveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleSavedSound({ soundEffect: sound });
  };

  const handleAddToTimeline = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    await addSoundToTimeline({ sound });
  };

  return (
    <div className="group flex items-center gap-3 opacity-100 hover:opacity-75">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={handleClick}
      >
        <div className="bg-accent relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
          <div className="from-primary/20 absolute inset-0 bg-gradient-to-br to-transparent" />
          {isPlaying ? (
            <HugeiconsIcon icon={PauseIcon} className="size-5" />
          ) : (
            <HugeiconsIcon icon={PlayIcon} className="size-5" />
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium">{sound.name}</p>
          <span className="text-muted-foreground block truncate text-xs">
            {sound.username}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-3 pr-2">
        <Button
          variant="text"
          size="icon"
          className="text-muted-foreground hover:text-foreground w-auto !opacity-100"
          onClick={handleAddToTimeline}
          title={uiText("video-editor.add.to.timeline")}
        >
          <HugeiconsIcon icon={PlusSignIcon} />
        </Button>
        <Button
          variant="text"
          size="icon"
          className={`hover:text-foreground w-auto !opacity-100 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground"
          }`}
          onClick={handleSaveClick}
          title={isSaved ? uiText("video-editor.remove.from.saved") : uiText("video-editor.save.sound")}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            className={`${isSaved ? "fill-current" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}
