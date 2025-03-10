const tokens = {
  black: "#000000",
  white: "#FFFFFF",
  semantic: {
    red: {
      c100: "#CD97D6", // Using bink-700 for errors since we don't have red
      c200: "#A87FD1", // Using bink-600 for error states
      c300: "#8D66B5", // Using bink-500 for danger buttons
    },
    green: {
      c100: "#A87FD1", // Using bink-600 for success states
      c200: "#8D66B5", // Using bink-500 for success indicators
      c300: "#714C97", // Using bink-400 for success buttons
    },
    silver: {
      c100: "#7A758F", // Using denim-700 for hover states
      c300: "#504B64", // Using denim-600 for secondary text
      c400: "#38334A", // Using denim-500 for dimmed text
    }
  },
  // Simplified color palette using new theme colors
  primary: {
    c100: "#CD97D6", // bink-700
    c200: "#A87FD1", // bink-600
    c300: "#8D66B5", // bink-500
    c400: "#714C97", // bink-400
    c500: "#533670", // bink-300
    c600: "#412B57", // bink-200
    c700: "#432449", // bink-100
  },
  background: {
    c100: "#7A758F", // denim-700
    c200: "#504B64", // denim-600
    c300: "#38334A", // denim-500
    c400: "#2B263D", // denim-400
    c500: "#211D30", // denim-300
    c600: "#191526", // denim-200
    c700: "#120F1D", // denim-100
  },
  ash: {
    c100: "#1E1C26", // ash-100
    c200: "#2B2836", // ash-200
    c300: "#2C293A", // ash-300
    c400: "#3D394D", // ash-400
    c500: "#9C93B5", // ash-500
    c600: "#817998", // ash-600
  }
}

