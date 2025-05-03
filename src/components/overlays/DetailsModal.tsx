import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { getMediaBackdrop, getMediaDetails } from "@/backend/metadata/tmdb";
import {
  TMDBContentTypes,
  TMDBMovieData,
  TMDBShowData,
} from "@/backend/metadata/types/tmdb";
import { Dropdown } from "@/components/form/Dropdown";
import { Icon, Icons } from "@/components/Icon";
import { hasAired } from "@/components/player/utils/aired";
import { useBookmarkStore } from "@/stores/bookmarks";
import { useLanguageStore } from "@/stores/language";
import { useProgressStore } from "@/stores/progress";
import { shouldShowProgress } from "@/stores/progress/utils";
import { scrapeIMDb } from "@/utils/imdbScraper";
import { getTmdbLanguageCode } from "@/utils/language";

import { useModal } from "./Modal";
import { OverlayPortal } from "./OverlayDisplay";
import { Button } from "../buttons/Button";
import { IconPatch } from "../buttons/IconPatch";
import { Flare } from "../utils/Flare";

function DetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative">
        {/* Backdrop */}
        <div className="h-64 relative -mt-12">
          <div
            className="absolute inset-0 bg-mediaCard-hoverBackground"
            style={{
              maskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 60px)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 60px)",
            }}
          />
        </div>
        {/* Content */}
        <div className="px-6 pb-6 mt-[-30px]">
          <div className="h-8 w-3/4 bg-white/10 rounded mb-3" /> {/* Title */}
          <div className="space-y-2 mb-6">
            {/* Description */}
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
          {/* Additional details */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-3/4" />
          </div>
          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 bg-white/10 rounded-full" />
            <div className="h-6 w-24 bg-white/10 rounded-full" />
            <div className="h-6 w-16 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailsContent {
  title: string;
  overview?: string;
  backdrop?: string;
  runtime?: number | null;
  genres?: Array<{ id: number; name: string }>;
  language?: string;
  voteAverage?: number;
  voteCount?: number;
  releaseDate?: string;
  rating?: string;
  director?: string;
  actors?: string[];
  type?: "movie" | "show";
  id?: number;
  episodes?: number;
  seasons?: number;
  imdbId?: string;
  episode?: {
    id: number;
    number: number;
  };
  seasonData?: {
    seasons: Array<{
      id: number;
      season_number: number;
      name: string;
      episode_count: number;
      overview: string;
      air_date: string;
      poster_path: string | null;
    }>;
    episodes: Array<{
      id: number;
      name: string;
      overview: string;
      episode_number: number;
      season_number: number;
      still_path: string | null;
      air_date: string;
      vote_average: number;
      vote_count: number;
    }>;
  };
}

