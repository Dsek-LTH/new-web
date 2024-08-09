import {
  removeExpiredConsumables,
  withHandledNotificationQueue,
} from "$lib/server/shop/addToCart/reservations";
import authorizedPrismaClient from "$lib/server/shop/authorizedPrisma";
import { calculateCartPrice } from "$lib/server/shop/payments/purchase";
import {
  dbIdentification,
  GRACE_PERIOD_WINDOW,
  type ShopIdentification,
} from "$lib/server/shop/types";
import {
  passOnTransactionFee,
  priceWithTransactionFee,
  transactionFee,
} from "$lib/utils/payments/transactionFee";
import { questionForm } from "$lib/utils/shop/types";
import { PrismaClient, ShoppableType } from "@prisma/client";
import { zod } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms/server";
import { purchaseForm } from "./types";

export const getCart = async (prisma: PrismaClient, id: ShopIdentification) => {
  const now = new Date();
  await withHandledNotificationQueue(
    removeExpiredConsumables(authorizedPrismaClient, now).then(
      (res) => res.queuedNotifications,
    ),
  );
  const inCart = await prisma.consumable.findMany({
    where: {
      ...dbIdentification(id),
      OR: [{ expiresAt: { gt: now } }, { expiresAt: null }],
      purchasedAt: null,
      shoppable: { type: ShoppableType.TICKET },
    },
    include: {
      questionResponses: true,
      shoppable: {
        include: {
          questions: { where: { removedAt: null }, include: { options: true } },
          ticket: {
            include: { event: true },
          },
          _count: {
            select: {
              consumables: {
                where: { purchasedAt: { not: null } },
              },
            },
          },
        },
      },
    },
  });
  const reservations = await prisma.consumableReservation.findMany({
    where: {
      ...dbIdentification(id),
      shoppable: { type: ShoppableType.TICKET },
    },
    include: {
      shoppable: {
        include: {
          ticket: { include: { event: true } },
        },
      },
    },
  });
  return {
    inCart: inCart.map((c) => ({
      ...c,
      shoppable: {
        ...c.shoppable.ticket!,
        ...c.shoppable,
        ticket: undefined,
      },
    })),
    reservations: reservations.map((c) => ({
      ...c,
      shoppable: {
        ...c.shoppable.ticket!,
        ...c.shoppable,
        ticket: undefined,
        gracePeriodEndsAt: new Date(
          c.shoppable.availableFrom.valueOf() + GRACE_PERIOD_WINDOW,
        ),
      },
    })),
  };
};

export const cartLoadFunction = async (
  prisma: PrismaClient,
  identification: ShopIdentification,
) => {
  const { inCart, reservations } = await getCart(prisma, identification);

  const cartPrice = calculateCartPrice(inCart);
  const totalPrice = passOnTransactionFee
    ? priceWithTransactionFee(cartPrice)
    : cartPrice;
  const inCartWithQuestionForms = await Promise.all(
    inCart.map(async (item) => {
      const questions = item.shoppable.questions;
      const answers = item.questionResponses;
      return {
        ...item,
        shoppable: {
          ...item.shoppable,
          questions: await Promise.all(
            questions.map(async (question) => {
              const answer = answers.find((a) => a.questionId === question.id);
              return {
                ...question,
                form: await superValidate(
                  {
                    consumableId: item.id,
                    questionId: question.id,
                    answer: answer?.answer,
                  },
                  zod(questionForm),
                  {
                    errors: false,
                  },
                ),
              };
            }),
          ),
        },
      };
    }),
  );
  return {
    inCart: inCartWithQuestionForms,
    reservations,
    purchaseForm: await superValidate(zod(purchaseForm)),
    totalPrice: totalPrice,
    transactionFee: passOnTransactionFee ? transactionFee(totalPrice) : 0,
  };
};

export type CartItem = Awaited<
  ReturnType<typeof cartLoadFunction>
>["inCart"][number];
export type CartReservation = Awaited<
  ReturnType<typeof cartLoadFunction>
>["reservations"][number];
