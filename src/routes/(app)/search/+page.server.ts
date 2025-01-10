import type { Actions } from "./$types";
import {
  availableSearchIndexes,
  type SearchDataWithType,
} from "$lib/search/searchTypes";
import { i18n } from "$lib/utils/i18n";
import { fail } from "@sveltejs/kit";

export const actions = {
  default: async (event) => {
    const data = await event.request.formData();

    const query = data.get("input");
    if (typeof query !== "string") return;
    if (query.trim().length === 0) {
      return {
        results: [] satisfies SearchDataWithType[],
      };
    }

    // Check which indexes were selected to search in
    const indexes = availableSearchIndexes.filter(
      (index) => data.get(index) === "on",
    );

    // Check how many total results to return
    const limit: number = Number.parseInt(
      data.get("limit")?.toString() ?? "20",
    );

    // Check which offset to start from
    const offset: number = Number.parseInt(
      data.get("offset")?.toString() ?? "0",
    );

    // Check which language to search in and get the correct route
    const apiRoute = i18n.resolveRoute("/api/search", event.locals.language);
    const url = new URL(apiRoute, event.request.url);
    url.searchParams.set("query", query);
    url.searchParams.set("indexes", JSON.stringify(indexes));
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("offset", offset.toString());
    const response = await event.fetch(url);
    if (!response.ok) {
      const responseText = await response.text();
      console.log(
        "Error in search request",
        response.status,
        response.statusText,
        responseText,
      );
      return fail(response.status, {
        statusDescription: response.statusText,
        message: responseText,
      });
    }
    const json: SearchDataWithType[] = await response.json();
    return {
      results: json,
    };
  },
} satisfies Actions;
