<script lang="ts">
  import { onMount } from "svelte";
  import { playerImage, playerImageLoaded } from "../_stores/appState";

  export let assetsVersion: number;

  const defaultPlayerName = "default";
  let playerName: string;

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    playerName = params.get("player")?.toLowerCase() || defaultPlayerName;
  });
</script>

{#if playerName}
  <img
    bind:this={$playerImage}
    src={`/img/possible-game/${playerName}.png?v=${assetsVersion}`}
    alt={playerName}
    class="hidden"
    on:load={() => ($playerImageLoaded = true)}
    on:error={() => (playerName = defaultPlayerName)}
  />
{/if}
