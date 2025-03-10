import { ReactNode, useState } from "react";

import IosPwaLimitations from "@/components/buttons/IosPwaLimitations";
import { BrandPill } from "@/components/layout/BrandPill";
import { Player } from "@/components/player";
import { SkipIntroButton } from "@/components/player/atoms/SkipIntroButton";
import { Widescreen } from "@/components/player/atoms/Widescreen";
import { useShouldShowControls } from "@/components/player/hooks/useShouldShowControls";
import { useSkipTime } from "@/components/player/hooks/useSkipTime";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PlayerMeta, playerStatus } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";

import { Tips } from "./ScrapingPart";

export interface PlayerPartProps {
  children?: ReactNode;
  backUrl: string;
  onLoad?: () => void;
  onMetaChange?: (meta: PlayerMeta) => void;
}

export function PlayerPart(props: PlayerPartProps) {
  const { showTargets, showTouchTargets } = useShouldShowControls();
  const status = usePlayerStore((s) => s.status);
  const { isMobile } = useIsMobile();
  const isLoading = usePlayerStore((s) => s.mediaPlaying.isLoading);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSPWA =
    isIOS && window.matchMedia("(display-mode: standalone)").matches;

  // Detect if Shift key is being held
  const [isShifting, setIsShifting] = useState(false);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
      setIsShifting(true);
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
      setIsShifting(false);
    }
  });

  const skiptime = useSkipTime();

  return (
    <Player.Container onLoad={props.onLoad} showingControls={showTargets}>
      {props.children}
      <Player.BlackOverlay
        show={showTargets && status === playerStatus.PLAYING}
      />
      <Player.EpisodesRouter onChange={props.onMetaChange} />
      <Player.SettingsRouter />
      <Player.SubtitleView controlsShown={showTargets} />

      {status === playerStatus.PLAYING ? (
        <>
          <Player.CenterControls>
            <Player.LoadingSpinner />
            <Player.AutoPlayStart />
          </Player.CenterControls>
          <Player.CenterControls>
            <Player.CastingNotification />
          </Player.CenterControls>
        </>
      ) : null}

      <Player.CenterMobileControls
        className="text-white"
        show={showTouchTargets && status === playerStatus.PLAYING}
      >
        <Player.SkipBackward iconSizeClass="text-3xl" />
        <Player.Pause
          iconSizeClass="text-5xl"
          className={isLoading ? "opacity-0" : "opacity-100"}
        />
        <Player.SkipForward iconSizeClass="text-3xl" />
      </Player.CenterMobileControls>

      <Player.TopControls show={showTargets}>
        <div className="grid grid-cols-[1fr,auto] xl:grid-cols-3 items-center">
          <div className="flex space-x-3 items-center">
            <Player.BackLink url={props.backUrl} />
            <span className="text mx-3 text-type-secondary">/</span>
            <Player.Title />

            <Player.BookmarkButton />
          </div>
          <div className="text-center hidden xl:flex justify-center items-center">
            <Player.EpisodeTitle />
          </div>
          <div className="hidden sm:flex items-center justify-end">
            <BrandPill />
          </div>
          <div className="flex sm:hidden items-center justify-end">
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Airplay />
                <Player.Chromecast />
              </>
            ) : null}
          </div>
        </div>
      </Player.TopControls>

      <Player.BottomControls show={showTargets}>
        {status === playerStatus.PLAYING ? null : <Tips />}
        <div className="flex items-center space-x-3 w-full">
          {status === playerStatus.PLAYING ? (
            <>
              {isMobile ? <Player.Time short /> : null}
              <Player.ProgressBar />
            </>
          ) : null}
        </div>
        <div className="hidden lg:flex items-center w-full">
          <Player.LeftSideControls>
            {status === playerStatus.PLAYING ? (
              <div className="flex items-center px-2">
                <Player.Pause />
                <Player.SkipBackward />
                <Player.SkipForward />
                <Player.Volume className="mr-2" />
                <Player.Time />
              </div>
            ) : null}
          </Player.LeftSideControls>
          <div className="flex-1" />
          <div className="flex items-center space-x-3">
            <Player.Episodes />
            {status === playerStatus.PLAYING ? (
              <>
                <Player.Pip />
                <Player.Airplay />
                <Player.Chromecast />
              </>
            ) : null}
            {(status === playerStatus.PLAYBACK_ERROR ||
              status === playerStatus.PLAYING) && <Player.Captions />}
            <Player.Settings />
            {!isShifting && <Player.Fullscreen />}
            {isShifting && (
              <div>
                <Widescreen />
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-[56px,1fr,56px] items-center gap-3 lg:hidden">
          <div />
          <div className="flex justify-center space-x-3">
            {!isIOSPWA && status === playerStatus.PLAYING && <Player.Pip />}
            <Player.Episodes />
            <Player.Settings />
            {isIOSPWA && status === playerStatus.PLAYING && <Widescreen />}
          </div>
          <div>
            {!isIOSPWA && (
              <div>
                <Player.Fullscreen />
              </div>
            )}
            {isIOSPWA && (
              <div>
                <IosPwaLimitations />
              </div>
            )}
          </div>
        </div>
      </Player.BottomControls>

      <Player.VolumeChangedPopout />
      <Player.SubtitleDelayPopout />

      <Player.NextEpisodeButton
        controlsShowing={showTargets}
        onChange={props.onMetaChange}
      />

      <SkipIntroButton controlsShowing={showTargets} skipTime={skiptime} />
    </Player.Container>
  );
}
