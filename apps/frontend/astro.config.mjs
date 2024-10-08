import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import svelte from "@astrojs/svelte";

import mdx from "@astrojs/mdx";
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

import a11yEmoji from "@fec/remark-a11y-emoji";
import remarkToc from "remark-toc";

import glsl from "vite-plugin-glsl";

export default defineConfig({
  site: "https://tonydang.com",
  server: { port: 3000 },
  integrations: [
    react(),
    svelte(),
    mdx({ remarkPlugins: [a11yEmoji, remarkToc] }),
    prefetch(),
    sitemap({
      filter: (page) =>
        ![
          "/list/unsubscribe/success",
          "/list/verify/expired",
          "/list/verify/success",
          "/sandbox",
          "/support/successful-one-time-donation",
          "/whoops",
        ].includes(page.slice(21, -1)),
    }),
    tailwind({ config: { applyBaseStyles: false } }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ["postgres"],
    },
    plugins: [glsl()],
  },
  compressHTML: true,
});
