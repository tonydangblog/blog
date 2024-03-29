<script context="module" lang="ts">
  export interface Detail {
    name: string;
    value: string;
  }
</script>

<script lang="ts">
  import type { Dimensions } from "@lib/types/d3";

  export let dms: Dimensions;
  export let bar_width: number;
  export let bar_width_padding: number;

  // Tooltip state passed from parent
  export let display: boolean;
  export let x: number;
  export let y: number;
  export let img_src: string;
  export let img_alt: string;
  export let name: string;
  export let details: Detail[];

  const CARROT_BORDER_WIDTH = 8; // from border-8
  let tooltip_width: number;
  let tooltip_height: number;

  // Tooltip position
  const TOOLTIP_SHIFT = 4 * bar_width_padding;
  $: position_x =
    x < dms.bounded_width / 2
      ? dms.left + x - TOOLTIP_SHIFT
      : dms.left + x - tooltip_width + bar_width + TOOLTIP_SHIFT;
  $: position_y = dms.top + y - tooltip_height - CARROT_BORDER_WIDTH + 1;

  // Tooltip carrot position
  $: carrot_x = dms.left + x + bar_width / 2 - CARROT_BORDER_WIDTH;
  $: carrot_y = dms.top + y - CARROT_BORDER_WIDTH;

  // Set width of detail name based on longest name
  let details_container: HTMLDListElement;
  let detail_name_width: number;
  $: dts = details_container?.querySelectorAll("dt");
  $: if (dts) {
    detail_name_width = Math.max(...[...dts].map((dt) => dt.offsetWidth));
  }
</script>

{#if display}
  <div class="pointer-events-none">
    <div
      class="bg-surface absolute top-0 flex rounded-md p-2"
      style:translate={`${position_x}px ${position_y}px`}
      bind:clientWidth={tooltip_width}
      bind:clientHeight={tooltip_height}
    >
      <!-- Tooltip image -->
      {#if img_src}
        <div>
          <img
            class="m-0 mr-2 mt-1.5 h-10 w-10 rounded-full"
            src={img_src}
            alt={img_alt}
          />
        </div>
      {/if}

      <!-- Tooltip details -->
      <div class="not-prose">
        <div class="text-heading font-bold">{name}</div>
        <dl bind:this={details_container}>
          {#each details as detail}
            <div class="flex gap-2 text-sm">
              <dt
                style={`width: ${detail_name_width}px`}
                class="whitespace-nowrap font-bold"
              >
                {detail.name}
              </dt>
              <dd>{detail.value}</dd>
            </div>
          {/each}
        </dl>
      </div>
    </div>

    <!-- Carrot -->
    <span
      class="
        absolute top-0
        border-{CARROT_BORDER_WIDTH}
        border-t-surface
        border-transparent
      "
      style:translate={`${carrot_x}px ${carrot_y}px`}
    />
  </div>
{/if}
