<script lang="ts">
  import { page } from "$app/stores";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import { getFullName } from "$lib/utils/client/member";
  import { formatPrice, priceFormatClasses } from "$lib/utils/client/price";
  import type { ItemQuestion } from "@prisma/client";
  import dayjs from "dayjs";
  import RowAction from "./RowAction.svelte";
  import TruncatedTableCell from "./TruncatedTableCell.svelte";
  import type { ConsumableRowData, ReservationData } from "./types";

  $: stripeIntentBaseUrl = $page.data["stripeIntentBaseUrl"]; // required to be return by the +page.server.ts where this is rendered.
  // one of the following has to be specified
  export let consumable: ConsumableRowData | null = null;
  export let reservation: ReservationData | null = null;

  export let questions: ItemQuestion[];

  if (!consumable && !reservation)
    throw new Error("Either consumable or reservation must be specified");
  $: item = (consumable ?? reservation)!;
  $: member = item.member;
</script>

<tr>
  <td>
    <div class="flex items-center gap-3">
      <MemberAvatar class="h-8 w-8" {member} />
      <div>
        <div class="font-bold">
          {member ? getFullName(member) : "Icke inloggad"}
        </div>
        {#if item.externalCustomerEmail}
          <div class="text-sm opacity-50">
            {item.externalCustomerEmail}
          </div>
        {/if}
      </div>
    </div>
  </td>
  <TruncatedTableCell value={member ? (member.foodPreference ?? "") : ""} />
  <TruncatedTableCell
    value={consumable?.purchasedAt
      ? dayjs(consumable.purchasedAt).format("HH:MM:ss DD-MM-YYYY")
      : null}
  />
  {#if consumable !== null}
    {@const phadderGroup = consumable.member?.phadderGroup}
    <TruncatedTableCell value={phadderGroup?.name ? phadderGroup.name : ""} />
  {/if}
  <TruncatedTableCell
    value={consumable?.consumedAt
      ? dayjs(consumable.consumedAt).format("HH:MM:ss DD-MM-YYYY")
      : consumable
        ? "Ej konsumerad"
        : null}
    class={consumable?.consumedAt ? "text-success" : ""}
  />
  <TruncatedTableCell
    value={consumable?.priceAtPurchase
      ? formatPrice(consumable.priceAtPurchase)
      : consumable?.purchasedAt !== null
        ? "Okänt"
        : null}
    class={priceFormatClasses}
  />
  <TruncatedTableCell
    link={consumable?.stripeIntentId
      ? `${stripeIntentBaseUrl}/${consumable.stripeIntentId}`
      : undefined}
    value={consumable?.stripeIntentId
      ? `${consumable.stripeIntentId}`
      : consumable?.purchasedAt
        ? "Finns inte sparad"
        : null}
  />
  {#each questions as question}
    {#if consumable}
      {@const response = consumable.questionResponses.find(
        (r) => r.questionId === question.id,
      )}
      <TruncatedTableCell
        value={response
          ? `${response.answer}${
              response.extraPrice
                ? ` (${formatPrice(response.extraPrice)})`
                : ""
            }`
          : undefined}
      />
    {:else}
      <TruncatedTableCell value={null} />
    {/if}
  {/each}
  <th>
    {#if consumable?.consumedAt === null}
      <RowAction action="?/consume" consumableId={consumable.id}>
        <span class="i-mdi-flame-circle text-xl text-secondary"></span>
      </RowAction>
    {:else if consumable}
      <RowAction
        action="?/unconsume"
        consumableId={consumable.id}
        warningMessage="Är du säker på att du vill avkonsumera biljetten?"
      >
        <span class="i-mdi-redo-variant text-xl text-error"></span>
      </RowAction>
    {:else}
      <span class="font-semibold text-gray-400">N/A</span>
    {/if}
  </th>
  <th>
    {#if consumable}
      <RowAction
        action="?/refund"
        consumableId={consumable.id}
        warningMessage="Är du säker på att du vill ge personen en återbetalning?"
      >
        <span class="i-mdi-cash-refund text-xl text-success"></span>
      </RowAction>
    {/if}
  </th>
</tr>
