import { MediaCard } from "@/components/media/MediaCard";
import { Media } from "@/pages/discover/common";
import { MediaItem } from "@/utils/mediaTypes";

import { CarouselNavButtons } from "./CarouselNavButtons";

interface MediaCarouselProps {
  medias: Media[];
  category: string;
  isTVShow: boolean;
  isMobile: boolean;
  carouselRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  onShowDetails?: (media: MediaItem) => void;
}

function MediaCardSkeleton() {
  return (
    <div className="relative mt-4 group cursor-default user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto">
      <div className="animate-pulse">
        <div className="w-full aspect-[2/3] bg-mediaCard-hoverBackground rounded-lg" />
        <div className="mt-2 h-4 bg-mediaCard-hoverBackground rounded w-3/4" />
      </div>
    </div>
  );
}

export function MediaCarousel({
  medias,
  category,
  isTVShow,
  isMobile,
  carouselRefs,
  onShowDetails,
}: MediaCarouselProps) {
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const browser = !!window.chrome;
  let isScrolling = false;

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling) return;
    isScrolling = true;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (browser) {
      setTimeout(() => {
        isScrolling = false;
      }, 345);
    } else {
      isScrolling = false;
    }
  };

  function getDisplayCategory(
    categoryName: string,
    isTVShowCondition: boolean,
  ): string {
    switch (categoryName) {
      case "Now Playing":
        return "In Cinemas";
      case categoryName.match(/^Popular (Movies|Shows) on .+/)?.input:
        return categoryName;
      default:
        return categoryName.endsWith("Movie")
          ? `${categoryName}s`
          : isTVShowCondition
            ? `${categoryName} Shows`
            : `${categoryName} Movies`;
    }
  }

  const displayCategory = getDisplayCategory(category, isTVShow);

  const filteredMedias = medias
    .filter(
      (media, index, self) =>
        index ===
        self.findIndex((m) => m.id === media.id && m.title === media.title),
    )
    .slice(0, 20);

  const SKELETON_COUNT = 10;

  return (
    <>
      <h2 className="ml-2 md:ml-8 mt-2 text-2xl cursor-default font-bold text-white md:text-2xl mx-auto pl-5 text-balance">
        {displayCategory}
      </h2>
      <div className="relative overflow-hidden carousel-container">
        <div
          id={`carousel-${categorySlug}`}
          className="grid grid-flow-col auto-cols-max gap-4 pt-0 pb-4 overflow-x-scroll scrollbar rounded-xl overflow-y-hidden md:pl-8 md:pr-8"
          ref={(el) => {
            carouselRefs.current[categorySlug] = el;
          }}
          onWheel={handleWheel}
        >
          <div className="md:w-12" />

          {filteredMedias.length > 0
            ? filteredMedias.map((media) => (
                <div
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                  key={media.id}
                  className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto"
                >
                  <MediaCard
                    linkable
                    key={media.id}
                    media={{
                      id: media.id.toString(),
                      title: media.title || media.name || "",
                      poster: `https://image.tmdb.org/t/p/w342${media.poster_path}`,
                      type: isTVShow ? "show" : "movie",
                      year: isTVShow
                        ? media.first_air_date
                          ? parseInt(media.first_air_date.split("-")[0], 10)
                          : undefined
                        : media.release_date
                          ? parseInt(media.release_date.split("-")[0], 10)
                          : undefined,
                    }}
                    onShowDetails={onShowDetails}
                  />
                </div>
              ))
            : Array.from({ length: SKELETON_COUNT }).map(() => (
                <MediaCardSkeleton
                  key={`skeleton-${categorySlug}-${Math.random().toString(36).substring(7)}`}
                />
              ))}

          <div className="md:w-12" />
        </div>

        {!isMobile && (
          <CarouselNavButtons
            categorySlug={categorySlug}
            carouselRefs={carouselRefs}
          />
        )}
      </div>
    </>
  );
}
