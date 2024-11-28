import { PUBLIC_BUCKETS_FILES } from "$env/static/public";
import { removeFilesWithoutAccessCheck } from "$lib/files/fileHandler";
import { uploadFile } from "$lib/files/uploadFiles";
import authorizedPrismaClient from "$lib/server/shop/authorizedPrisma";
import { redirect } from "$lib/utils/redirect";
import type { Prisma } from "@prisma/client";
import type { AuthUser } from "@zenstackhq/runtime";
import { fail } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { message, superValidate } from "sveltekit-superforms/server";
import { getCostCenter } from "../config";
import createBasicReceipt from "./baseItem";
import { expenseSchema } from "./types";

export const load = async () => {
  return {
    form: await superValidate(
      {
        date: new Date(),
        isGuildCard: false,
        receipts: [createBasicReceipt()],
      },
      zod(expenseSchema),
      {
        errors: false,
      },
    ),
  };
};
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const expensePhotoUrl = (date: Date, id: string) =>
  `public/expenses/${date.getFullYear()}/${months[date.getMonth()]}/${id}`;
const uploadReceipt = async (
  user: AuthUser,
  image: File,
  date: Date,
  id: string,
) => {
  const imageUrl = await uploadFile(
    user,
    image,
    expensePhotoUrl(date, id),
    PUBLIC_BUCKETS_FILES,
    undefined,
    {
      resize: {
        width: 1920,
        height: 1920,
        fit: "contain",
      },
    },
  );
  return imageUrl;
};

const removeReceiptImages = (user: AuthUser, date: Date, id: string) =>
  removeFilesWithoutAccessCheck(user, PUBLIC_BUCKETS_FILES, [
    expensePhotoUrl(date, id),
  ]);

export const actions = {
  default: async (event) => {
    const { locals, request } = event;
    const { prisma, user, member } = locals;
    const form = await superValidate(request, zod(expenseSchema));
    if (!form.valid) return fail(400, { form });
    if (!member) throw fail(401, { form });
    const expense = await prisma.expense.create({
      data: {
        date: form.data.date,
        description: form.data.description,
        isGuildCard: form.data.isGuildCard,
        memberId: member?.id,
      },
    });
    const allSigners = form.data.receipts.flatMap((receipt) =>
      receipt.rows.map((row) => getCostCenter(row.costCenter).signer),
    );
    const signers = await prisma.mandate.findMany({
      where: {
        positionId: {
          in: allSigners,
        },
        startDate: {
          lte: expense.date,
          gte: expense.date,
        },
      },
      select: {
        positionId: true,
        memberId: true,
      },
    });
    const itemPromiseResults = await Promise.allSettled(
      form.data.receipts.map(
        async (receipt): Promise<Prisma.ExpenseItemCreateManyInput[]> => {
          const uploadedReceipt = await uploadReceipt(
            user,
            receipt.image,
            expense.date,
            expense.id,
          );

          return receipt.rows.map((row) => {
            const costCenter = getCostCenter(row.costCenter);
            const signer = signers.find(
              (signer) => signer.positionId === costCenter.signer,
            );
            if (!signer) {
              throw new Error(
                `Signer not found for cost center ${costCenter.name}`,
              );
            }
            return {
              expenseId: expense.id,
              costCenter: row.costCenter,
              amount: row.amount,
              receiptUrl: uploadedReceipt,
              comment: row.comment,
              committeeShortName: costCenter.committee,
              signerMemberId: signer.memberId,
            };
          });
        },
      ),
    );
    for (const promiseResult of itemPromiseResults) {
      if (promiseResult.status === "rejected") {
        await authorizedPrismaClient.expense.delete({
          where: {
            id: expense.id,
          },
        });
        try {
          await removeReceiptImages(user, expense.date, expense.id);
        } catch {
          // we don't do anything. If this method failed, then "uploadReceipt" also failed
          // it is clearer for the user to show the error message from "uploadReceipt" rather than this method
        }
        return message(form, {
          message:
            promiseResult.reason instanceof Error
              ? promiseResult.reason.message
              : promiseResult.reason,
          type: "error",
        });
      }
    }
    try {
      await prisma.expenseItem.createMany({
        data: itemPromiseResults
          .filter((promiseResults) => promiseResults.status === "fulfilled")
          .flatMap(({ value: item }) => item),
      });
    } catch (e) {
      await authorizedPrismaClient.expense.delete({
        where: {
          id: expense.id,
        },
      });
      try {
        await removeReceiptImages(user, expense.date, expense.id);
      } catch {
        // we don't do anything. If this method failed, then "uploadReceipt" also failed
        // it is clearer for the user to show the error message from "uploadReceipt" rather than this method
      }
      return message(form, {
        message: e instanceof Error ? e.message : e,
        type: "error",
      });
    }

    // TODO: Send notification to certifier

    throw redirect(
      `/expenses`,
      {
        message: "Utlägg skapat",
        type: "success",
      },
      event,
    );
  },
};