function DetailsContent({
  data,
  minimal = false,
}: {
  data: DetailsContent;
  minimal?: boolean;
}) {
  const [imdbData, setImdbData] = useState<any>(null);
  const [, setIsLoadingImdb] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useProgressStore((s) => s.items);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLAnchorElement>(null);

  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const isBookmarked = !!bookmarks[data.id?.toString() ?? ""];

  const showProgress = useMemo(() => {
    if (!data.id) return null;
    const item = progress[data.id.toString()];
    if (!item) return null;
    return shouldShowProgress(item);
  }, [data.id, progress]);

  // Set initial season based on current episode
  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    if (showProgress?.season?.number) {
      return showProgress.season.number;
    }
    return 1;
  });

  // Update selected season when showProgress changes
  useEffect(() => {
    if (showProgress?.season?.number) {
      setSelectedSeason(showProgress.season.number);
    }
  }, [showProgress]);

  const toggleBookmark = useCallback(() => {
    if (!data.id) return;
    if (isBookmarked) {
      removeBookmark(data.id.toString());
    } else {
      addBookmark({
        tmdbId: data.id.toString(),
        type: data.type ?? "movie",
        title: data.title,
        releaseYear: data.releaseDate
          ? new Date(data.releaseDate).getFullYear()
          : 0,
        poster: data.backdrop,
      });
    }
  }, [data, isBookmarked, addBookmark, removeBookmark]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  useEffect(() => {
    const fetchImdbData = async () => {
      if (!data.imdbId) return;

      setIsLoadingImdb(true);
      try {
        // Get the user's selected language and format it properly
        const userLanguage = useLanguageStore.getState().language;
        const formattedLanguage = getTmdbLanguageCode(userLanguage);

        // Pass the language to the scrapeIMDb function
        const imdbMetadata = await scrapeIMDb(
          data.imdbId,
          undefined,
          undefined,
          formattedLanguage,
        );
        setImdbData(imdbMetadata);
      } catch (error) {
        console.error("Failed to fetch IMDb data:", error);
      } finally {
        setIsLoadingImdb(false);
      }
    };

    fetchImdbData();
  }, [data.imdbId]);

  const formatRuntime = (minutes?: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatVoteCount = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`;
    }
    return count.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "bg-green-500";
    if (rating >= 6) return "bg-yellow-500";
    if (rating >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const cardWidth = 256; // w-64 in pixels
    const cardSpacing = 16; // space-x-4 in pixels
    const scrollAmount = (cardWidth + cardSpacing) * 2;

    const newScrollPosition =
      carouselRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    carouselRef.current.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  const currentSeasonEpisodes = data.seasonData?.episodes.filter(
    (ep) => ep.season_number === selectedSeason,
  );

  // Function to generate the episode URL
  const getEpisodeUrl = (episode: any) => {
    // Find the season ID for the current season
    const season = data.seasonData?.seasons.find(
      (s) => s.season_number === selectedSeason,
    );

    if (!season || !data.id) return "#";

    // Create the URL in the format: /media/tmdb-tv-{showId}-{showName}/{seasonId}/{episodeId}
    return `/media/tmdb-tv-${data.id}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${season.id}/${episode.id}`;
  };

  useEffect(() => {
    if (carouselRef.current) {
      if (activeEpisodeRef.current) {
        // If there's an active episode, scroll to it
        const containerLeft = carouselRef.current.getBoundingClientRect().left;
        const containerWidth = carouselRef.current.clientWidth;
        const elementLeft =
          activeEpisodeRef.current.getBoundingClientRect().left;
        const elementWidth = activeEpisodeRef.current.clientWidth;

        const scrollPosition =
          elementLeft - containerLeft - containerWidth / 2 + elementWidth / 2;

        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollLeft + scrollPosition,
          behavior: "smooth",
        });
      } else {
        // If no active episode, scroll to the start
        carouselRef.current.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }, [currentSeasonEpisodes, showProgress]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Backdrop - Even taller */}
      <div className="h-64 lg:h-80 xl:h-96 relative -mt-12">
        {imdbData?.trailer_url ? (
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 60px)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 60px)",
            }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              autoPlay
              loop
              muted
              playsInline
              poster={data.backdrop}
              onClick={togglePlay}
            >
              <source src={imdbData.trailer_url} type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={toggleMute}
              className="absolute top-4 left-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              <Icon
                icon={isMuted ? Icons.VOLUME_X : Icons.VOLUME}
                className="text-white"
              />
            </button>
            {isPaused && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-10"
                title="Play"
              >
                <Icon icon={Icons.PLAY} className="text-white text-4xl" />
              </button>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: data.backdrop
                ? `url(${data.backdrop})`
                : undefined,
              maskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 60px)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 60px)",
            }}
          />
        )}
      </div>
      {/* Content */}
      <div className="px-6 pb-6 mt-[-100px] flex-grow">
        {/* Title and Genres Row */}
        <div className="pb-4">
          {!minimal && (
            <Button
              onClick={() => {
                if (data.type === "movie") {
                  window.location.assign(
                    `/media/tmdb-movie-${data.id}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                  );
                } else if (data.type === "show") {
                  if (showProgress?.season?.id && showProgress?.episode?.id) {
                    window.location.assign(
                      `/media/tmdb-tv-${data.id}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${showProgress.season.id}/${showProgress.episode.id}`,
                    );
                  } else {
                    // Start new show
                    window.location.assign(
                      `/media/tmdb-tv-${data.id}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                    );
                  }
                }
              }}
              theme="secondary"
              className={classNames(
                "gap-2 h-12 rounded-lg px-4 py-2 my-1 transition-transform hover:scale-105 duration-100",
                "text-md text-white flex items-center justify-center",
                "bg-buttons-purple bg-opacity-45 hover:bg-buttons-purpleHover hover:bg-opacity-25 backdrop-blur-md",
                "border-2 border-gray-400 border-opacity-20",
              )}
            >
              <Icon icon={Icons.PLAY} className="text-white" />
              <span className="text-white text-sm pr-1">
                {showProgress ? "Resume" : "Play"}
              </span>
            </Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-white z-[999]">
              {data.title}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleBookmark}
                className="p-2 pt-3 hover:scale-110 transition-transform"
                title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
              >
                <Icon
                  icon={isBookmarked ? Icons.BOOKMARK : Icons.BOOKMARK_OUTLINE}
                  className="text-white"
                />
              </button>
            </div>
          </div>
          {data.genres && data.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end z-[999] items-center pt-2">
              {data.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white/80"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout - Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
          {/* Left Column - Description */}
          <div className="md:col-span-2">
            {data.overview && (
              <p className="text-sm text-white/90 mb-6">{data.overview}</p>
            )}

            {/* Director and Cast */}
            <div className="space-y-4 mb-6">
              {data.director && (
                <div className="text-xs">
                  <span className="font-medium text-white/80">Director:</span>{" "}
                  <span className="text-white/70">{data.director}</span>
                </div>
              )}
              {data.actors && data.actors.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-white/80">Cast:</span>{" "}
                  <span className="text-white/70">
                    {data.actors.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-1">
            <div className="space-y-3 text-xs">
              {data.runtime && (
                <div className="flex items-center gap-1 text-white/80">
                  <span className="font-medium">Runtime:</span>{" "}
                  {formatRuntime(data.runtime)}
                </div>
              )}
              {data.language && (
                <div className="flex items-center gap-1 text-white/80">
                  <span className="font-medium">Language:</span>{" "}
                  {data.language.toUpperCase()}
                </div>
              )}
              {data.releaseDate && (
                <div className="flex items-center gap-1 text-white/80">
                  <span className="font-medium">Release Date:</span>{" "}
                  {formatDate(data.releaseDate)}
                </div>
              )}
              {data.rating && (
                <div className="flex items-center gap-1 text-white/80">
                  <span className="font-medium">Rating:</span> {data.rating}
                </div>
              )}
              {data.voteAverage !== undefined &&
                data.voteCount !== undefined &&
                data.voteCount > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-white/80">
                      <span className="font-medium">Rating:</span>{" "}
                      <span className="text-white/90">
                        {imdbData?.imdb_rating
                          ? `${imdbData.imdb_rating.toFixed(1)}/10 (IMDb)`
                          : `${data.voteAverage.toFixed(1)}/10 (TMDB)`}
                      </span>
                    </div>
                    {/* Rating Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getRatingColor(imdbData?.imdb_rating || data.voteAverage)} transition-all duration-500`}
                        style={{
                          width: `${((imdbData?.imdb_rating || data.voteAverage) / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-white/60 text-[10px] text-right">
                      {formatVoteCount(imdbData?.votes || data.voteCount)} votes
                    </div>

                    {/* External Links */}
                    <div className="flex gap-3 mt-2">
                      {data.id && (
                        <a
                          href={`https://www.themoviedb.org/${data.type === "show" ? "tv" : "movie"}/${data.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#0d253f] flex items-center justify-center transition-transform hover:scale-110"
                          title="View on TMDB"
                        >
                          <Icon icon={Icons.TMDB} className="text-white" />
                        </a>
                      )}
                      {data.imdbId && (
                        <a
                          href={`https://www.imdb.com/title/${data.imdbId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center transition-transform hover:scale-110"
                          title="View on IMDB"
                        >
                          <Icon icon={Icons.IMDB} className="text-black" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Episodes Carousel for TV Shows */}
        {data.type === "show" && data.seasonData && !minimal && (
          <div className="mt-6 md:mt-0">
            {/* Season Selector */}
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-white">Episodes</h4>
              <Dropdown
                options={data.seasonData.seasons.map((season) => ({
                  id: season.season_number.toString(),
                  name: `Season ${season.season_number}`,
                }))}
                selectedItem={{
                  id: selectedSeason.toString(),
                  name: `Season ${selectedSeason}`,
                }}
                setSelectedItem={(item) => setSelectedSeason(Number(item.id))}
              />
            </div>

            {/* Episodes Carousel */}
            <div className="relative">
              {/* Left scroll button */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 px-4 hidden lg:block">
                <button
                  type="button"
                  className="p-2 bg-black/80 hover:bg-video-context-hoverColor transition-colors rounded-full border border-video-context-border backdrop-blur-sm"
                  onClick={() => handleScroll("left")}
                >
                  <Icon icon={Icons.CHEVRON_LEFT} className="text-white/80" />
                </button>
              </div>

              <div
                ref={carouselRef}
                className="flex overflow-x-auto space-x-4 pb-4 pt-2 lg:px-12 scrollbar-hide carousel-container"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Add padding before the first card */}
                <div className="flex-shrink-0 w-4" />

                {currentSeasonEpisodes?.map((episode) => {
                  const isActive =
                    showProgress?.episode?.id === episode.id.toString();
                  const episodeProgress =
                    progress[data.id?.toString() ?? ""]?.episodes?.[episode.id];
                  const percentage = episodeProgress
                    ? (episodeProgress.progress.watched /
                        episodeProgress.progress.duration) *
                      100
                    : 0;
                  const isAired = hasAired(episode.air_date);

                  return (
                    <Link
                      key={episode.id}
                      to={getEpisodeUrl(episode)}
                      ref={isActive ? activeEpisodeRef : null}
                      className={classNames(
                        "flex-shrink-0 w-64 rounded-lg overflow-hidden transition-all duration-200 relative cursor-pointer hover:scale-95",
                        isActive
                          ? "bg-video-context-hoverColor/50 hover:bg-white/5"
                          : "hover:bg-video-context-hoverColor/50 hover:bg-white/5",
                        !isAired ? "opacity-50" : "",
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full bg-video-context-hoverColor">
                        {episode.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                            alt={episode.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                            <Icon
                              icon={Icons.FILM}
                              className="text-video-context-type-main opacity-50 text-3xl"
                            />
                          </div>
                        )}

                        {/* Episode Number Badge */}
                        <div className="absolute top-2 left-2 flex items-center space-x-2">
                          <span className="p-0.5 px-2 rounded inline bg-video-context-hoverColor bg-opacity-80 text-video-context-type-main text-sm">
                            E{episode.episode_number}
                          </span>
                          {!isAired && (
                            <span className="text-video-context-type-main/70 text-sm">
                              {episode.air_date
                                ? `(Airs - ${new Date(episode.air_date).toLocaleDateString()})`
                                : "(Unreleased)"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3 className="font-bold text-white line-clamp-1">
                          {episode.name}
                        </h3>
                        {episode.overview && (
                          <p className="text-sm text-white/80 mt-1.5 line-clamp-2">
                            {episode.overview}
                          </p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {percentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-progress-background/25">
                          <div
                            className="h-full bg-progress-filled"
                            style={{
                              width: `${percentage > 98 ? 100 : percentage}%`,
                            }}
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}

                {/* Add padding after the last card */}
                <div className="flex-shrink-0 w-4" />
              </div>

              {/* Right scroll button */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 px-4 hidden lg:block">
                <button
                  type="button"
                  className="p-2 bg-black/80 hover:bg-video-context-hoverColor transition-colors rounded-full border border-video-context-border backdrop-blur-sm"
                  onClick={() => handleScroll("right")}
                >
                  <Icon icon={Icons.CHEVRON_RIGHT} className="text-white/80" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DetailsModal(props: {
  id: string;
  data?: {
    id: number;
    type: "movie" | "show";
  };
  minimal?: boolean;
}) {
  const modal = useModal(props.id);
  const [detailsData, setDetailsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!props.data?.id || !props.data?.type) return;

      setIsLoading(true);
      try {
        const type =
          props.data.type === "movie"
            ? TMDBContentTypes.MOVIE
            : TMDBContentTypes.TV;
        const details = await getMediaDetails(props.data.id.toString(), type);
        const backdropUrl = getMediaBackdrop(details.backdrop_path);

        if (type === TMDBContentTypes.MOVIE) {
          const movieDetails = details as TMDBMovieData;
          setDetailsData({
            title: movieDetails.title,
            overview: movieDetails.overview,
            backdrop: backdropUrl,
            runtime: movieDetails.runtime,
            genres: movieDetails.genres,
            language: movieDetails.original_language,
            voteAverage: movieDetails.vote_average,
            voteCount: movieDetails.vote_count,
            releaseDate: movieDetails.release_date,
            rating: movieDetails.release_dates?.results?.find(
              (r) => r.iso_3166_1 === "US",
            )?.release_dates?.[0]?.certification,
            director: movieDetails.credits?.crew?.find(
              (person) => person.job === "Director",
            )?.name,
            actors: movieDetails.credits?.cast
              ?.slice(0, 5)
              .map((actor) => actor.name),
            type: "movie",
            id: movieDetails.id,
            imdbId: movieDetails.external_ids?.imdb_id,
          });
        } else {
          const showDetails = details as TMDBShowData & {
            episodes: Array<{
              id: number;
              name: string;
              episode_number: number;
              overview: string;
              still_path: string | null;
              air_date: string;
              season_number: number;
            }>;
          };
          setDetailsData({
            title: showDetails.name,
            overview: showDetails.overview,
            backdrop: backdropUrl,
            episodes: showDetails.number_of_episodes,
            seasons: showDetails.number_of_seasons,
            genres: showDetails.genres,
            language: showDetails.original_language,
            voteAverage: showDetails.vote_average,
            voteCount: showDetails.vote_count,
            releaseDate: showDetails.first_air_date,
            rating: showDetails.content_ratings?.results?.find(
              (r) => r.iso_3166_1 === "US",
            )?.rating,
            director: showDetails.credits?.crew?.find(
              (person) => person.job === "Director",
            )?.name,
            actors: showDetails.credits?.cast
              ?.slice(0, 5)
              .map((actor) => actor.name),
            type: "show",
            id: showDetails.id,
            imdbId: showDetails.external_ids?.imdb_id,
            seasonData: {
              seasons: showDetails.seasons,
              episodes: showDetails.episodes,
            },
          });
        }
      } catch (err) {
        console.error("Failed to fetch media details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (modal.isShown && props.data?.id) {
      fetchDetails();
    }
  }, [modal.isShown, props.data]);

  useEffect(() => {
    if (modal.isShown && !props.data?.id && !isLoading) {
      modal.hide();
    }
  }, [modal, props.data, isLoading]);

  return (
    <OverlayPortal darken close={modal.hide} show={modal.isShown}>
      <Helmet>
        <html data-no-scroll />
      </Helmet>
      <div className="flex absolute inset-0 items-center justify-center">
        <Flare.Base
          className={classNames(
            "group -m-[0.705em] rounded-3xl bg-background-main transition-colors duration-300 focus:relative focus:z-10",
            "max-h-[900px] max-w-[1200px]",
            "bg-mediaCard-hoverBackground bg-opacity-60 backdrop-filter backdrop-blur-lg shadow-lg overflow-hidden",
            detailsData?.type === "movie" || props.minimal
              ? "h-[90%] md:h-[70%] lg:h-fit w-[90%] md:w-[70%] lg:w-[50%]"
              : "h-[90%] w-[90%] md:w-[70%] lg:w-[60%]",
          )}
        >
          <div className="transition-transform duration-300 h-full">
            <Flare.Light
              flareSize={500}
              cssColorVar="--colors-mediaCard-hoverAccent"
              backgroundClass="bg-mediaCard-hoverBackground duration-100"
              className="rounded-3xl bg-background-main group-hover:opacity-100"
            />
            <Flare.Child className="pointer-events-auto relative h-full overflow-y-auto scrollbar-none">
              <div className="absolute right-4 top-4 z-10">
                <button
                  type="button"
                  className="text-s font-semibold text-type-secondary hover:text-white transition-transform hover:scale-95"
                  onClick={modal.hide}
                >
                  <IconPatch icon={Icons.X} />
                </button>
              </div>
              <div className="pt-12">
                {isLoading || !detailsData ? (
                  <DetailsSkeleton />
                ) : (
                  <DetailsContent data={detailsData} minimal={props.minimal} />
                )}
              </div>
            </Flare.Child>
          </div>
        </Flare.Base>
      </div>
    </OverlayPortal>
  );
}
