import type {
  Article,
  Member,
  Event,
  Song,
  Position,
  Committee,
} from "@prisma/client";

/**
 * Utility type that creates a new object type based on a union of keys (Keys).
 *
 * For each key in Keys:
 *   - If the key exists in T, its value type is preserved from T.
 *   - If the key does not exist in T, its value type is set to `string`.
 *
 * This is useful for creating a new type that includes specific keys (from Keys),
 * ensuring compatibility with an existing type (T), while accounting for missing keys.
 */
type FilterKeys<T extends Record<string, unknown>, Keys extends string> = {
  [Key in Keys]: Key extends keyof T ? T[Key] : string;
};

/**
 * Utility type that filters out keys from T that end with Suffix.
 * Useful for excluding specific keys from an existing type.
 * Used to exclude language specific fields from search attributes.
 */
type ObjectKeysNotEndingWith<T, Suffix extends string> = Pick<
  T,
  {
    [K in keyof T]: K extends `${string}${Suffix}` ? never : K;
  }[keyof T]
>;

type OnlySwedishAttributes<T> = ObjectKeysNotEndingWith<T, "En">;

/**
 * https://www.totaltypescript.com/concepts/the-prettify-helper
 */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const availableSearchIndexes = [
  "members",
  "events",
  "articles",
  "positions",
  "songs",
  "committees",
] as const;
export type SearchableIndex = (typeof availableSearchIndexes)[number];

// --------------------------------------------------
// MEMBER
// --------------------------------------------------

// The order of the attributes in the array is important for ranking
// The lower the index, the higher the weight
export const memberSearchableAttributes = [
  "fullName",
  "firstName",
  "lastName",
  "nickname",
  "studentId",
] as const satisfies Array<keyof MemberDataInMeilisearch>;
export type SearchableMemberAttributes = FilterKeys<
  Member,
  (typeof memberSearchableAttributes)[number]
>;
export type MemberDataInMeilisearch = Prettify<
  Pick<
    Member,
    | "firstName"
    | "lastName"
    | "nickname"
    | "studentId"
    | "classYear"
    | "classProgramme"
    | "picturePath"
  > & {
    fullName: `${Member["firstName"]} ${Member["lastName"]}`;
  }
>;
export type MemberSearchReturnAttributes = OnlySwedishAttributes<
  SearchableMemberAttributes &
    Pick<
      MemberDataInMeilisearch,
      "picturePath" | "classYear" | "classProgramme"
    >
>;

// --------------------------------------------------
// EVENT
// --------------------------------------------------

// The order of the attributes in the array is important for ranking
// The lower the index, the higher the weight
export const eventSearchableAttributes = [
  "title",
  "titleEn",
  "description",
  "descriptionEn",
] as const satisfies Array<keyof EventDataInMeilisearch>;
export type SearchableEventAttributes = Pick<
  Event,
  (typeof eventSearchableAttributes)[number]
>;
export type EventDataInMeilisearch = Prettify<
  Pick<
    Event,
    | "title"
    | "titleEn"
    | "description"
    | "descriptionEn"
    | "slug"
    | "startDatetime"
  >
>;
export type EventSearchReturnAttributes = OnlySwedishAttributes<
  SearchableEventAttributes & Pick<EventDataInMeilisearch, "slug">
>;

// --------------------------------------------------
// ARTICLE
// --------------------------------------------------

// The order of the attributes in the array is important for ranking
// The lower the index, the higher the weight
export const articleSearchableAttributes = [
  "header",
  "headerEn",
  "body",
  "bodyEn",
] as const satisfies Array<keyof ArticleDataInMeilisearch>;
export type SearchableArticleAttributes = Pick<
  Article,
  (typeof articleSearchableAttributes)[number]
>;
export type ArticleDataInMeilisearch = Pick<
  Article,
  "header" | "headerEn" | "body" | "bodyEn" | "slug" | "publishedAt"
>;
export type ArticleSearchReturnAttributes = OnlySwedishAttributes<
  SearchableArticleAttributes & Pick<ArticleDataInMeilisearch, "slug">
>;

// --------------------------------------------------
// POSITION
// --------------------------------------------------

// The order of the attributes in the array is important for ranking
// The lower the index, the higher the weight
export const positionSearchableAttributes = [
  "name",
  "nameEn",
  "description",
  "descriptionEn",
  "committeeName",
  "committeeNameEn",
  "dsekId",
] as const satisfies Array<keyof PositionDataInMeilisearch>;
export type SearchablePositionAttributes = FilterKeys<
  Position,
  (typeof positionSearchableAttributes)[number]
>;
export type PositionDataInMeilisearch = Prettify<
  Pick<Position, "name" | "nameEn" | "description" | "descriptionEn"> & {
    committee: Committee | null;
    dsekId: string;
    committeeName: Committee["name"];
    committeeNameEn: Committee["nameEn"];
  }
