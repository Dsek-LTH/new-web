import { isFileImage } from "$lib/files/utils";
import { authorSchema, tagSchema } from "$lib/zod/schemas";
import type { Infer } from "sveltekit-superforms";
import { z } from "zod";

export const articleSchema = z.object({
  slug: z.string(),
  header: z.string().min(1, "Title cannot be empty"),
  headerEn: z.string().nullable(),
  body: z.string().default(""),
  bodyEn: z.string().nullable(),
  author: authorSchema,
  tags: z
    .array(
      tagSchema.pick({
        id: true,
      }),
    )
    .default([]),
  imageUrls: z.string().array().optional(),
  imageUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
  // https://github.com/colinhacks/zod/pull/3118
  images: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((file) => !file || isFileImage(file), {
      message: "Måste vara en bild",
    })
    .array()
    .default([]),
  image: z
    .instanceof(File, { message: "Please upload a file" })
    .nullable()
    .optional()
    .refine((file) => !file || isFileImage(file), {
      message: "Måste vara en bild",
    }),
});
export type ArticleSchema = Infer<typeof articleSchema>;

export const createSchema = articleSchema
  .omit({
    slug: true,
  })
  .extend({
    notificationText: z.string().max(255).optional().nullable(),
    sendNotification: z.boolean(),
  })
  .refine((data) => data.sendNotification === false || data.tags.length > 0, {
    message:
      "Tags cannot be empty if you want to send a notification. No notifications will be sent",
    path: ["tags"],
  });

export const updateSchema = articleSchema;
