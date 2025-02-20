import KcAdminClient from "@keycloak/keycloak-admin-client";
import { env } from "$env/dynamic/private";
import type { PrismaClient } from "@prisma/client";
import { error } from "@sveltejs/kit";
import { promiseAllInBatches } from "$lib/utils/batch";

const KEYCLOAK_BOARD_GROUP = "dsek.styr";

const enabled = env.KEYCLOAK_ENABLED === "true";

async function connect(): Promise<KcAdminClient> {
  const kcAdminClient = new KcAdminClient({
    baseUrl: env.KEYCLOAK_ENDPOINT || "",
    realmName: "master",
  });

  await kcAdminClient.auth({
    username: env.KEYCLOAK_ADMIN_USERNAME || "",
    password: env.KEYCLOAK_ADMIN_PASSWORD || "",
    grantType: "password",
    clientId: "admin-cli",
  });

  kcAdminClient.setConfig({ realmName: "dsek" });

  return kcAdminClient;
}

async function _getUserId(client: KcAdminClient, username: string) {
  const response = await client.users.find({ username });
  if (response.length === 0) {
    error(404, {
      message: `${username} not found in Keycloak`,
      statusDescription: "markupdated",
    });
  }
  if (!response[0] || response.length !== 1) {
    error(400, {
      message: `${username} returned ${response.length} users in Keycloak`,
    });
  }

  return response[0].id;
}

async function getUserId(username: string) {
  if (!enabled) return;
  const client = await connect();
  try {
    return await _getUserId(client, username);
  } catch (error) {
    console.log(error);
    return null;
  }
}

// turns dsek.sexm.kok.mastare into ['dsek', 'dsek.sexm', 'dsek.sexm.kok', 'dsek.sexm.kok.mastare']
function getRoleNames(id: string): string[] {
  const parts = id.split(".");
  return [...Array(parts.length).keys()].map((i) =>
    parts.slice(0, i + 1).join("."),
  );
}

async function getGroupId(keycloak: KcAdminClient, positionId: string) {
  const roleNames = getRoleNames(positionId);
  const groups = await keycloak.groups.find();
  let group = groups.find((g) => g.name === positionId);
  //roleNames.slice(1).forEach((name) => {
  //group = group?.subGroups?.find((g) => g.name === name);
  //});

  if (!group) {
    throw error(404, {
      message: `Failed to find group for position ${positionId}`,
      statusDescription: "markupdated",
    });
  }
  return group?.id;
}

async function updateProfile(
  username: string,
  firstName: string,
  lastName: string,
) {
  if (!enabled) return;

  try {
    const client = await connect();
    const id = await _getUserId(client, username);
    await client.users.update(
      { id: id! },
      {
        firstName: firstName,
        lastName: lastName,
      },
    );
    console.log(`updated profile`);
  } catch (error) {
    console.log(error);
  }
}

// Checks if the position is a board member from the database
async function isBoardPosition(prisma: PrismaClient, positionId: string) {
  const position = await prisma.position.findFirst({
    where: { id: positionId },
  });
  return position?.boardMember ?? false;
}

async function hasAnyBoardPosition(prisma: PrismaClient, studentId: string) {
  const boardPosition = await prisma.mandate.findFirst({
    where: {
      member: { studentId },
      endDate: { gt: new Date() },
      position: { boardMember: true },
    },
  });
  return boardPosition !== null;
}

