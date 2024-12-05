import { PrismaClient, type Member } from "@prisma/client";
import { enhance } from "@zenstackhq/runtime";
import { afterAll, describe, expect, it } from "vitest";
import { getTickets } from "./getTickets";
import {
  addMockTickets,
  addMockUsers,
  removeAllTestData,
  removeMockTickets,
  removeMockUsers,
} from "./mock";
import apiNames from "$lib/utils/apiNames";
import { getDerivedRoles } from "$lib/utils/authorization";
const prisma = new PrismaClient();
const SUITE_PREFIX = "getTickets";

const getTicketsTest = async (
  prismaWithAccess: PrismaClient,
  adminMember: Member,
) => {
  it("should get all tickets", async () => {
    const tickets = await addMockTickets(prisma, adminMember);
    const result = await getTickets(prismaWithAccess, {
      memberId: adminMember.id,
      studentId: adminMember.studentId!,
      roles: getDerivedRoles(undefined, true),
      policies: [],
    });
    const ticketIds = Object.values(tickets).map((t) => t.id);
    const filteredResult = result.filter((t) => ticketIds.includes(t.id));
    expect(filteredResult.length).toBe(6);
    // in order of available from (earliest first)
    expect(filteredResult.map((t) => t.id)).toEqual([
      tickets.pastTicket.id,
      tickets.activeTicket.id,
      tickets.activeTicket2.id,
      tickets.freeActiveTicket.id,
      tickets.activeEarlyTicket.id,
      tickets.upcomingTicket.id,
    ]);
    await removeMockTickets(prisma, ticketIds);
  });
};
describe("Get tickets as logged in user", async () => {
  const users = await addMockUsers(prisma, SUITE_PREFIX);
  const prismaWithAccess = enhance(prisma, {
    user: {
      studentId: users.customerMember.studentId ?? undefined,
      memberId: users.customerMember.id,
      policies: [apiNames.EVENT.READ],
      roles: [],
    },
  });
  afterAll(async () => {
    await removeMockUsers(
      prisma,
      Object.values(users).map((u) => u.id),
    );
  });
  getTicketsTest(prismaWithAccess, users.adminMember);
});
describe("Get tickets as anonymous user", async () => {
  const users = await addMockUsers(prisma, SUITE_PREFIX);
  const prismaWithAccess = enhance(prisma, {
    user: {
      studentId: users.customerMember.studentId ?? undefined,
      memberId: users.customerMember.id,
      policies: [apiNames.EVENT.READ],
      roles: [],
    },
  });
  afterAll(async () => {
    await removeMockUsers(
      prisma,
      Object.values(users).map((u) => u.id),
    );
  });
  getTicketsTest(prismaWithAccess, users.adminMember);
});

afterAll(async () => {
  await removeAllTestData(prisma, SUITE_PREFIX);
  prisma.$disconnect();
});