>;
export type PositionSearchReturnAttributes = OnlySwedishAttributes<
  SearchablePositionAttributes &
    Pick<PositionDataInMeilisearch, "committee" | "dsekId">
>;

// --------------------------------------------------
// COMMITTEE
// --------------------------------------------------

// The order of the attributes in the array is important for ranking
// The lower the index, the higher the weight
export const committeeSearchableAttributes = [
  "name",
  "nameEn",
  "description",
  "descriptionEn",
] as const satisfies Array<keyof CommitteeDataInMeilisearch>;
export type SearchableCommitteeAttributes = Pick<
  Committee,
  (typeof committeeSearchableAttributes)[number]
>;
export type CommitteeDataInMeilisearch = Prettify<
  Pick<
    Committee,
    | "name"
    | "nameEn"
    | "description"
    | "descriptionEn"
    | "shortName"
    | "darkImageUrl"
    | "lightImageUrl"
    | "monoImageUrl"
  >
>;
export type CommitteeSearchReturnAttributes = OnlySwedishAttributes<
  SearchableCommitteeAttributes &
    Pick<
      CommitteeDataInMeilisearch,
      "shortName" | "darkImageUrl" | "lightImageUrl" | "monoImageUrl"
    >
>;

// --------------------------------------------------
// SONG
// --------------------------------------------------

// The order of the attributes in the array is important for ranking
// The lower the index, the higher the weight
export const songSearchableAttributes = [
  "title",
  "lyrics",
  "melody",
  "category",
] as const satisfies Array<keyof SongDataInMeilisearch>;
export type SearchableSongAttributes = Pick<
  Song,
  (typeof songSearchableAttributes)[number]
>;
export type SongDataInMeilisearch = Prettify<
  Pick<Song, "title" | "lyrics" | "melody" | "category" | "slug">
>;
export type SongSearchReturnAttributes = OnlySwedishAttributes<
  SearchableSongAttributes & Pick<SongDataInMeilisearch, "slug">
>;

export type AnySearchReturnAttributes =
  | SongSearchReturnAttributes
  | ArticleSearchReturnAttributes
  | EventSearchReturnAttributes
  | MemberSearchReturnAttributes
  | PositionSearchReturnAttributes
  | CommitteeSearchReturnAttributes;

export type SearchDataWithType =
  | {
      type: "members";
      data: MemberSearchReturnAttributes;
    }
  | {
      type: "events";
      data: EventSearchReturnAttributes;
    }
  | {
      type: "articles";
      data: ArticleSearchReturnAttributes;
    }
  | {
      type: "songs";
      data: SongSearchReturnAttributes;
    }
  | {
      type: "positions";
      data: PositionSearchReturnAttributes;
    }
  | {
      type: "committees";
      data: CommitteeSearchReturnAttributes;
    };

export const attributesUsedAsLink: {
  members: keyof MemberSearchReturnAttributes;
  events: keyof EventSearchReturnAttributes;
  articles: keyof ArticleSearchReturnAttributes;
  songs: keyof SongSearchReturnAttributes;
  positions: keyof PositionSearchReturnAttributes;
  committees: keyof CommitteeSearchReturnAttributes;
} = {
  members: "studentId",
  events: "slug",
  articles: "slug",
  songs: "slug",
  positions: "dsekId",
  committees: "shortName",
};

export const listOfattributesUsedAsLink: string[] = Object.values(
  attributesUsedAsLink,
) satisfies string[];

type DefaultRankingRules =
  | "words"
  | "typo"
  | "proximity"
  | "attribute"
  | "exactness";
const defaultRankingRules = [
  "words",
  "typo",
  "proximity",
  "attribute",
  "exactness",
] as const satisfies DefaultRankingRules[];

interface MemberConstantsMeilisearch {
  searchableAttributes: Array<keyof SearchableMemberAttributes>;
  rankingRules: Array<
    DefaultRankingRules | `${keyof MemberDataInMeilisearch}:${"asc" | "desc"}`
  >;
  sortableAttributes?: Array<keyof MemberDataInMeilisearch>;
  typoTolerance?: {
    disableOnAttributes: Array<keyof SearchableMemberAttributes>;
    minWordSizeForTypos: {
      oneTypo: number;
      twoTypos: number;
    };
  };
}

interface ArticleConstantsMeilisearch {
  searchableAttributes: Array<keyof SearchableArticleAttributes>;
  rankingRules: Array<
    DefaultRankingRules | `${keyof ArticleDataInMeilisearch}:${"asc" | "desc"}`
  >;
  sortableAttributes?: Array<keyof ArticleDataInMeilisearch>;
  typoTolerance?: {
    disableOnAttributes: Array<keyof SearchableArticleAttributes>;
    minWordSizeForTypos: {
      oneTypo: number;
      twoTypos: number;
    };
  };
}

