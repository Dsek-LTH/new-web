import { ctxAccessGuard, policyAccessGuard } from "$lib/utils/access";
import apiNames from "$lib/utils/apiNames";
import prisma from "$lib/utils/prisma";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  const { accessPolicies } = await parent();
  policyAccessGuard(apiNames.TAGS.READ, accessPolicies);
  return {
    tags,
  };
};

export const actions = {
  create: async ({ request, locals }) => {
    const session = await locals.getSession();
    await ctxAccessGuard(apiNames.TAGS.CREATE, session?.user);
    const formData = await request.formData();
    const name = String(formData.get("name"));
    if (!name) return { data: Object.fromEntries(formData), error: "Name is required" };
    try {
      await prisma.tag.create({
        data: {
          name,
        },
      });
    } catch (e) {
      return fail(400, {
        data: Object.fromEntries(formData),
        error: (e as Error).message ?? "Unknown error",
      });
    }
    return {
      success: true,
    };
  },
  update: async ({ request, locals }) => {
    const session = await locals.getSession();
    await ctxAccessGuard(apiNames.NEWS.UPDATE, session?.user);
    const formData = await request.formData();
    try {
      await prisma.tag.update({
        where: {
          id: String(formData.get("id")),
        },
        data: {
          name: String(formData.get("name")) || "",
          color: String(formData.get("color")) || undefined,
        },
      });
      return {
        success: true,
      };
    } catch (e) {
      return fail(400, {
        data: Object.fromEntries(formData),
        error: (e as Error).message ?? "Unknown error",
      });
    }
  },
};
