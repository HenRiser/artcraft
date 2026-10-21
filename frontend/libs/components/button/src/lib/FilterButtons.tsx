import { t as uiText, useLocale as useUiLocale } from "@storyteller/common";
import { AssetFilterOption } from "@storyteller/common";

interface Props {
  onClick: (button: AssetFilterOption) => void;
  value: AssetFilterOption;
}

const FILTERS = [
  {
    get text() { return uiText("button.featured"); },
    option: AssetFilterOption.FEATURED,
  },
  {
    get text() { return uiText("button.mine"); },
    option: AssetFilterOption.MINE,
  },
  {
    get text() { return uiText("button.bookmarked"); },
    option: AssetFilterOption.BOOKMARKED,
  },
];

export function FilterButtons({ onClick, value }: Props) {
  useUiLocale();
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-4">
        {FILTERS.map((filter) => {
          const isBookmarks = filter.option === AssetFilterOption.BOOKMARKED;
          return (
            <button
              key={filter.option}
              className={`filter-tab${value === filter.option ? " active" : ""}`}
              disabled={isBookmarks}
              onClick={() => onClick(filter.option)}
            >
              {filter.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
