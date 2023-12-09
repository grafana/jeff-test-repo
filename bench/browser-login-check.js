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
    await page.goto(`${__ENV.GRAFANA_URL}/login`);
    const loginButton = page.locator("a[href='login/grafana_com']");
    loginButton.waitFor({ state: "visible" });
    await Promise.all([loginButton.click(), page.waitForNavigation()]);

    const usernameInput = page.locator("input[name='login']");
    usernameInput.waitFor({ state: "visible" });
    usernameInput.type(__ENV.GRAFANA_USERNAME);
    const submit = page.locator("button[type='submit']");
    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/1.png` });
    await submit.click();

    const passwordInput = page.locator("input[name='password']");
    passwordInput.waitFor({ state: "visible" });
    await passwordInput.type(__ENV.GRAFANA_PASSWORD);
    const submitAgain = await page.locator("button[type='submit']");

    await Promise.all([page.waitForNavigation(), submitAgain.click()]);
    // handle oauth redirect
    await page.waitForNavigation();
    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/2.png` });

    const menuToggle = page.locator("#mega-menu-toggle");
    menuToggle.waitFor({ state: "visible" });
    await menuToggle.click();
    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/4.png` });

    const observability = page.locator('a[href="/monitoring"]');
    await observability.click();

    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/5.png` });
    const syntheticsCard = page.locator('a[aria-label="Tab Synthetics"]');
    await syntheticsCard.waitFor({ state: "visible" });
    await syntheticsCard.click();

    const existingChecksButton = page.locator(
      "a[href='/a/grafana-synthetic-monitoring-app/checks']"
    );
    await existingChecksButton.waitFor({ state: "visible" });
    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/6.png` });
    // const existingChecks = page.locator("a[href='/a/grafana-synthetic-monitoring-app/checks']");
    await Promise.all([page.waitForNavigation(), existingChecksButton.click()]);
    // await page.waitForNavigation();
    // await page.waitForLoadState();
    const cardList = page.locator(".card-list");
    // const checkItem = page.locator('[data-testid="check-card"');
    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/7.png` });
    console.log("at this place", page.url);
    await cardList.waitFor({ state: "visible" });
    page.screenshot({ path: `${__ENV.SCREENSHOT_PATH}/8.png` });
    // await page.click(page.locator('[data-testid="data-testid Toggle menu"]'));
    // await page.click(page.locator('[text=Observability]'));
    // await page.click(page.locator('[text=Synthetics]'));
    console.log(
      page.url(),
      `${__ENV.GRAFANA_URL}/a/grafana-synthetic-monitoring-app/checks`
    );

    check(page, {
      "url is correct":
        page.url() ===
        `${__ENV.GRAFANA_URL.replace(
          ":443",
          ""
        )}/a/grafana-synthetic-monitoring-app/checks`,
    });
    // await expect(page).toHaveURL('http://localhost:3000/a/grafana-synthetic-monitoring-app/home');
  } finally {
    page.close();
  }
}
