import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Menu } from "@/components/player/internals/ContextMenu";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePreviewThemeStore, useThemeStore } from "@/stores/theme";

import { SelectableLink } from "../../internals/ContextMenu/Links";

const availableThemes = [
  {
    id: "default",
    key: "settings.appearance.themes.default",
  },
  {
    id: "blue",
    key: "settings.appearance.themes.blue",
  },
  {
    id: "teal",
    key: "settings.appearance.themes.teal",
  },
  {
    id: "red",
    key: "settings.appearance.themes.red",
  },
  {
    id: "gray",
    key: "settings.appearance.themes.gray",
  },
  {
    id: "classic",
    key: "settings.appearance.themes.classic",
  },
];

export function ThemeView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const activeTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setPreviewTheme = usePreviewThemeStore((s) => s.setPreviewTheme);

  const handleThemeChange = useCallback(
    (themeId: string) => {
      const newTheme = themeId === "default" ? null : themeId;
      setTheme(newTheme);
      setPreviewTheme(themeId);
      router.close();
    },
    [setTheme, setPreviewTheme, router],
  );

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>Theme</Menu.BackLink>
      <Menu.Section className="flex flex-col pb-4">
        {availableThemes.map((theme) => (
          <SelectableLink
            key={theme.id}
            selected={(activeTheme ?? "default") === theme.id}
            onClick={() => handleThemeChange(theme.id)}
          >
            {t(theme.key)}
          </SelectableLink>
        ))}
      </Menu.Section>
    </>
  );
}
