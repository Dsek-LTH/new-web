import prisma from "$lib/prisma";
import type { Member, Prisma } from "@prisma/client";

export const getAllArticles = async () => {
  const response = await prisma.article.findMany({
    where: {
      publishedAt: {
        lte: new Date(),
        not: null,
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      author: {
        include: {
          member: true,
          mandate: {
            include: {
              position: true,
            },
          },
        },
      },
      likers: true,
      tags: true,
    },
  });
  return response;
};

export const getArticle = async (slug: string) => {
  const response = await prisma.article.findUnique({
    where: {
      slug,
      publishedAt: {
        lte: new Date(),
        not: null,
      },
    },
    include: {
      author: {
        include: {
          member: true,
          mandate: {
            include: {
              position: true,
            },
          },
        },
      },
      likers: true,
      tags: true,
    },
  });
  return response;
};

export type Article = NonNullable<Awaited<ReturnType<typeof getArticle>>>;

export type AuthorOption = {
  id: string;
  memberId: string;
  member: Member;
  mandateId: string | null;
  mandate: Prisma.MandateGetPayload<{
    include: {
      position: true;
    };
  }> | null;
  customId: string | null;
  createdAt: Date;
  updatedAt: Date;
  type: string;
};

export const getArticleAuthorOptions = (
  memberWithMandates: Prisma.MemberGetPayload<{
    include: {
      mandates: {
        include: {
          position: true;
        };
      };
    };
  }>
) => {
  const authorOptions: AuthorOption[] = [
    {
      id: "0",
      memberId: memberWithMandates.id,
      member: memberWithMandates,
      mandateId: null,
      mandate: null,
      customId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "Member",
    },
    ...(memberWithMandates?.mandates.map((mandate) => {
      return {
        id: String(mandate.id),
        memberId: memberWithMandates.id,
        member: memberWithMandates,
        mandateId: mandate.id,
        mandate: mandate,
        customId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "Mandate",
      };
    }) ?? []),
  ];
  return authorOptions;
};
