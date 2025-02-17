import { env } from "$env/dynamic/public";
import {
  moveQueueToCart,
  withHandledNotificationQueue,
} from "$lib/server/shop/addToCart/reservations";
import authorizedPrismaClient from "$lib/server/authorizedPrisma";
import { refundConsumable } from "$lib/server/shop/payments/stripeMethods";
import type { Event, ItemQuestion, Shoppable, Ticket } from "@prisma/client";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { message, superValidate } from "sveltekit-superforms/server";
import { z } from "zod";
import { loadTicketData } from "./loadTicketData";
import { consumeConsumable } from "$lib/server/shop/consumable";

export type ManagedTicket = Ticket &
  Shoppable & {
    questions: ItemQuestion[];
    event: Event;
  };

export const load = async ({ locals, params }) => {
  const { user, prisma } = locals;

  const { ticket, consumables } = await loadTicketData(
    prisma,
    user,
    params.slug,
  );
  const purchasedConsumables = consumables.filter(
    (c) => c.purchasedAt !== null,
  );
  const consumablesInCart = consumables.filter((c) => c.purchasedAt === null);
  const reservations = ticket.shoppable.reservations;
  // Typing just so we can remove consumables and reservations from shoppable
  const shoppable: Omit<Shoppable, "consumables" | "reservations"> & {
    consumables?: unknown;
    reservations?: unknown;
  } = ticket.shoppable;
  delete shoppable.consumables;
  delete shoppable.reservations;
  const mergedTicket: ManagedTicket & {
    shoppable?: unknown;
  } = {
    ...ticket.shoppable,
    ...ticket,
  };
  delete mergedTicket.shoppable;

  const isStripeTestEnvironment = env.PUBLIC_STRIPE_KEY.startsWith("pk_test");
  const stripeIntentBaseUrl = isStripeTestEnvironment
    ? "https://dashboard.stripe.com/test/payments"
    : "https://dashboard.stripe.com/payments";
  return {
    ticket: mergedTicket as ManagedTicket,
    purchasedConsumables,
    consumablesInCart,
    reservations,
    stripeIntentBaseUrl, // referenced directly in ConsumableRow.svelte
  };
};

export const actions = {
  consume: async ({ locals, request }) => {
    const { prisma } = locals;
    const form = await superValidate(
      request,
      zod(z.object({ consumableId: z.string() })),
    );
    if (!form.valid) return fail(400, { form });
    const consumeMessage = await consumeConsumable(
      prisma,
      form.data.consumableId,
    );
    return message(form, consumeMessage);
  },
  unconsume: async ({ locals, request, params }) => {
    const { prisma } = locals;
    const form = await superValidate(
      request,
      zod(z.object({ consumableId: z.string() })),
    );
    if (!form.valid) return fail(400, { form });
    try {
      await prisma.consumable.update({
        where: {
          id: form.data.consumableId,
          shoppableId: params.slug,
        },
        data: {
          consumedAt: null,
        },
      });
    } catch (e) {
      if (e instanceof Error)
        return message(form, {
          message: e.message,
          type: "error",
        });
      return message(form, {
        message: "Kunde inte avkonsumera biljetten.",
        type: "error",
      });
    }
    return message(form, {
      message: "Biljetten har avkonsumerats.",
      type: "success",
    });
  },
  refund: async ({ locals, request, params }) => {
    const { prisma } = locals;
    const form = await superValidate(
      request,
      zod(z.object({ consumableId: z.string() })),
    );
    if (!form.valid) return fail(400, { form });
    try {
      const consumable = await prisma.consumable.findUnique({
        where: {
          id: form.data.consumableId,
          shoppableId: params.slug,
        },
        include: {
          shoppable: true,
        },
      });
      if (!consumable) {
        return message(form, {
          message: "Biljetten hittades inte.",
          type: "error",
        });
      }
      if (consumable.stripeIntentId) {
        await refundConsumable(
          consumable.stripeIntentId,
          consumable.priceAtPurchase ?? consumable.shoppable.price, // to ensure correct refund amount if shoppable price has changed
        );
      }
      await authorizedPrismaClient.consumable.delete({
        where: {
          id: consumable.id,
        },
      });
      await withHandledNotificationQueue(
        moveQueueToCart(
          authorizedPrismaClient,
          consumable.shoppableId,
          1,
          true,
        ),
      );

      return message(form, {
        message: "Biljetten har återbetalats.",
        type: "success",
      });
    } catch (e) {
      if (e instanceof Error)
        return message(form, {
          message: e.message,
          type: "error",
        });
      return message(form, {
        message: "Kunde inte återbetala biljetten.",
        type: "error",
      });
    }
  },
};
