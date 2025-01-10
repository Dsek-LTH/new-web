import type { SearchDataWithType } from "$lib/search/searchTypes";

export function isSearchResultData(data: unknown): data is {
  results: SearchDataWithType[];
} {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray(data["results"])
  );
}
