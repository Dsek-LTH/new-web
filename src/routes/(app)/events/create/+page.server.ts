import { eventSchema } from "$lib/events/schema";
import { createEvent } from "$lib/events/server/actions";
import { error } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { getAllTags } from "$lib/news/tags";

export const load: PageServerLoad = async ({ locals }) => {
  const { prisma, member } = locals;
  const allTags = await getAllTags(prisma);
  if (!member) error(401, "Du måste vara inloggad för att skapa evenemang.");
  return {
    allTags,
    form: await superValidate(
      { organizer: `${member.firstName} ${member.lastName}` },
      zod(eventSchema),
    ),
  };
};

export const actions: Actions = {
  default: createEvent,
};
