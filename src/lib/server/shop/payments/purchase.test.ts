import { addTicketToCart } from "$lib/server/shop/addToCart/addToCart";
import { removeExpiredConsumables } from "$lib/server/shop/addToCart/reservations";
import purchaseCart from "$lib/server/shop/payments/purchase";
import {
  priceWithTransactionFee,
  transactionFee,
} from "$lib/utils/payments/transactionFee";
import {
  onPaymentFailure,
  onPaymentSuccess,
} from "$lib/server/shop/payments/stripeWebhooks";
import { PrismaClient, type Member } from "@prisma/client";
import { enhance, type AuthUser } from "@zenstackhq/runtime";
import type Stripe from "stripe";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  MOCK_ACTIVE_TICKET,
  MOCK_ACTIVE_TICKET_2,
  addMockTickets,
  addMockUsers,
  removeAllTestData,
  removeMockTickets,
  removeMockUsers,
} from "../mock";
import {
  TIME_TO_BUY,
  dbIdentification,
  type ShopIdentification,
} from "../types";
import apiNames from "$lib/utils/apiNames";
import { NotificationType } from "$lib/utils/notifications/types";

const mockFns = vi.hoisted(() => ({
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    del: vi.fn(),
  },
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
}));

/* eslint-disable @typescript-eslint/no-explicit-any -- For mocking*/
vi.mock("./stripe", () => ({
  default: {
    customers: {
      create: (...args: any) => mockFns.customers.create(...args) as unknown,
      retrieve: (...args: any) =>
        mockFns.customers.retrieve(...args) as unknown,
      update: (...args: any) => mockFns.customers.update(...args) as unknown,
      del: (...args: any) => mockFns.customers.del(...args) as unknown,
    },
    paymentIntents: {
      create: (...args: any) =>
        mockFns.paymentIntents.create(...args) as unknown,
      retrieve: (...args: any) =>
        mockFns.paymentIntents.retrieve(...args) as unknown,
      update: (...args: any) =>
        mockFns.paymentIntents.update(...args) as unknown,
      cancel: (...args: any) =>
        mockFns.paymentIntents.cancel(...args) as unknown,
    },
  },
}));
/* eslint-enable @typescript-eslint/no-explicit-any -- End of mocking*/

const prisma = new PrismaClient();

const SUITE_PREFIX = "purchase";

