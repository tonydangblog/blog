<script lang="ts">
  import type { CollectionEntry } from "astro:content";
  type Entry = CollectionEntry<"posts"> | CollectionEntry<"projects">;

  export let entry: Entry;
  export let assetsVersion: number;
</script>

<div class="aspect-[1200/630]">
  <!-- Light mode image -->
  <img
    class="dark:hidden"
    src="/og/light/dist/960/{entry.slug}.jpg?v={assetsVersion}"
    alt={entry.data.alt}
    loading="lazy"
  />

  <!-- Dark mode image -->
  <img
    class="hidden dark:inline brightness-90"
    src="/og/dark/dist/960/{entry.slug}.jpg?v={assetsVersion}"
    alt={entry.data.alt}
    loading="lazy"
  />
</div>