async function addMandate(
  prisma: PrismaClient,
  username: string,
  positionId: string,
  mandateId: string,
) {
  if (!enabled) return;

  try {
    const keycloak = await connect();
    const [id, groupId] = await Promise.all([
      _getUserId(keycloak, username),
      getGroupId(keycloak, positionId),
    ]);
    await keycloak.users.addToGroup({ id: id!, groupId: groupId! });

    // Special case for board members
    if (await isBoardPosition(prisma, positionId)) {
      const boardGroupId = await getGroupId(keycloak, KEYCLOAK_BOARD_GROUP);
      await keycloak.users.addToGroup({ id: id!, groupId: boardGroupId! });
    }
    await prisma.mandate.update({
      where: { id: mandateId },
      data: {
        lastSynced: new Date(),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Error has to be any or unknown
  } catch (error: any) {
    console.log("addmandate sync error: ", error);
    if (error.body?.statusDescription !== "markupdated") {
      console.log("waiting");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function deleteMandate(
  prisma: PrismaClient,
  username: string,
  positionId: string,
  mandateId: string,
) {
  if (!enabled) return;

  try {
    const keycloak = await connect();
    const [id, groupId] = await Promise.all([
      _getUserId(keycloak, username),
      getGroupId(keycloak, positionId),
    ]);
    await keycloak.users.delFromGroup({ id: id!, groupId: groupId! });

    // Special case for board members
    if (
      (await isBoardPosition(prisma, positionId)) && // if the position is a board member
      !(await hasAnyBoardPosition(prisma, username)) // if the user has no other board positions
    ) {
      const boardGroupId = await getGroupId(keycloak, KEYCLOAK_BOARD_GROUP);
      await keycloak.users.delFromGroup({
        id: id!,
        groupId: boardGroupId!,
      });
    }
    await prisma.mandate.update({
      where: { id: mandateId },
      data: {
        lastSynced: new Date(),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Error has to be any or unknown
  } catch (error: any) {
    console.log("deletemandate sync error: ", error);
    if (error.body?.statusDescription === "markupdated") {
      await prisma.mandate.update({
        where: { id: mandateId },
        data: {
          lastSynced: new Date(),
        },
      });
    } else {
      console.log("waiting");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function updateMandate(prisma: PrismaClient) {
  if (!enabled) return;

  const now = new Date().toISOString();

  const [mandatesToBeDeleted, mandatesToBeAdded] = await Promise.all([
    prisma.mandate.findMany({
      where: {
        AND: [
          { endDate: { gt: prisma.mandate.fields.lastSynced } },
          { endDate: { lt: now } },
        ],
      },
      select: {
        id: true,
        positionId: true,
        member: { select: { studentId: true } },
      },
    }),
    prisma.mandate.findMany({
      where: {
        AND: [
          { startDate: { gt: prisma.mandate.fields.lastSynced } },
          { startDate: { lt: now } },
          { endDate: { gt: now } },
        ],
      },
      select: {
        id: true,
        positionId: true,
        member: { select: { studentId: true } },
      },
    }),
  ]);
  console.log(
    `[${new Date().toISOString()}] adding ${mandatesToBeAdded.length} users to groups, deleting ${mandatesToBeDeleted.length} users from groups`,
  );

  for (const m of mandatesToBeAdded) {
    await addMandate(prisma, m.member.studentId!, m.positionId, m.id);
  }

  for (const m of mandatesToBeDeleted) {
    await deleteMandate(prisma, m.member.studentId!, m.positionId, m.id);
  }
}

async function updateEmails(prisma: PrismaClient) {
  if (!enabled) return;

  const currentUserEmail = (
    await prisma.member.findMany({
      select: {
        studentId: true,
        email: true,
      },
      distinct: ["studentId"],
    })
  ).reduce((acc, curr) => {
    if (curr.studentId) acc.set(curr.studentId, curr.email);
    return acc;
  }, new Map<string, string | null>());

  if (currentUserEmail.size === 0) {
    console.log(
      `[${new Date().toISOString()}] email sync aborted, no users in database`,
    );
    return;
  }

  const userEmails = await getManyUserEmails(currentUserEmail);
  console.log(
    `[${new Date().toISOString()}] updating ${userEmails.size} emails`,
  );

  for (const [studentId, email] of userEmails) {
    try {
      await prisma.member.update({
        where: {
          studentId,
        },
        data: {
          email,
        },
      });
    } catch (error) {
      console.log("Failed to update email for", studentId, email);
      console.log(error);
    }
  }
}

// To reduce the amount of requests to Keycloak,
// we fetch all emails for all users in one request
// and then filter out the ones we need
async function getManyUserEmails(
  currentUserEmail: Map<string, string | null>,
): Promise<Map<string, string>> {
  if (!enabled) return new Map();
  const client = await connect();
  const userEmails = new Map<string, string>();

  // Fetch all users from Keycloak
  // We can only fetch a limited amount of users at a time
  const users = [];
  do {
    users.push(...(await client.users.find({ max: 500, first: users.length })));
  } while (users.length % 500 === 0);

  users.forEach((user) => {
    const { username, email } = user;
    if (!username || !email) return;

    if (
      currentUserEmail.has(username) && // if the user exists in our database
      currentUserEmail.get(username) !== user.email // if the email has changed
    ) {
      userEmails.set(username, email);
    }
  });
  return userEmails;
}

async function hasUsername(username: string) {
  if (!enabled) return false;
  const client = await connect();
  const user = await client.users.find({ username });
  return user.filter((u) => u.username === username).length > 0;
}

async function hasEmail(email: string) {
  if (!enabled) return false;
  const client = await connect();
  const user = await client.users.find({ email });
  return user.filter((u) => u.email === email).length > 0;
}

async function getEmail(username: string) {
  if (!enabled) return;
  const client = await connect();
  const user = await client.users.find({ username });
  if (user.length === 1) return user[0]?.email;
}

/**
 * This function exists to keep Keycloak's
 * database in sync with the Prisma database.
 * It should be run periodically.
 *
 * Note that this function is currently incomplete since:
 * 1. It is not bi-directional: mandates are pushed and emails are pulled.
 * 2. It doesn't sync everything: member names, `dsek.styr`, etc?
 */
async function sync(prisma: PrismaClient) {
  updateMandate(prisma);
  updateEmails(prisma);
}

export default {
  updateProfile,
  addMandate,
  deleteMandate,
  getUserId,
  getManyUserEmails,
  hasUsername,
  hasEmail,
  getEmail,
  sync,
};
