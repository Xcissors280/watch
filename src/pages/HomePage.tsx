import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { WideContainer } from "@/components/layout/WideContainer";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { HomeLayout } from "@/pages/layouts/HomeLayout";
import { BookmarksPart } from "@/pages/parts/home/BookmarksPart";
import { HeroPart } from "@/pages/parts/home/HeroPart";
import { WatchingPart } from "@/pages/parts/home/WatchingPart";
import { SearchListPart } from "@/pages/parts/search/SearchListPart";
import { SearchLoadingPart } from "@/pages/parts/search/SearchLoadingPart";

function useSearch(search: string) {
  const [searching, setSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const debouncedSearch = useDebounce<string>(search, 500);
  useEffect(() => {
    setSearching(search !== "");
    setLoading(search !== "");
  }, [search]);
  useEffect(() => {
    setLoading(false);
  }, [debouncedSearch]);

  return {
    loading,
    searching,
  };
}

// What the sigma?

export function HomePage() {
  const { t } = useTranslation();
  const [showBg, setShowBg] = useState<boolean>(false);
  const searchParams = useSearchQuery();
  const [search] = searchParams;
  const s = useSearch(search);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showWatching, setShowWatching] = useState(false);
  const [contentRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <HomeLayout showBg={showBg}>
      <div className="relative mb-24">
        <Helmet>
          <style type="text/css">{`
            html, body {
              scrollbar-gutter: stable;
            }
          `}</style>
          <title>{t("global.name")}</title>
        </Helmet>

        <div className="absolute left-0 top-0 h-[400px] w-full">
          <div
            className="absolute -top-52 left-0 right-0 bottom-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 80% 8rem, #211D30 100%, transparent 100%)`,
            }}
          />
          <div
            className="absolute -top-20 left-0 right-0 bottom-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 70% 12rem, #211D30 100%, transparent 100%)`,
            }}
          />
        </div>

        <HeroPart searchParams={searchParams} setIsSticky={setShowBg} />
      </div>

      <WideContainer>
        <div ref={contentRef}>
          {s.loading ? (
            <SearchLoadingPart />
          ) : s.searching ? (
            <SearchListPart searchQuery={search} />
          ) : (
            <div className="flex flex-col gap-8 -mt-8">
              <BookmarksPart onItemsChange={setShowBookmarks} />
              <WatchingPart
                onItemsChange={setShowWatching}
                className="space-y-6"
              />
            </div>
          )}
        </div>
      </WideContainer>
    </HomeLayout>
  );
}
