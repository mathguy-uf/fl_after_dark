# Florida After Dark — Play Counting

Dashboard: https://mathguy-uf.github.io/fl_after_dark/stats.html

## Corrected series: v2

The corrected series begins October 28, 2026. v1 counters are preserved at the
backend but excluded from the dashboard: they counted New Night clicks before
confirmation and could count the subsequent Begin Night click again. Historical
totals cannot be reliably repaired.

- **Nights started:** a new night initialized by the canonical runtime, including
  Drive Again. Canceling a restart, returning to the title, and loading a save
  do not count as starts.
- **Browser profiles:** an approximate count of browsers with a recorded start
  in this series, not a count of identifiable people or returning players.
- **Nights ended:** sum of the six ending counters. There is no separate
  completion request that could disagree with the ending breakdown.
- **Any-ending rate:** recorded endings divided by recorded starts. Going home
  and running out of fuel count as endings, not Station 17 story completions.
- **Station 17 endings:** Morning Traffic, Dead Air, Borrowed Time, and The Other
  Driver. Home Before Sunrise and Empty are listed separately in the breakdown.

## Deduplication and saves

Each new night gets a random local run token stored in its save. A localStorage
ledger claims its start and first ending before sending each request. Loading a
pre-ending save after finishing the same night does not count another ending,
including after a page reload. Web Locks serialize shared records across tabs
in supporting browsers; a per-page queue handles repeated calls everywhere.
An ending waits for its start request and is counted only if that start was
confirmed. Legacy saves without a v2 token are excluded from the new series.

## Privacy and limitations

No name, email, run token, persistent player identifier, save, inventory, route
history, story choices, or free-form text is sent. Only aggregate counter names
are sent to https://countapi.mileshilliard.com/. The service receives ordinary
HTTPS connection information. Counting runs only on the production game's path.

These remain approximate public counters, not an exactly-once analytics database.
The backend offers increments without idempotency keys. An ambiguous network
failure is therefore not retried: retrying could count the same event twice.
Offline play, blocked requests, interrupted requests, and unavailable browser
storage can undercount. Without Web Locks, simultaneous cross-tab claims can
race. Clearing storage can count a browser again and loses its run ledger;
missing ledgers suppress saved-run endings rather than inventing new starts.
Different devices or profiles can represent the same person; shared profiles
can represent multiple people. Public counter keys can be manipulated.

The dashboard shows an unavailable message, not fabricated zeroes or stale
totals, for failed or malformed responses. A missing counter (HTTP 404) means
no events have yet created that counter. Exact delivery and tamper resistance
would require a backend that accepts and deduplicates event IDs transactionally.

## Verification

Run `node tests/analytics.test.cjs` for lifecycle, restart/cancel, saved-run,
reload, cross-tab, network/storage-failure, and dashboard regression coverage.
Run `node tests/endings.test.cjs` and `node tests/map.test.cjs` for game regressions.

