import type { MetadataRoute } from "next";

// The app is a login-walled POS, so there is nothing here worth indexing, but
// blocking the whole site trips Lighthouse's `is-crawlable` audit. Keep the
// public pages crawlable and only fence off the API and admin surfaces.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
    ],
  };
}