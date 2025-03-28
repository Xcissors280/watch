import { ProviderControls, ScrapeMedia } from "@movie-web/providers";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMountedState } from "react-use";
import type { AsyncReturnType } from "type-fest";

import {
  scrapePartsToProviderMetric,
  useReportProviders,
} from "@/backend/helpers/report";
import { Button } from "@/components/buttons/Button";
import { Loading } from "@/components/layout/Loading";
import {
  ScrapeCard,
  ScrapeItem,
} from "@/components/player/internals/ScrapeCard";
import {
  ScrapingItems,
  ScrapingSegment,
  useListCenter,
  useScrape,
} from "@/hooks/useProviderScrape";

import { WarningPart } from "../util/WarningPart";

export interface ScrapingProps {
  media: ScrapeMedia;
  onGetStream?: (stream: AsyncReturnType<ProviderControls["runAll"]>) => void;
  onResult?: (
    sources: Record<string, ScrapingSegment>,
    sourceOrder: ScrapingItems[],
  ) => void;
}

export function ScrapingPart(props: ScrapingProps) {
  const { report } = useReportProviders();
  const { startScraping, sourceOrder, sources, currentSource } = useScrape();
  const isMounted = useMountedState();
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [failedStartScrape, setFailedStartScrape] = useState<boolean>(false);
  const renderedOnce = useListCenter(
    containerRef,
    listRef,
    sourceOrder,
    currentSource,
  );

  const resultRef = useRef({
    sourceOrder,
    sources,
  });
  useEffect(() => {
    resultRef.current = {
      sourceOrder,
      sources,
    };
  }, [sourceOrder, sources]);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const output = await startScraping(props.media);
      if (!isMounted()) return;
      props.onResult?.(
        resultRef.current.sources,
        resultRef.current.sourceOrder,
      );
      report(
        scrapePartsToProviderMetric(
          props.media,
          resultRef.current.sourceOrder,
          resultRef.current.sources,
        ),
      );
      props.onGetStream?.(output);
    })().catch(() => setFailedStartScrape(true));
  }, [startScraping, props, report, isMounted]);

  let currentProviderIndex = sourceOrder.findIndex(
    (s) => s.id === currentSource || s.children.includes(currentSource ?? ""),
  );
  if (currentProviderIndex === -1)
    currentProviderIndex = sourceOrder.length - 1;

  if (failedStartScrape)
    return <WarningPart>{t("player.turnstile.error")}</WarningPart>;

  return (
    <div
      className="h-full w-full relative dir-neutral:origin-top-left flex"
      ref={containerRef}
    >
      {!sourceOrder || sourceOrder.length === 0 ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col justify-center z-0">
          <Loading className="mb-8" />
          <p>{t("player.turnstile.verifyingHumanity")}</p>
        </div>
      ) : null}
      <div
        className={classNames({
          "absolute transition-[transform,opacity] opacity-0 dir-neutral:left-0":
            true,
          "!opacity-100": renderedOnce,
        })}
        ref={listRef}
      >
        {sourceOrder.map((order) => {
          const source = sources[order.id];
          const distance = Math.abs(
            sourceOrder.findIndex((o) => o.id === order.id) -
              currentProviderIndex,
          );
          return (
            <div
              className="transition-opacity duration-100"
              style={{ opacity: Math.max(0, 1 - distance * 0.3) }}
              key={order.id}
            >
              <ScrapeCard
                id={order.id}
                name={source.name}
                status={source.status}
                hasChildren={order.children.length > 0}
                percentage={source.percentage}
              >
                <div
                  className={classNames({
                    "space-y-6 mt-8": order.children.length > 0,
                  })}
                >
                  {order.children.map((embedId) => {
                    const embed = sources[embedId];
                    return (
                      <ScrapeItem
                        id={embedId}
                        name={embed.name}
                        status={embed.status}
                        percentage={embed.percentage}
                        key={embedId}
                      />
                    );
                  })}
                </div>
              </ScrapeCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScrapingPartInterruptButton() {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 pb-3">
      <Button
        onClick={() => window.location.reload()}
        theme="purple"
        padding="md:px-17 p-3"
        className="mt-6"
      >
        {t("notFound.reloadButton")}
      </Button>
    </div>
  );
}

const TIPS_LIST = [
  "Tap the gear icon to switch sources!",
  "Tap the title to copy the link!",
  "Hold SHIFT for widescreen instead of fullscreen!",
  "Some sources work better than others!",
  "Get the extension for more sources!",
  "Hold bookmarks to edit or delete them!",
  "Hold SHIFT and tap the title to copy the link with time!",
  "Set a custom subtitle color!",
  "Migrate your account to a new backend in settings!",
  "Join the Discord!",
  "Use [ and ] to adjust subtitle timing!",
  "Press SPACE or K to play/pause!",
  "Use LEFT and RIGHT arrow keys to skip 5 seconds!",
  "Use J and L keys to skip 10 seconds!",
  "Press F to toggle fullscreen!",
  "Press M to toggle mute!",
  "Use UP and DOWN arrows to change volume!",
  "Press < and > to change playback speed!",
  "Press . and , to move frame by frame when paused!",
  "Press C to toggle subtitles!",
  "Press R to do a barrel roll!",
];

export function Tips() {
  const [tip] = useState(() => {
    const randomIndex = Math.floor(Math.random() * TIPS_LIST.length);
    return TIPS_LIST[randomIndex];
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-type-secondary text-center text-sm text-bold">
        Tip: {tip}
      </p>
    </div>
  );
}
