import { PrismaClient, type Member } from "@prisma/client";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { GRACE_PERIOD_WINDOW } from "../types";
import { AddToCartStatus, addTicketToCart } from "./addToCart";

import { getDerivedRoles } from "$lib/utils/authorization";
import { NotificationType } from "$lib/utils/notifications/types";
import { enhance, type AuthUser } from "@zenstackhq/runtime";
import { getAccessPolicies } from "../../../../hooks.server.helpers";
import {
  addMockTickets,
  addMockUser,
  addMockUsers,
  removeAllTestData,
  removeMockTickets,
  removeMockUsers,
} from "../mock";
import { performLotteryIfNecessary } from "./reservations";
const prisma = new PrismaClient();

const SUITE_PREFIX = "addToCart";

const expectConsumableCount = async (shoppableId: string, count: number) =>
  expect(
    (
      await prisma.consumable.findMany({
        where: {
          shoppableId: shoppableId,
        },
      })
    ).length,
  ).toBe(count);
const expectReservationCount = async (shoppableId: string, count: number) =>
  expect(
    (
      await prisma.consumableReservation.findMany({
        where: {
          shoppableId: shoppableId,
        },
      })
    ).length,
  ).toBe(count);

const addTicketsTestForUser = (
  prismaWithAccess: PrismaClient,
  adminMember: Member,
  user: AuthUser,
) => {
  beforeEach(async (context) => {
    context.tickets = await addMockTickets(prisma, adminMember);
  });
  afterEach(async ({ tickets }) => {
    const ticketIds = Object.values(tickets).map((t) => t.id);
    await removeMockTickets(prisma, ticketIds);
  });

  describe("post-grace, no queue", () => {
    it("adds a valid ticket request", async ({ tickets }) => {
      const ticket = tickets.activeTicket;
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      const consumables = await prisma.consumable.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(consumables.length).toBe(1);
      expect(consumables[0]).toBeDefined();
      expect(consumables[0]!.memberId).toBe(user.memberId ?? null);
      expect(consumables[0]!.externalCustomerCode).toBe(
        user.externalCode ?? null,
      );
      expect(consumables[0]!.shoppableId).toBe(ticket.id);
      expect(consumables[0]!.purchasedAt).toBeNull();
      expect(consumables[0]!.externalCustomerEmail).toBeNull();
      expect(consumables[0]!.consumedAt).toBeNull();
    });
    it("doesn't add a ticket twice to cart", async ({ tickets }) => {
      const ticket = tickets.activeTicket;
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      await expect(
        addTicketToCart(prismaWithAccess, ticket.id, user),
        "Second call should fail",
      ).rejects.toThrow();
      await expectConsumableCount(ticket.id, 1);
      await expectReservationCount(ticket.id, 0);
    });
    it("doesn't add an upcoming ticket to cart", async ({ tickets }) => {
      const ticket = tickets.upcomingTicket;
      await expect(
        addTicketToCart(prismaWithAccess, ticket.id, user),
      ).rejects.toThrow();
      await expectConsumableCount(ticket.id, 0);
      await expectReservationCount(ticket.id, 0);
    });
    it("doesn't add a past ticket to cart", async ({ tickets }) => {
      const ticket = tickets.pastTicket;
      await expect(
        addTicketToCart(prismaWithAccess, ticket.id, user),
      ).rejects.toThrow();
      await expectConsumableCount(ticket.id, 0);
      await expectReservationCount(ticket.id, 0);
    });
    it("purchases free item immidiately", async ({ tickets }) => {
      const ticket = tickets.freeActiveTicket;
      const before = new Date();
      const result = await addTicketToCart(prismaWithAccess, ticket.id, user);
      expect(result.status).toBe(AddToCartStatus.AddedToInventory);
      const consumables = await prisma.consumable.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(consumables.length).toBe(1);
      expect(consumables[0]).toBeDefined();
      expect(consumables[0]!.memberId).toBe(user.memberId ?? null);
      expect(consumables[0]!.externalCustomerCode).toBe(
        user.externalCode ?? null,
      );
      expect(consumables[0]!.purchasedAt?.valueOf()).toBeGreaterThanOrEqual(
        before.valueOf(),
      );
    });
  });

  describe("during grace period", () => {
    it("reserves a ticket", async ({ tickets }) => {
      const ticket = tickets.activeEarlyTicket;
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      const consumables = await prisma.consumable.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(consumables.length).toBe(0);
      const reservations = await prisma.consumableReservation.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(reservations.length).toBe(1);
      expect(reservations[0]).toBeDefined();
      expect(reservations[0]!.memberId).toBe(user.memberId ?? null);
      expect(reservations[0]!.externalCustomerCode).toBe(
        user.externalCode ?? null,
      );
      expect(reservations[0]!.shoppableId).toBe(ticket.id);
      expect(reservations[0]?.order).toBeNull();
    });
    it("doesn't reserve twice", async ({ tickets }) => {
      const ticket = tickets.activeEarlyTicket;
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      await expect(
        addTicketToCart(prismaWithAccess, ticket.id, user),
      ).rejects.toThrow();
      await expectReservationCount(ticket.id, 1);
    });
  });

  describe("post-grace, with items in other's carts", () => {
    beforeEach(async ({ tickets }) => {
      const ticket = tickets.activeTicket;
      await prisma.consumable.createMany({
        data: [
          ...new Array(5).fill(0).map(() => ({
            shoppableId: ticket.id,
            memberId: adminMember.id, // duplicates, but that's fine
            purchasedAt: new Date(),
          })),
          ...new Array(5).fill(0).map(() => ({
            shoppableId: ticket.id,
            memberId: adminMember.id, // duplicates, but that's fine
          })),
        ],
      });
    });

    it("adds reservation if all available tickets are in cart(s)", async ({
      tickets,
    }) => {
      const ticket = tickets.activeTicket;
      expect(
        (
          await prisma.consumable.findMany({
            where: {
              shoppableId: ticket.id,
            },
          })
        ).length,
      ).toBe(10);
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      expect(
        (
          await prisma.consumable.findMany({
            where: {
              shoppableId: ticket.id,
            },
          })
        ).length,
      ).toBe(10);
      const reservations = await prisma.consumableReservation.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(reservations.length).toBe(1);
      expect(reservations[0]?.memberId).toBe(user.memberId ?? null);
      expect(reservations[0]?.externalCustomerCode).toBe(
        user.externalCode ?? null,
      );
      expect(reservations[0]?.shoppableId).toBe(ticket.id);
      expect(reservations[0]?.order).toBe(0);
    });

    it("doesn't add sold out ticket", async ({ tickets }) => {
      const ticket = tickets.activeTicket;
      await prisma.consumable.updateMany({
        where: {
          shoppableId: ticket.id,
          memberId: adminMember.id, // duplicates, but that's fine
        },
        data: {
          purchasedAt: new Date(),
        },
      });
      await expectConsumableCount(ticket.id, 10);
      await expect(
        addTicketToCart(prismaWithAccess, ticket.id, user),
      ).rejects.toThrow();
      await expectConsumableCount(ticket.id, 10);
      await expectReservationCount(ticket.id, 0);
    });

    it("expires un-purchased consumables", async ({ tickets }) => {
      const ticket = tickets.activeTicket;
      await prisma.consumable.updateMany({
        where: {
          shoppableId: ticket.id,
        },
        data: {
          expiresAt: new Date(Date.now() - 1000),
        },
      });
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      const consumables = await prisma.consumable.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(consumables.length).toBe(6);
      expect(
        consumables.filter((c) => c.memberId === adminMember.id).length,
      ).toBe(5); // purchased ones left
      expect(
        (
          await prisma.consumableReservation.findMany({
            where: {
              shoppableId: ticket.id,
            },
          })
        ).length,
      ).toBe(0);
    });
  });
  describe("post-grace, with queue", () => {
    beforeEach(async ({ tickets }) => {
      const ticket = tickets.activeTicket;
      await prisma.consumable.createMany({
        data: [
          ...new Array(5).fill(0).map(() => ({
            shoppableId: ticket.id,
            memberId: adminMember.id, // duplicates, but that's fine
            purchasedAt: new Date(),
          })),
          ...new Array(5).fill(0).map(() => ({
            shoppableId: ticket.id,
            memberId: adminMember.id, // duplicates, but that's fine
          })),
        ],
      });
      await prisma.consumableReservation.create({
        data: {
          shoppableId: ticket.id,
          memberId: adminMember.id,
          order: 0,
        },
      });
    });
    it("places new reservation last after initial lottery", async ({
      tickets,
    }) => {
      const ticket = tickets.activeTicket;
      expect(
        (
          await prisma.consumable.findMany({
            where: {
              shoppableId: ticket.id,
            },
          })
        ).length,
      ).toBe(10);
      await addTicketToCart(prismaWithAccess, ticket.id, user);
      expect(
        (
          await prisma.consumable.findMany({
            where: {
              shoppableId: ticket.id,
            },
          })
        ).length,
      ).toBe(10);
      const reservations = await prisma.consumableReservation.findMany({
        where: {
          shoppableId: ticket.id,
        },
      });
      expect(reservations.length).toBe(2);
      expect(reservations[0]?.memberId).toBe(adminMember.id);
      expect(reservations[0]?.order).toBe(0);
      expect(reservations[1]?.memberId).toBe(user.memberId ?? null);
      expect(reservations[1]?.externalCustomerCode).toBe(
        user.externalCode ?? null,
      );
      expect(reservations[1]?.shoppableId).toBe(ticket.id);
      expect(reservations[1]?.order).toBe(1);
    });
  });

  describe("right after grace period", () => {
    beforeEach(async ({ tickets }) => {
      const start = tickets.activeEarlyTicket.shoppable.availableFrom;
      vi.useFakeTimers();
      vi.setSystemTime(start);
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    it("performs lottery after grace period", async ({ tickets }) => {
      const ticket = tickets.activeEarlyTicket;
      const first = await addTicketToCart(prismaWithAccess, ticket.id, user);
      expect(first.status).toBe(AddToCartStatus.Reserved);
      vi.advanceTimersByTime(GRACE_PERIOD_WINDOW / 2);
      vi.setSystemTime(
        vi.getMockedSystemTime()!.valueOf() + GRACE_PERIOD_WINDOW / 2,
      );
      await expect(
        addTicketToCart(prismaWithAccess, ticket.id, user),
      ).rejects.toThrow();
      await expectConsumableCount(ticket.id, 0);
      await expectReservationCount(ticket.id, 1);

      vi.advanceTimersByTime(GRACE_PERIOD_WINDOW / 2);
      const timeAfter =
        vi.getMockedSystemTime()!.valueOf() + GRACE_PERIOD_WINDOW / 2;
      vi.setSystemTime(timeAfter);
      vi.useRealTimers();
      vi.setSystemTime(timeAfter);
      let count = 0;
      while (
        (
          await prisma.consumableReservation.findMany({
            where: {
              shoppableId: ticket.id,
            },
          })
        ).length > 0
      ) {
        ++count;
        if (++count > 100) {
          expect.fail("Took too long to perform lottery");
        }
        await new Promise((resolve) => setTimeout(resolve, 10)); // to allow for the transaction to finish
      }
      await expectReservationCount(ticket.id, 0);
      await expectConsumableCount(ticket.id, 1);
    });

    it("ensures users adding after grace period are placed last", async ({
      tickets,
    }) => {
      const ticket = tickets.activeEarlyTicket;
      for (let i = 0; i < ticket.stock + 5; i++) {
        const newMember = await addMockUser(prisma, SUITE_PREFIX);
        await addTicketToCart(prisma, ticket.id, {
          memberId: newMember.id,
          studentId: newMember.studentId!,
          roles: [],
          policies: ["*", "_"],
        });
      }
      await expectConsumableCount(ticket.id, 0);
      await expectReservationCount(ticket.id, ticket.stock + 5);

      vi.setSystemTime(
        vi.getMockedSystemTime()!.valueOf() + GRACE_PERIOD_WINDOW,
      );
      const queuedNotifications = await performLotteryIfNecessary(
        prisma,
        new Date(),
        ticket.id,
      );
      expect(queuedNotifications.length).toBe(2); // one for winners, one for losers
      expect(queuedNotifications[0]?.type).toBe(
        NotificationType.PURCHASE_TIME_TO_BUY,
      );
      expect(queuedNotifications[1]?.type).toBe(
        NotificationType.PURCHASE_IN_QUEUE,
      );
      expect(queuedNotifications[0]!.memberIds!.length).toBeGreaterThan(0);
      expect(queuedNotifications[1]!.memberIds!.length).toBeGreaterThan(0);
      await expectConsumableCount(ticket.id, ticket.stock);
      await expectReservationCount(ticket.id, 5);
      const result = await addTicketToCart(prismaWithAccess, ticket.id, user);
      expect(result.status).toBe(AddToCartStatus.PutInQueue);
      if (result.status === AddToCartStatus.PutInQueue)
        // if statement for typescript
        expect(result.queuePosition).toBe(6); // tell user they are in position 6
      await expectConsumableCount(ticket.id, ticket.stock);
      await expectReservationCount(ticket.id, 6);
      const reservations = await prisma.consumableReservation.findMany({
        where: {
          shoppableId: ticket.id,
          order: {
            not: null,
          },
        },
        orderBy: {
          order: "asc",
        },
      });
      expect(reservations.length).toBe(6);
      expect(reservations[5]?.order).toBe(5);
      expect(reservations[5]?.memberId).toBe(user.memberId ?? null);
      expect(reservations[5]?.externalCustomerCode).toBe(
        user.externalCode ?? null,
      );
    });
  });
};

describe("Add to cart as logged in user", async () => {
  const users = await addMockUsers(prisma, SUITE_PREFIX);
  afterAll(async () => {
    await removeMockUsers(
      prisma,
      Object.values(users).map((u) => u.id),
    );
  });

  const roles = getDerivedRoles(undefined, !!users.customerMember.studentId);
  const prismaWithAccess = enhance(prisma, {
    user: {
      studentId: users.customerMember.studentId ?? undefined,
      memberId: users.customerMember.id,
      policies: await getAccessPolicies(
        prisma,
        roles,
        users.customerMember.studentId!,
      ),
      roles: [],
    },
  });
  addTicketsTestForUser(prismaWithAccess, users.adminMember, {
    memberId: users.customerMember.id,
    studentId: users.customerMember.studentId!,
    policies: [],
    roles: [],
  });
});
describe("Add to cart as anonymous user", async () => {
  const users = await addMockUsers(prisma, SUITE_PREFIX);
  afterAll(async () => {
    await removeMockUsers(
      prisma,
      Object.values(users).map((u) => u.id),
    );
  });

  const prismaWithAccess = enhance(prisma, {
    user: {
      studentId: undefined,
      memberId: undefined,
      policies: [],
      externalCode: SUITE_PREFIX + "external-code",
      roles: [],
    },
  });
  addTicketsTestForUser(prismaWithAccess, users.adminMember, {
    externalCode: SUITE_PREFIX + "external-code",
    policies: [],
    roles: [],
  });
});

afterAll(async () => {
  await removeAllTestData(prisma, SUITE_PREFIX);
  prisma.$disconnect();
});
