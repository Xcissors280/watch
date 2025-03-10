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
import { Icon, Icons } from "@/components/Icon";
import { Loading } from "@/components/layout/Loading";
import { ProgressRing } from "@/components/layout/ProgressRing";
import {
  ScrapingItems,
  ScrapingSegment,
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

interface ScrapePillProps {
  name: string;
  status: string;
  percentage: number;
}

function ScrapePillSkeleton() {
  return (
    <div className="h-9 w-[220px] rounded-full bg-background-secondary opacity-50" />
  );
}

function ScrapePill({ name, status, percentage }: ScrapePillProps) {
  const isError = status === "failure";

  return (
    <div className="flex h-9 w-[220px] items-center rounded-full bg-background-secondary p-3">
      <div className="mr-2 flex w-[18px] items-center justify-center">
        {!isError ? (
          <ProgressRing
            className="h-[18px] w-[18px] text-primary"
            percentage={percentage}
            radius={40}
          />
        ) : (
          <Icon icon={Icons.X} className="text-[0.85em] text-status-error" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p
          className={classNames(
            "overflow-hidden text-ellipsis whitespace-nowrap",
            {
              "text-status-error": isError,
            },
          )}
        >
          {name}
        </p>
      </div>
    </div>
  );
}

export function ScrapingPart(props: ScrapingProps) {
  const { report } = useReportProviders();
  const { startScraping, sourceOrder, sources, currentSource } = useScrape();
  const isMounted = useMountedState();
  const { t } = useTranslation();

  const [failedStartScrape, setFailedStartScrape] = useState<boolean>(false);

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
    <div className="h-full w-full relative flex flex-col items-center justify-center">
      {!sourceOrder || sourceOrder.length === 0 ? (
        <div className="text-center flex flex-col justify-center z-0">
          <Loading className="mb-8" />
          <p>{t("player.turnstile.verifyingHumanity")}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center flex flex-col items-center gap-3">
            <Loading className="mb-0" />
            <p className="text-type-secondary">
              Finding the best video for you
            </p>
          </div>
          <div className="relative h-16 w-[400px] overflow-hidden">
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                maskImage: `linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 80px, rgba(0, 0, 0, 1) calc(100% - 80px), rgba(0, 0, 0, 0) 100%)`,
                WebkitMaskImage: `linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 80px, rgba(0, 0, 0, 1) calc(100% - 80px), rgba(0, 0, 0, 0) 100%)`,
              }}
            >
              <div className="relative flex h-full w-[220px] items-center">
                <div
                  className="absolute inset-y-0 left-0 flex items-center gap-[16px] transition-transform duration-200"
                  style={{
                    transform: `translateX(${
                      -1 * (220 + 16) * (currentProviderIndex + 1)
                    }px)`,
                  }}
                >
                  <ScrapePillSkeleton />
                  {sourceOrder.map((order) => {
                    const source = sources[order.id];
                    return (
                      <ScrapePill
                        key={order.id}
                        name={source.name}
                        status={source.status}
                        percentage={source.percentage}
                      />
                    );
                  })}
                  <ScrapePillSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
