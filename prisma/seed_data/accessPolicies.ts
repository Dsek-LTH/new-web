import { PrismaClient } from "@prisma/client";
import apiNames from "../../src/lib/utils/apiNames";

export const insertAccessPolicies = async (prisma: PrismaClient) => {
  if (
    (await prisma.accessPolicy.count({
      where: {
        apiName: apiNames.FILES.BUCKET("dev-material").CREATE,
      },
    })) <= 0
  ) {
    await prisma.accessPolicy.createMany({
      data: [
        {
          apiName: apiNames.FILES.BUCKET("dev-material").READ,
          role: "*",
        },
        {
          apiName: apiNames.FILES.BUCKET("dev-material").CREATE,
          role: "dsek.infu.dwww",
        },
        {
          apiName: apiNames.FILES.BUCKET("dev-material").CREATE,
          role: "dsek.styr",
        },
        {
          apiName: apiNames.FILES.BUCKET("dev-material").UPDATE,
          role: "dsek.infu.dwww",
        },
        {
          apiName: apiNames.FILES.BUCKET("dev-material").UPDATE,
          role: "dsek.styr",
        },
        {
          apiName: apiNames.FILES.BUCKET("dev-material").DELETE,
          role: "dsek.infu.dwww",
        },
      ],
    });
  }
};
