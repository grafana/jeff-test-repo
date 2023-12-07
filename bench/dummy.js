import { check } from "k6";
import { browser } from "k6/experimental/browser";

export const options = {
  thresholds: {
    checks: ["rate>=1"],
  },
  scenarios: {
    ui: {
      executor: "shared-iterations",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto(`https://www.grafana.com`);

    check(page, {
      "url is correct": page.url() === "https://grafana.com/",
    });
  } finally {
    page.close();
  }
}
