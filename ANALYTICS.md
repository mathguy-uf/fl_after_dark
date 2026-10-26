# Florida After Dark — Play Counting

The live GitHub Pages game records a small set of anonymous, aggregate counters beginning October 26, 2026.

## Dashboard

View the current totals at:

https://mathguy-uf.github.io/fl_after_dark/stats.html

The dashboard reports:

- approximate unique players
- nights started
- nights completed
- completion rate
- number of Station 17 endings
- ending breakdown

## What “unique player” means

A browser is counted as a new player the first time it starts a night. The game then stores a single local browser flag so later nights from that browser do not increase the unique-player counter again.

This is an estimate, not an identity system. The same person can be counted more than once if they clear site storage, use another browser, use private browsing, or play on another device. Multiple people sharing one browser profile may count as one player.

## Privacy

The game does not send names, email addresses, save data, inventory, route history, story choices, free-form text, or a persistent player identifier.

It sends only aggregate counter increments such as `starts`, `completions`, and the ending category. The counter service receives the ordinary network information required to process an HTTPS request, as any third-party web service does.

No analytics request is sent when the game is run locally. Counting is enabled only on the production `mathguy-uf.github.io/fl_after_dark` site.

## Reliability

The counters are intentionally lightweight and are suitable for informal game telemetry, not research-grade analytics. The counter keys are public, so determined users could manipulate them manually. Analytics failures are ignored and never interrupt gameplay.

The counter backend is CountAPI at https://countapi.mileshilliard.com/.
