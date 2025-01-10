import type { RequestHandler } from "@sveltejs/kit";
import { meilisearch } from "$lib/search/meilisearch";
import {
  getFederatedWeight,
  getSearchableAttributes,
} from "$lib/search/searchHelpers";
import {
  listOfAttributesUsedAsLink,
  type SearchDataWithType,
} from "$lib/search/searchTypes";

/**
 * This endpoint is used to search multiple indexes at once.
 * It takes a query and a list of indexes to search in.
 * It will return the results from each index.
 * Example usage:
 * GET /api/search?query=oddput clementin&indexes=["members", "articles"]
 * This will search for "oddput clementin" in the "members" and "articles" indexes.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  const query = url.searchParams.get("query");
  if (!query) {
    return new Response("Missing query", { status: 400 });
  }
  const indexes = JSON.parse(url.searchParams.get("indexes") ?? "[]");
  if (!Array.isArray(indexes)) {
    return new Response("Invalid indexes, please provide an array of strings", {
      status: 400,
    });
  }

  if (indexes.length === 0) {
    return new Response("Missing type", { status: 400 });
  }

  for (const t of indexes) {
    if (typeof t !== "string") {
      return new Response(
        "Invalid indexes, please provide an array of strings",
        {
          status: 400,
        },
      );
    }
  }
  let limit = Number.parseInt(url.searchParams.get("limit") ?? "20");
  if (limit === -1) {
    limit = 20;
  }
  const language = locals.language;

  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0");

  const response: SearchDataWithType[] = await meilisearch
    .multiSearch({
      queries: indexes.map((index) => ({
        indexUid: index,
        q: query,
        attributesToSearchOn: getSearchableAttributes(index, language),
        federationOptions: { weight: getFederatedWeight(index) },
        showRankingScoreDetails: true,
      })),
      federation: {
        limit,
        offset,
      },
    })
    .then((response) => {
      return response.hits.map((hit) => {
        // Transform the data to hide that some
        // fields are language specific
        if (language === "en") {
          const hitCopy = { ...hit };
          const hitKeys = Object.keys(hit);
          for (const key of hitKeys) {
            if (key.endsWith("En")) {
              hitCopy[key.slice(0, -2)] = hit[key];
            }
          }
          hit = hitCopy;
        }

        // Reduce the amount of data sent to the client
        // all string values are truncated to 60 characters
        for (const key of Object.keys(hit)) {
          if (
            // We must not truncate attributes that are used as links
            !listOfAttributesUsedAsLink.includes(key) &&
            typeof hit[key] === "string"
          ) {
            hit[key] = hit[key].slice(0, 60);
          }
        }

        return {
          data: hit,
          type: hit._federation?.indexUid,
        } as SearchDataWithType;
      });
    });

  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
