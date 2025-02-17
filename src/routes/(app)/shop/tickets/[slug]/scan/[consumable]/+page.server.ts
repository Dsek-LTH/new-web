import { error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { authorize } from "$lib/utils/authorization";
import apiNames from "$lib/utils/apiNames";
import * as m from "$paraglide/messages";

export const load: PageServerLoad = async ({ locals, params }) => {
  const { prisma, user } = locals;

  if (!user) {
    error(401, m.inventory_errors_unauthorized());
  }

  authorize(apiNames.WEBSHOP.CONSUME, user);

  const consumable = await prisma.consumable.findUnique({
    where: {
      id: params.consumable,
    },
    include: {
      questionResponses: {
        include: {
          question: true,
        },
      },
      shoppable: {
        include: {
          ticket: {
            include: { event: true },
          },
        },
      },
      member: true,
    },
  });

  if (!consumable) {
    error(404, m.inventory_errors_consumableNotFound());
  }

  return {
    consumable: {
      ...consumable,
      shoppable: {
        ...consumable.shoppable,
        ...consumable.shoppable.ticket!,
        event: consumable.shoppable.ticket!.event,
      },
    },
  };
};

export const actions: Actions = {
  consume: async ({ locals, params }) => {
    const { prisma, user } = locals;

    if (!user) {
      error(401, m.inventory_errors_unauthorized());
    }

    authorize(apiNames.WEBSHOP.CONSUME, user);

    const consumable = await prisma.consumable.findUnique({
      where: {
        id: params.consumable,
      },
    });

    if (!consumable) {
      error(404, m.inventory_errors_consumableNotFound());
    }

    if (consumable.consumedAt) {
      error(400, "Ticket has already been consumed");
    }

    if (consumable.shoppableId !== params.slug) {
      error(400, "Ticket is not valid for this event");
    }

    await prisma.consumable.update({
      where: {
        id: params.consumable,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    return { success: true };
  },
};
