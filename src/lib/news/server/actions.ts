import { PUBLIC_BUCKETS_FILES } from "$env/static/public";
import { uploadFile } from "$lib/files/uploadFiles";
import { createSchema, updateSchema } from "$lib/news/schema";
import authorizedPrismaClient from "$lib/server/authorizedPrisma";
import sendNotification from "$lib/utils/notifications";
import { NotificationType } from "$lib/utils/notifications/types";
import { redirect } from "$lib/utils/redirect";
import { slugWithCount, slugify } from "$lib/utils/slugify";
import * as m from "$paraglide/messages";
import { Prisma, type Article, type Author, type Tag } from "@prisma/client";
import type { Action } from "@sveltejs/kit";
import type { AuthUser } from "@zenstackhq/runtime";
import { zod } from "sveltekit-superforms/adapters";
import { message, superValidate, fail } from "sveltekit-superforms";
import DOMPurify from "isomorphic-dompurify";
import { markdownToTxt } from "markdown-to-txt";

const uploadImage = async (user: AuthUser, image: File, slug: string) => {
  const randomName = (Math.random() + 1).toString(36).substring(2);
  const imageUrl = await uploadFile(
    user,
    image,
    `public/news/${slug}`,
    PUBLIC_BUCKETS_FILES,
    randomName,
    {
      resize: {
        width: 1920,
      },
    },
  );
  return imageUrl;
};

const sendNewArticleNotification = async (
  article: Article & { tags: Array<Pick<Tag, "id">>; author: Author },
  notificationText: string | null | undefined,
) => {
  console.log("notifications: getting members");
  const subscribedMembers = await authorizedPrismaClient.member.findMany({
    where: {
      subscribedTags: {
        some: {
          id: {
            in: article.tags.map(({ id }) => id),
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  console.log("notifications: sending");
  await sendNotification({
    title: article.header,
    message: notificationText
      ? notificationText
      : markdownToTxt(article.body).slice(0, 254),
    type: NotificationType.NEW_ARTICLE,
    link: `/news/${article.slug}`,
    fromAuthor: article.author,
    memberIds: subscribedMembers.map(({ id }) => id),
  });
};

export const createArticle: Action = async (event) => {
  const { request, locals } = event;
  const { prisma, user } = locals;
  const form = await superValidate(request, zod(createSchema), {
    allowFiles: true,
  });
  if (!form.valid) return fail(400, { form });
  const {
    author,
    tags,
    header,
    sendNotification: shouldSendNotification,
    notificationText,
    images,
    body,
    bodyEn,
    ...rest
  } = form.data;
  delete rest.image;
  const existingAuthor = await prisma.author.findFirst({
    where: {
      member: { studentId: user?.studentId },
      mandateId: author.mandateId,
      customId: author.customId,
    },
  });
  let slug = slugify(header);
  // authorized so we actually count all
  const slugCount = await authorizedPrismaClient.article.count({
    where: {
      slug: { startsWith: slug },
    },
  });
  slug = slugWithCount(slug, slugCount);
  const tasks: Array<Promise<string>> = [];
  Array.from(images).forEach((image) => {
    tasks.push(uploadImage(user, image, slug));
  });
  await Promise.resolve();
  rest.imageUrls = await Promise.all(tasks);

  const result = await prisma.article.create({
    data: {
      slug,
      header: header,
      body: DOMPurify.sanitize(body),
      bodyEn: bodyEn ? DOMPurify.sanitize(bodyEn) : bodyEn,
      ...rest,
      author: {
        connect: existingAuthor
          ? {
              id: existingAuthor.id,
            }
          : undefined,
        create: !existingAuthor
          ? {
              member: {
                connect: { studentId: user?.studentId },
              },
              mandate: author.mandateId
                ? {
                    connect: {
                      member: { studentId: user?.studentId },
                      id: author.mandateId,
                    },
                  }
                : undefined,
              customAuthor: author.customId
                ? {
                    connect: { id: author.customId },
                  }
                : undefined,
            }
          : undefined,
      },
      tags: {
        connect: tags
          .filter((tag) => !!tag)
          .map((tag) => ({
            id: tag.id,
          })),
      },
      publishedAt: new Date(),
    },
    include: {
      author: true,
    },
  });

  // fetch the created author,
  if (shouldSendNotification) {
    console.log("send notifications");
    await sendNewArticleNotification(
      {
        ...result,
        tags,
      },
      notificationText,
    );
  }

  throw redirect(
    `/news/${result.slug}`,
    {
      message: m.news_articleCreated(),
      type: "success",
    },
    event,
  );
};
export const updateArticle: Action<{ slug: string }> = async (event) => {
  const { request, locals } = event;
  const { prisma, user } = locals;
  const form = await superValidate(request, zod(updateSchema), {
    allowFiles: true,
  });
  if (!form.valid) return fail(400, { form });
  const { slug, author, tags, images, body, bodyEn, ...rest } = form.data;
  delete rest.image;
  const existingAuthor = await prisma.author.findFirst({
    where: {
      member: { id: author.memberId },
      mandateId: author.mandateId,
      customId: author.customId,
    },
  });

  const tasks: Array<Promise<string>> = [];
  Array.from(images).forEach((image) => {
    tasks.push(uploadImage(user, image, slug));
  });

  await Promise.resolve();
  const newImages = await Promise.all(tasks);
  rest.imageUrls =
    rest.imageUrls === undefined
      ? newImages
      : [...rest.imageUrls, ...newImages];

  try {
    await prisma.article.update({
      where: {
        slug: slug,
      },
      data: {
        body: DOMPurify.sanitize(body),
        bodyEn: bodyEn ? DOMPurify.sanitize(bodyEn) : bodyEn,
        ...rest,
        author: {
          connect: existingAuthor
            ? {
                id: existingAuthor.id,
              }
            : undefined,
          create: existingAuthor
            ? {
                member: {
                  connect: { studentId: user?.studentId },
                },
                mandate: author.mandateId
                  ? {
                      connect: {
                        member: { studentId: user?.studentId },
                        id: author.mandateId,
                      },
                    }
                  : undefined,
                customAuthor: author.customId
                  ? {
                      connect: { id: author.customId },
                    }
                  : undefined,
              }
            : undefined,
        },
        tags: {
          set: tags.map(({ id }) => ({ id })),
        },
        updatedAt: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return message(
        form,
        {
          message: m.news_errors_articleNotFound(),
          type: "error",
        },
        { status: 400 },
      );
    }
    throw e;
  }

  throw redirect(
    `/news/${event.params.slug}`,
    {
      message: m.news_articleUpdated(),
      type: "success",
    },
    event,
  );
};