export const defaultTheme = {
  extend: {
    colors: {
      themePreview: {
        primary: tokens.primary.c300,
        secondary: tokens.background.c200,
        ghost: tokens.white,
      },

      // Branding
      pill: {
        background: tokens.background.c400,
        backgroundHover: tokens.background.c300,
        highlight: tokens.primary.c300,
        activeBackground: tokens.background.c400,
      },

      global: {
        accentA: tokens.primary.c300,
        accentB: tokens.primary.c400,
      },

      lightBar: {
        light: tokens.primary.c400,
      },

      buttons: {
        toggle: tokens.primary.c300,
        toggleDisabled: tokens.background.c400,
        danger: tokens.semantic.red.c300,
        dangerHover: tokens.semantic.red.c200,
        secondary: tokens.background.c500,
        secondaryText: tokens.semantic.silver.c300,
        secondaryHover: tokens.background.c400,
        primary: tokens.white,
        primaryText: tokens.black,
        primaryHover: tokens.semantic.silver.c100,
        cancel: tokens.background.c400,
        cancelHover: tokens.background.c300,
      },

      background: {
        main: tokens.background.c700,
        secondary: tokens.background.c600,
        secondaryHover: tokens.background.c500,
        accentA: tokens.primary.c600,
        accentB: tokens.primary.c500,
      },

      modal: {
        background: tokens.background.c600,
      },

      type: {
        logo: tokens.primary.c200,
        emphasis: tokens.white,
        text: tokens.background.c100,
        dimmed: tokens.background.c200,
        divider: tokens.background.c400,
        secondary: tokens.semantic.silver.c300,
        danger: tokens.semantic.red.c100,
        success: tokens.semantic.green.c100,
        link: tokens.primary.c200,
        linkHover: tokens.primary.c100,
      },

      // search bar
      search: {
        background: tokens.background.c500,
        hoverBackground: tokens.background.c600,
        focused: tokens.background.c400,
        placeholder: tokens.background.c100,
        icon: tokens.background.c100,
        text: tokens.white,
      },

      // media cards
      mediaCard: {
        hoverBackground: tokens.background.c600,
        hoverAccent: tokens.primary.c100,
        hoverShadow: tokens.background.c700,
        shadow: tokens.background.c500,
        barColor: tokens.ash.c200,
        barFillColor: tokens.primary.c200,
        badge: tokens.background.c500,
        badgeText: tokens.ash.c500,
      },

      // Large card
      largeCard: {
        background: tokens.background.c600,
        icon: tokens.primary.c400,
      },

      // Dropdown
      dropdown: {
        background: tokens.background.c600,
        altBackground: tokens.background.c500,
        hoverBackground: tokens.background.c400,
        highlight: tokens.primary.c300,
        highlightHover: tokens.primary.c200,
        text: tokens.background.c100,
        secondary: tokens.background.c200,
        border: tokens.background.c400,
        contentBackground: tokens.background.c500,
      },

      // Passphrase
      authentication: {
        border: tokens.background.c400,
        inputBg: tokens.background.c600,
        inputBgHover: tokens.background.c500,
        wordBackground: tokens.background.c500,
        copyText: tokens.background.c200,
        copyTextHover: tokens.ash.c500,
        errorText: tokens.semantic.red.c100,
      },

      // Settings page
      settings: {
        sidebar: {
          activeLink: tokens.background.c600,
          badge: tokens.background.c700,

          type: {
            secondary: tokens.background.c300,
            inactive: tokens.background.c100,
            icon: tokens.background.c100,
            iconActivated: tokens.primary.c200,
            activated: tokens.primary.c100,
          },
        },

        card: {
          border: tokens.background.c400,
          background: tokens.background.c400,
          altBackground: tokens.background.c400,
        },

        saveBar: {
          background: tokens.background.c600,
        },
      },

      // Utilities
      utils: {
        divider: tokens.ash.c300,
      },

      // Onboarding
      onboarding: {
        bar: tokens.background.c400,
        barFilled: tokens.primary.c300,
        divider: tokens.background.c300,
        card: tokens.background.c600,
        cardHover: tokens.background.c500,
        border: tokens.background.c600,
        good: tokens.primary.c200,
        best: tokens.primary.c100,
        link: tokens.primary.c200,
      },

      // Error page
      errors: {
        card: tokens.background.c600,
        border: tokens.ash.c500,

        type: {
          secondary: tokens.ash.c500,
        },
      },

      // About page
      about: {
        circle: tokens.ash.c500,
        circleText: tokens.ash.c500,
      },

      editBadge: {
        bg: tokens.ash.c500,
        bgHover: tokens.ash.c400,
        text: tokens.ash.c500,
      },

      progress: {
        background: tokens.ash.c500,
        preloaded: tokens.ash.c500,
        filled: tokens.primary.c200,
      },

      // video player
      video: {
        buttonBackground: tokens.ash.c200,

        autoPlay: {
          background: tokens.ash.c400,
          hover: tokens.ash.c500,
        },

        scraping: {
          card: tokens.background.c500,
          error: tokens.semantic.red.c200,
          success: tokens.semantic.green.c200,
          loading: tokens.primary.c200,
          noresult: tokens.ash.c500,
        },

        audio: {
          set: tokens.primary.c200,
        },

        context: {
          background: tokens.ash.c400,
          light: tokens.background.c100,
          border: tokens.ash.c600,
          hoverColor: tokens.ash.c600,
          buttonFocus: tokens.ash.c500,
          flagBg: tokens.ash.c500,
          inputBg: tokens.ash.c600,
          buttonOverInputHover: tokens.ash.c500,
          inputPlaceholder: tokens.ash.c200,
          cardBorder: tokens.ash.c400,
          slider: tokens.ash.c500,
          sliderFilled: tokens.primary.c200,
          error: tokens.semantic.red.c200,

          buttons: {
            list: tokens.ash.c400,
            active: tokens.ash.c400,
          },

          closeHover: tokens.ash.c500,

          type: {
            main: tokens.semantic.silver.c400,
            secondary: tokens.ash.c200,
            accent: tokens.primary.c200,
          },
        },
      },
    },
  },
}
