# OrangeHRM Playwright Tests

UI test automation for the [OrangeHRM demo site](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login)
built with **Playwright Test** and **JavaScript**, using the Page Object Model.

## Structure

```
orangehrm-playwright/
├── pages/
│   ├── LoginPage.js              # login form: goto() / login()
│   ├── DashboardPage.js          # app shell: side panel nav, top bar, logout()
│   └── PimPage.js                # PIM employee list: filters + results grid
├── tests/
│   ├── login.spec.js             # TC01 valid login, TC02 invalid login
│   └── employee-search.spec.js   # TC03 end-to-end PIM search journey
├── playwright.config.js
├── package.json
└── README.md
```

## Setup

```bash
npm install
npx playwright install chromium
```

## Running the tests

| Command | What it does |
| --- | --- |
| `npx playwright test` | Run the whole suite (Chromium) |
| `npx playwright test --headed` | Force a visible browser window |
| `npx playwright test --ui` | Open the interactive UI mode (watch, time-travel, pick locators) |
| `npx playwright test tests/login.spec.js` | Run only the login spec |
| `npx playwright test tests/employee-search.spec.js` | Run only the PIM search spec |
| `npx playwright test -g "TC03"` | Run tests whose title matches `TC03` |
| `npx playwright test --workers=1` | Run serially, one browser window at a time |
| `npx playwright test --repeat-each=3` | Re-run each test 3x to check for flakiness |
| `npx playwright test --debug` | Step through with the Playwright Inspector |
| `npx playwright show-report` | Open the last HTML report |

The same commands are wired up as npm scripts: `npm test`, `npm run test:headed`,
`npm run test:ui`, `npm run report`.

## Test cases

- **TC01 – Valid login**: logs in as `Admin / admin123`, asserts the URL contains
  `dashboard` and the `Dashboard` heading is visible.
- **TC02 – Invalid login**: logs in as `InvalidUser / wrongpassword`, asserts the
  error alert reads `Invalid credentials` and the user stays on the login page.
- **TC03 – PIM employee search journey** (`employee-search.spec.js`): a longer
  end-to-end flow, split into `test.step()` blocks so the HTML report shows each
  stage separately:
  1. Log in as an admin and confirm the dashboard.
  2. Open **PIM** from the side panel; confirm the URL, the `PIM` top-bar title
     and the *Employee Information* search panel.
  3. Read the `(N) Records Found` counter and confirm the grid renders that many
     rows, then capture the first employee's id and first name.
  4. Search by that id and confirm every returned row matches it (the filter is a
     partial match) and the captured name is on the first row.
  5. Search for an id nobody owns and confirm `No Records Found` with zero rows.
  6. Reset the filters and confirm the id field is cleared and the full list returns.
  7. Log out through the user dropdown and confirm the login form is back.

  TC03 reads its expected values off the page rather than hardcoding employee
  names or ids, because the demo instance is public and its data changes
  constantly.

## Configuration notes

`playwright.config.js` sets:

- `testDir: './tests'` and `baseURL: 'https://opensource-demo.orangehrmlive.com'`
- `headless: false` — the browser is visible so runs can be confirmed by eye.
  Set it to `true` (or run with `CI=1`) for headless execution.
- `screenshot: 'only-on-failure'` and `trace: 'on-first-retry'` — artifacts land in
  `test-results/`; view a trace with `npx playwright show-trace <path-to-trace.zip>`.
- A single `chromium` project using the `Desktop Chrome` device profile.

## Troubleshooting

The demo site is a shared public instance. If a test fails with a timeout, first
re-run it — the site is occasionally slow or briefly unavailable. Action and
navigation timeouts are already raised (15s / 30s) to absorb that.