const addPurchaseTestForUser = (
  prismaWithAccess: PrismaClient,
  adminMember: Member,
  user: AuthUser,
  identification: ShopIdentification,
) => {
  beforeEach(async (context) => {
    context.tickets = await addMockTickets(prisma, adminMember);
    await addTicketToCart(
      prismaWithAccess,
      context.tickets.activeTicket.id,
      user,
    ).catch((e) => expect.fail(`Failed to add ticket to cart: ${e}`));

    if (user.memberId) {
      mockFns.customers.create.mockResolvedValue({
        id: "customer-id",
      });
      mockFns.customers.retrieve.mockResolvedValue({
        deleted: false,
        id: "customer-id",
      });
    }
    mockFns.paymentIntents.create.mockResolvedValue({
      client_secret: "abc",
      id: "intent-id",
    });
    mockFns.paymentIntents.retrieve.mockResolvedValue({
      id: "intent-id",
      status: "requires_payment_method",
    });
  });

  afterEach(async ({ tickets }) => {
    const ticketIds = Object.values(tickets).map((t) => t.id);
    await removeMockTickets(prisma, ticketIds).catch(() =>
      expect.fail("Failed to remove tickets"),
    );
    vi.clearAllMocks();
    if (user.memberId) {
      await prisma.member.update({
        where: {
          id: user.memberId,
        },
        data: {
          stripeCustomerId: null,
        },
      });
    }
  });

  it("mocks stripe correctly", async () => {
    const { default: stripe } = await import("./stripe");
    const customer = await stripe.customers.retrieve("customer-id");
    expect(customer).toBeDefined();
    expect(customer.id).toBe("customer-id");
    expect(mockFns.customers.retrieve).toHaveBeenCalledOnce();
    mockFns.customers.retrieve.mockClear();
    mockFns.customers.retrieve.mockResolvedValueOnce(false);
    const customer2 = await stripe.customers.retrieve("customer-id");
    expect(customer2).toBe(false);
    expect(mockFns.customers.retrieve).toHaveBeenCalledOnce();
  });

  it("calculates transaction fee correctly", () => {
    const price = 10000;
    const priceWithFee = priceWithTransactionFee(price);
    const fee = transactionFee(priceWithFee);
    expect(fee).toBeLessThan(price * 0.1); // at most 10% fee is reasonable
    expect(priceWithFee).toBe(price + fee);
  });

  it("doesn't create intent for empty cart", async ({ tickets }) => {
    await prisma.consumable.deleteMany({
      where: {
        ...dbIdentification(identification),
        shoppableId: tickets.activeTicket.id,
      },
    });
    await expect(
      purchaseCart(prismaWithAccess, identification, "idempotency-key"),
      "should not purchase empty cart",
    ).rejects.toThrow();
  });
  it("creates a payment intent", async () => {
    const res = await purchaseCart(
      prismaWithAccess,
      identification,
      "idempotency-key",
    );
    expect(res).toBeDefined();
    expect(res.clientSecret).toBe("abc");
    expect(mockFns.paymentIntents.create).toHaveBeenCalledOnce();
    expect(mockFns.paymentIntents.create.mock.calls[0]?.[0].amount).toBe(
      MOCK_ACTIVE_TICKET.shoppable.price,
    );

    expect(
      mockFns.paymentIntents.create.mock.calls[0]?.[1].idempotencyKey,
    ).toBe("idempotency-key");
    const consumable = await prisma.consumable.findFirst({
      where: {
        ...dbIdentification(identification),
        purchasedAt: null,
      },
    });
    expect(consumable).toBeDefined();
    expect(consumable!.stripeIntentId).toBe("intent-id");
  });

  it("updates old payment intent on multiple calls", async ({ tickets }) => {
    try {
      await purchaseCart(prismaWithAccess, identification, "idempotency-key");
    } catch (err) {
      expect.fail(`Failed to purchase cart ${err}`);
    }
    mockFns.paymentIntents.update.mockResolvedValueOnce({
      client_secret: "def",
      id: "intent-id",
    });
    mockFns.paymentIntents.retrieve.mockResolvedValueOnce({
      status: "requires_payment_method",
      id: "intent-id",
    });
    const res2 = await purchaseCart(
      prismaWithAccess,
      identification,
      "idempotency-key",
    );
    expect(res2).toBeDefined();
    expect(res2.clientSecret, res2.message).toBe("def");
    expect(mockFns.paymentIntents.create).toHaveBeenCalledOnce();
    expect(mockFns.paymentIntents.update).toHaveBeenCalledOnce();
    expect(mockFns.paymentIntents.retrieve).toHaveBeenCalledOnce();
    expect(mockFns.paymentIntents.cancel).not.toHaveBeenCalled();
    expect(mockFns.paymentIntents.update.mock.calls[0]?.[0]).toBe("intent-id");
    expect(mockFns.paymentIntents.update.mock.calls[0]?.[1].amount).toBe(
      MOCK_ACTIVE_TICKET.shoppable.price,
    );

    await addTicketToCart(
      prismaWithAccess,
      tickets.activeTicket2.id,
      user,
    ).catch(() => expect.fail("Failed to add ticket to cart"));

    vi.clearAllMocks();
    mockFns.paymentIntents.update.mockResolvedValueOnce({
      client_secret: "ghi",
      id: "intent-id",
    });
    mockFns.paymentIntents.retrieve.mockResolvedValueOnce({
      status: "requires_payment_method",
      id: "intent-id",
    });
    await purchaseCart(prismaWithAccess, identification, "idempotency-key");

    expect(mockFns.paymentIntents.create).not.toHaveBeenCalled();
    expect(mockFns.paymentIntents.update).toHaveBeenCalledOnce();
    expect(mockFns.paymentIntents.retrieve).toHaveBeenCalledOnce();
    expect(mockFns.paymentIntents.cancel).not.toHaveBeenCalled();
    expect(mockFns.paymentIntents.update.mock.calls[0]?.[1].amount).toBe(
      MOCK_ACTIVE_TICKET.shoppable.price + MOCK_ACTIVE_TICKET_2.shoppable.price,
    );

    const consumables = await prisma.consumable.findMany({
      where: {
        ...dbIdentification(identification),
        OR: [
          { shoppableId: tickets.activeTicket.id },
          { shoppableId: tickets.activeTicket2.id },
        ],
        purchasedAt: null,
      },
    });
    expect(consumables).toBeDefined();
    expect(consumables.length).toBe(2);
    expect(consumables[0]!.stripeIntentId).toBe("intent-id");
    expect(consumables[1]!.stripeIntentId).toBe("intent-id");
  });

  it("creates a payment intent with multiple items", async ({ tickets }) => {
    await addTicketToCart(prismaWithAccess, tickets.activeTicket2.id, user);
    await purchaseCart(prismaWithAccess, identification, "idempotency-key");
    expect(mockFns.paymentIntents.create).toHaveBeenCalledOnce();
    const price =
      MOCK_ACTIVE_TICKET.shoppable.price + MOCK_ACTIVE_TICKET_2.shoppable.price;
    expect(mockFns.paymentIntents.create.mock.calls[0]?.[0].amount).toBe(price);

    expect(
      mockFns.paymentIntents.create.mock.calls[0]?.[1].idempotencyKey,
    ).toBe("idempotency-key");
    const consumables = await prisma.consumable.findMany({
      where: {
        ...dbIdentification(identification),
        purchasedAt: null,
        stripeIntentId: "intent-id",
        shoppableId: {
          in: [tickets.activeTicket.id, tickets.activeTicket2.id],
        },
      },
    });
    expect(consumables).toBeDefined();
    expect(consumables.length).toBe(2);
  });

  it("marks a free item as purchased without stripe", async ({ tickets }) => {
    const updatedShoppable = await prisma.shoppable.update({
      where: {
        id: tickets.activeTicket.id,
        consumables: {
          some: {
            ...dbIdentification(identification),
          },
        },
      },
      data: {
        price: 0,
      },
    });
    expect(updatedShoppable).toBeDefined();
    expect(updatedShoppable.price).toBe(0);
    const before = new Date();
    const res = await purchaseCart(
      prismaWithAccess,
      identification,
      "idempotency-key",
    );
    expect(res).toBeDefined();
    expect(res.clientSecret).toBeUndefined();
    const consumables = await prisma.consumable.findMany({
      where: {
        ...dbIdentification(identification),
        purchasedAt: {
          not: null,
        },
        shoppableId: {
          in: [tickets.activeTicket.id, tickets.activeTicket2.id],
        },
      },
    });
    expect(consumables.length).toBe(1);
    expect(consumables[0]!.stripeIntentId).toBeNull();
    expect(consumables[0]!.purchasedAt!.valueOf()).toBeGreaterThanOrEqual(
      before.valueOf(),
    );
  });

  it("marks as purchased after purchase", async ({ tickets }) => {
    const intent = {
      client_secret: "abc",
      id: "intent-id-purchase-test-2",
      status: "payment_method_required",
    };

    mockFns.paymentIntents.create.mockResolvedValueOnce(intent);
    await purchaseCart(prismaWithAccess, identification, "idempotency-key");
    const before = new Date();
    await onPaymentSuccess({
      id: intent.id,
      status: "succeeded",
    } as unknown as Stripe.PaymentIntent);

    const consumables = await prisma.consumable.findMany({
      where: {
        ...dbIdentification(identification),
        purchasedAt: {
          not: null,
        },
        stripeIntentId: intent.id,
        shoppableId: {
          in: [tickets.activeTicket.id, tickets.activeTicket2.id],
        },
      },
    });
    expect(consumables.length).toBe(1);
    expect(consumables[0]!.purchasedAt).toBeDefined();
    expect(consumables[0]!.purchasedAt?.valueOf()).toBeGreaterThanOrEqual(
      before.valueOf(),
    );
  });

  it("doesn't purchase expired consumable", async ({ tickets }) => {
    await prisma.consumable.updateMany({
      where: {
        ...dbIdentification(identification),
        shoppableId: tickets.activeTicket.id,
      },
      data: {
        expiresAt: new Date(Date.now() - 1000), // set consumable to expired
      },
    });

    await expect(
      purchaseCart(prismaWithAccess, identification, "idempotency-key"),
      "should not allow purchase of expired consumable",
    ).rejects.toThrow();
  });

  describe("expiration during payment", async () => {
    const intent = {
      client_secret: "abc",
      id: "intent-id-purchase-test-3",
      status: "payment_method_required",
    };
    let ticketId: string;
    const expectConsumableCount = async (
      count: number,
      message: string,
      purchased = false,
    ) => {
      const consumables = await prisma.consumable.findMany({
        where: {
          ...dbIdentification(identification),
          shoppableId: ticketId,
        },
      });
      expect(consumables.length, message).toBe(count);
      if (count !== 0) {
        if (purchased)
          expect(consumables[0]!.purchasedAt, message).toBeDefined();
        else expect(consumables[0]!.purchasedAt, message).toBeNull();
      }
    };
    beforeEach(async ({ tickets }) => {
      ticketId = tickets.activeTicket.id;

      mockFns.paymentIntents.create.mockResolvedValueOnce(intent);
      vi.useFakeTimers();
      vi.setSystemTime(vi.getRealSystemTime());
      await prisma.consumable.updateMany({
        where: {
          ...dbIdentification(identification),
          shoppableId: ticketId,
        },
        data: {
          expiresAt: new Date(Date.now() + TIME_TO_BUY), // set it from now
        },
      });
      await purchaseCart(prismaWithAccess, identification, "idempotency-key");
      vi.setSystemTime(vi.getMockedSystemTime()!.valueOf() + 2000); // 2 seconds later
      const queuedNotifications = await removeExpiredConsumables(
        prisma,
        new Date(),
      ).then((res) => res.queuedNotifications); // should NOT remove the consumable
      expect(
        queuedNotifications.length,
        JSON.stringify(queuedNotifications),
      ).toBe(0);
      await expectConsumableCount(
        1,
        "payment in progress should not be expired",
      );
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("doesn't expire a purchase in-progress", async () => {
      await onPaymentSuccess({
        id: intent.id,
        status: "succeeded",
      } as unknown as Stripe.PaymentIntent);
      await expectConsumableCount(
        1,
        "consumable after payment should exist",
        true,
      );

      vi.setSystemTime(vi.getMockedSystemTime()!.valueOf() + TIME_TO_BUY);
      const queuedNotifications = await removeExpiredConsumables(
        prisma,
        new Date(),
      ).then((res) => res.queuedNotifications); // should NOT remove the consumable
      expect(queuedNotifications.length).toBe(0);
      await expectConsumableCount(
        1,
        "consumable should not be expired after payment",
        true,
      );
    });

    it("does expire a purchase after failed attempt", async () => {
      await onPaymentFailure({
        id: intent.id,
        status: "payment_method_required",
      } as unknown as Stripe.PaymentIntent);
      await expectConsumableCount(
        1,
        "consumable after failed payment should exist",
      );

      vi.setSystemTime(vi.getMockedSystemTime()!.valueOf() + TIME_TO_BUY); // 2 seconds later

      const queuedNotfications = await removeExpiredConsumables(
        prisma,
        new Date(),
      ).then((res) => res.queuedNotifications); // SHOULD remove the consumable
      expect(queuedNotfications.length).toBe(1);
      expect(queuedNotfications[0]?.type).toBe(
        NotificationType.PURCHASE_CONSUMABLE_EXPIRED,
      );
      if (user.memberId) {
        expect(queuedNotfications[0]!.memberIds!.length).toBe(1);
      } else {
        expect(queuedNotfications[0]!.memberIds!.length).toBe(0);
      }
      await expectConsumableCount(
        0,
        "consumable should be expired after failed payment",
      );
    });
  });

  describe("webhooks", () => {
    it("handles failed payment", async ({ tickets }) => {
      const intent = {
        client_secret: "abc",
        id: "intent-id-purchase-test-1",
        status: "payment_method_required",
      };

      mockFns.paymentIntents.create.mockResolvedValueOnce(intent);
      await purchaseCart(prismaWithAccess, identification, "idempotency-key");
      await onPaymentFailure({
        id: intent.id,
        status: "requires_payment_method",
      } as unknown as Stripe.PaymentIntent);
      const consumables = await prisma.consumable.findMany({
        where: {
          ...dbIdentification(identification),
          shoppableId: {
            in: [tickets.activeTicket.id, tickets.activeTicket2.id],
          },
        },
      });
      expect(consumables.length).toBe(1);
      expect(consumables[0]!.purchasedAt).toBeNull();
    });

    it("throw error if stripe webhook towards nonexisting intent", async () => {
      await expect(
        onPaymentSuccess({
          id: "non-existing-intent-1",
          status: "succeeded",
        } as unknown as Stripe.PaymentIntent),
        "no error on success on non-existing intent",
      ).rejects.toThrow();

      await expect(
        onPaymentFailure({
          id: "non-existing-intent-2",
          status: "succeeded",
        } as unknown as Stripe.PaymentIntent),
        "no error on failure on non-existing intent",
      ).rejects.toThrow();
    });
  });

  describe("stripe customer creation", () => {
    if (user.memberId) {
      it("creates a stripe customer if no stripe is in db", async () => {
        await purchaseCart(prismaWithAccess, identification, "idempotency-key");
        expect(mockFns.customers.retrieve).not.toHaveBeenCalled();
        expect(mockFns.customers.create).toHaveBeenCalledOnce();
      });

      it("creates a stripe customer if not found in stripe", async () => {
        await prisma.member.update({
          where: {
            id: user.memberId,
          },
          data: {
            stripeCustomerId: "customer-id",
          },
        });
        mockFns.customers.retrieve.mockRejectedValueOnce(
          new Error("Customer not found"),
        );
        await purchaseCart(prismaWithAccess, identification, "idempotency-key");
        expect(mockFns.customers.create).toHaveBeenCalledOnce();
        expect(mockFns.customers.retrieve).toHaveBeenCalledOnce();
      });

      it("does not create a stripe customer if found in stripe", async () => {
        await prisma.member.update({
          where: {
            id: user.memberId,
          },
          data: {
            stripeCustomerId: "customer-id",
          },
        });
        await purchaseCart(prismaWithAccess, identification, "idempotency-key");
        expect(mockFns.customers.create).not.toHaveBeenCalled();
        expect(mockFns.customers.retrieve).toHaveBeenCalledOnce();
      });
    } else {
      it("does not create a stripe customer if not logged in", async () => {
        await purchaseCart(prismaWithAccess, identification, "idempotency-key");
        expect(mockFns.customers.create).not.toHaveBeenCalled();
        expect(mockFns.customers.retrieve).not.toHaveBeenCalled();
      });
    }
  });
};

describe("Purchase as logged in user", async () => {
  const users = await addMockUsers(prisma, SUITE_PREFIX);

  const prismaWithAccess = enhance(prisma, {
    user: {
      studentId: users.customerMember.studentId ?? undefined,
      memberId: users.customerMember.id,
      policies: [apiNames.EVENT.READ, apiNames.MEMBER.READ],
      roles: [],
    },
  });
  addPurchaseTestForUser(
    prismaWithAccess,
    users.adminMember,
    {
      memberId: users.customerMember.id,
      studentId: users.customerMember.studentId!,
      roles: [],
      policies: ["*", "_"],
    },
    {
      memberId: users.customerMember.id,
    },
  );

  afterAll(async () => {
    await removeMockUsers(
      prisma,
      Object.values(users).map((u) => u.id),
    );
  });
});
describe("Purchase as anonymous user", async () => {
  const users = await addMockUsers(prisma, SUITE_PREFIX);

  const prismaWithAccess = enhance(prisma, {
    user: {
      studentId: undefined,
      memberId: undefined,
      policies: [],
      roles: [],
      externalCode: SUITE_PREFIX + "external-code",
    },
  });
  addPurchaseTestForUser(
    prismaWithAccess,
    users.adminMember,
    {
      studentId: undefined,
      memberId: undefined,
      policies: [],
      roles: [],
      externalCode: SUITE_PREFIX + "external-code",
    },
    {
      externalCode: SUITE_PREFIX + "external-code",
    },
  );
  afterAll(async () => {
    await removeMockUsers(
      prisma,
      Object.values(users).map((u) => u.id),
    );
  });
});

afterAll(async () => {
  await removeAllTestData(prisma, SUITE_PREFIX);
  prisma.$disconnect();
});
