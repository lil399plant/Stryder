import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stryder — shared puppy log",
    short_name: "Stryder",
    description: "A calm, shared command center for Stryder's daily care.",
    start_url: "/today",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf6ee",
    theme_color: "#faf6ee",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
