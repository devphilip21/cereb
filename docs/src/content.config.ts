import { defineCollection } from "astro:content";

const gettingStarted = defineCollection({});

const examples = defineCollection({});

export const collections = {
  "getting-started": gettingStarted,
  examples,
};
