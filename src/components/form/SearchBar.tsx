import c from "classnames";
import { forwardRef, useState } from "react";

import { Icon, Icons } from "../Icon";
import { TextInputControl } from "../text-inputs/TextInputControl";

export interface SearchBarProps {
  placeholder?: string;
  onChange: (value: string, force: boolean) => void;
  onUnFocus: (newSearch?: string) => void;
  value: string;
}

export const SearchBarInput = forwardRef<HTMLInputElement, SearchBarProps>(
  (props, ref) => {
    const [focused, setFocused] = useState(false);

    function setSearch(value: string) {
      props.onChange(value, true);
    }

    return (
      <div
        className={c(
          "relative flex flex-col rounded-[28px] transition-colors bg-denim-400",
          {
            "hover:bg-denim-500": true,
          },
        )}
      >
        <div className="pointer-events-none absolute bottom-0 left-5 top-0 flex max-h-14 items-center denim-700">
          <Icon icon={Icons.SEARCH} />
        </div>

        <TextInputControl
          ref={ref}
          onUnFocus={() => {
            setFocused(false);
            props.onUnFocus();
          }}
          onFocus={() => setFocused(true)}
          onChange={(val) => setSearch(val)}
          value={props.value}
          className="w-full flex-1 bg-transparent py-4 pl-12 text-white placeholder-denim-700 focus:outline-none sm:py-4 sm:pr-2"
          placeholder={props.placeholder}
        />

        {props.value.length > 0 && (
          <div
            onClick={() => {
              props.onUnFocus("");
              if (ref && typeof ref !== "function") {
                ref.current?.focus();
              }
            }}
            className="cursor-pointer hover:text-white absolute bottom-0 right-2 top-0 flex justify-center my-auto h-10 w-10 items-center hover:bg-denim-600 active:scale-110 text-white rounded-full transition-[transform,background-color] duration-200"
          >
            <Icon icon={Icons.X} className="transition-colors duration-200" />
          </div>
        )}
      </div>
    );
  },
);
