import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import type { GuideDefinition } from "../types";
import { TikTokLayout } from "./tiktok-layout";

function PlatformLogo({
  domain,
  className = "size-4",
}: {
  domain: string;
  className?: string;
}) {
  useUiLocale();
  return (
    <img
      src={`https://cdn.brandfetch.io/${domain}/w/64/h/64`}
      alt=""
      width={18}
      height={18}
      className={className}
      draggable={false}
    />
  );
}

function PlatformGuidePreview({ domain }: { domain: string }) {
  useUiLocale();
  return <PlatformLogo domain={domain} />;
}

function platformGuide({
  id,
  label,
  domain,
}: {
  id: string;
  label: string;
  domain: string;
}): GuideDefinition {
  return {
    id,
    label,
    renderPreview: () => <PlatformGuidePreview domain={domain} />,
    renderTriggerIcon: () => <PlatformLogo domain={domain} />,
    renderOverlay: () => null,
  };
}

export const tiktokGuide: GuideDefinition = {
  ...platformGuide({ id: "tiktok", label: "TikTok", domain: "tiktok.com" }),
  renderOverlay: () => <TikTokLayout />,
};
export const igReelsGuide = platformGuide({
  id: "ig-reels",
  get label() { return uiText("video-editor.reels"); },
  domain: "instagram.com",
});
export const ytShortsGuide = platformGuide({
  id: "yt-shorts",
  get label() { return uiText("video-editor.shorts"); },
  domain: "youtube.com",
});
export const spotlightGuide = platformGuide({
  id: "spotlight",
  get label() { return uiText("video-editor.spotlight"); },
  domain: "snapchat.com",
});