interface EventConstantsMeilisearch {
  searchableAttributes: Array<keyof SearchableEventAttributes>;
  rankingRules: Array<
    DefaultRankingRules | `${keyof EventDataInMeilisearch}:${"asc" | "desc"}`
  >;
  sortableAttributes?: Array<keyof EventDataInMeilisearch>;
  typoTolerance?: {
    disableOnAttributes: Array<keyof SearchableEventAttributes>;
    minWordSizeForTypos: {
      oneTypo: number;
      twoTypos: number;
    };
  };
}

interface PositionConstantsMeilisearch {
  searchableAttributes: Array<keyof SearchablePositionAttributes>;
  rankingRules: Array<
    DefaultRankingRules | `${keyof PositionDataInMeilisearch}:${"asc" | "desc"}`
  >;
  sortableAttributes?: Array<keyof PositionDataInMeilisearch>;
  typoTolerance?: {
    disableOnAttributes: Array<keyof SearchablePositionAttributes>;
    minWordSizeForTypos: {
      oneTypo: number;
      twoTypos: number;
    };
  };
}

interface CommitteeConstantsMeilisearch {
  searchableAttributes: Array<keyof SearchableCommitteeAttributes>;
  rankingRules: Array<
    | DefaultRankingRules
    | `${keyof CommitteeDataInMeilisearch}:${"asc" | "desc"}`
  >;
  sortableAttributes?: Array<keyof CommitteeDataInMeilisearch>;
  typoTolerance?: {
    disableOnAttributes: Array<keyof SearchableCommitteeAttributes>;
    minWordSizeForTypos: {
      oneTypo: number;
      twoTypos: number;
    };
  };
}

interface SongConstantsMeilisearch {
  searchableAttributes: Array<keyof SearchableSongAttributes>;
  rankingRules: Array<
    DefaultRankingRules | `${keyof SongDataInMeilisearch}:${"asc" | "desc"}`
  >;
  sortableAttributes?: Array<keyof SongDataInMeilisearch>;
  typoTolerance?: {
    disableOnAttributes: Array<keyof SearchableSongAttributes>;
    minWordSizeForTypos: {
      oneTypo: number;
      twoTypos: number;
    };
  };
}

const memberMeilisearchConstants: MemberConstantsMeilisearch = {
  searchableAttributes: memberSearchableAttributes,
  rankingRules: [
    ...defaultRankingRules,
    "classYear:desc", // Give a higher weight to newer members
  ],
  sortableAttributes: ["classYear"],
  typoTolerance: {
    disableOnAttributes: ["studentId"], // Student ID should not have typos
    minWordSizeForTypos: {
      // Default is 5 for one, and 9 for two
      // A query like "Maja" should still match "Maya", and "Erik" should match "Eric"
      oneTypo: 4,
      twoTypos: 6,
    },
  },
};

const articleMeilisearchConstants: ArticleConstantsMeilisearch = {
  searchableAttributes: articleSearchableAttributes,
  rankingRules: defaultRankingRules,
  sortableAttributes: ["publishedAt"],
};

const eventMeilisearchConstants: EventConstantsMeilisearch = {
  searchableAttributes: eventSearchableAttributes,
  rankingRules: [
    ...defaultRankingRules,
    "startDatetime:desc", // Give a higher weight to newer events
  ],
  sortableAttributes: ["startDatetime"],
};

const positionMeilisearchConstants: PositionConstantsMeilisearch = {
  searchableAttributes: positionSearchableAttributes,
  rankingRules: defaultRankingRules,
};

const committeeMeilisearchConstants: CommitteeConstantsMeilisearch = {
  searchableAttributes: committeeSearchableAttributes,
  rankingRules: defaultRankingRules,
};

const songMeilisearchConstants: SongConstantsMeilisearch = {
  searchableAttributes: songSearchableAttributes,
  rankingRules: defaultRankingRules,
};

export const meilisearchConstants = {
  member: memberMeilisearchConstants,
  article: articleMeilisearchConstants,
  event: eventMeilisearchConstants,
  position: positionMeilisearchConstants,
  committee: committeeMeilisearchConstants,
  song: songMeilisearchConstants,
};

export type MeilisearchConstants =
  | {
      constants: MemberConstantsMeilisearch;
      data: MemberDataInMeilisearch;
    }
  | {
      constants: ArticleConstantsMeilisearch;
      data: ArticleDataInMeilisearch;
    }
  | {
      constants: EventConstantsMeilisearch;
      data: EventDataInMeilisearch;
    }
  | {
      constants: PositionConstantsMeilisearch;
      data: PositionDataInMeilisearch;
    }
  | {
      constants: CommitteeConstantsMeilisearch;
      data: CommitteeDataInMeilisearch;
    }
  | {
      constants: SongConstantsMeilisearch;
      data: SongDataInMeilisearch;
    };
