import { Link, To, useNavigate } from "react-router-dom";

import { IconPatch } from "@/components/buttons/IconPatch";
import { Icons } from "@/components/Icon";
import { useBannerSize } from "@/stores/banner";

import { BrandPill } from "./BrandPill";

export interface NavigationProps {
  bg?: boolean;
}

export function Navigation(props: NavigationProps) {
  const bannerHeight = useBannerSize();
  const navigate = useNavigate();

  const handleClick = (path: To) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 z-20 min-h-[150px] bg-gradient-to-b from-denim-300 via-denim-300 to-transparent sm:from-transparent"
      style={{
        top: `${bannerHeight}px`,
      }}
    >
      <div className="fixed left-0 right-0 flex items-center justify-between px-7 py-5">
        <div
          className={`${
            props.bg ? "opacity-100" : "opacity-0"
          } absolute inset-0 block bg-denim-100 transition-opacity duration-300`}
        >
          <div className="pointer-events-none absolute -bottom-24 h-24 w-full bg-gradient-to-b from-denim-100 to-transparent" />
        </div>

        <div className="relative flex w-full items-center justify-center sm:w-fit">
          <div className="mr-auto sm:mr-6">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <BrandPill clickable />
            </Link>
          </div>
        </div>

        <div className="relative flex items-center gap-4">
          <a
            onClick={() => handleClick("/settings")}
            rel="noreferrer"
            className="text-xl text-white tabbable rounded-full"
          >
            <IconPatch icon={Icons.GEAR} clickable />
          </a>
          <a
            href="https://discord.gg/7z6znYgrTG"
            rel="noreferrer"
            className="text-xl text-white tabbable rounded-full"
          >
            <IconPatch icon={Icons.DISCORD} clickable />
          </a>
          <a
            onClick={() => handleClick("/settings")}
            rel="noreferrer"
            className="text-xl text-white tabbable rounded-full"
          >
            <IconPatch icon={Icons.GITHUB} clickable />
          </a>
        </div>
      </div>
    </div>
  );
}
