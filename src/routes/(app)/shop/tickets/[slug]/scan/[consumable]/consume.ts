import { fail } from "@sveltejs/kit";
import type { Action } from "./$types";
import { consumeConsumable } from "$lib/server/shop/consumable";

export const POST: Action = async ({ params, locals }) => {
  const { consumable: consumableId } = params;

  try {
    const result = await consumeConsumable(locals.prisma, consumableId);
    if (result.type === "error") {
      return fail(400, { message: result.message });
    }
    return { success: true };
  } catch (error) {
    return fail(500, { message: "Failed to consume ticket", error });
  }
};
