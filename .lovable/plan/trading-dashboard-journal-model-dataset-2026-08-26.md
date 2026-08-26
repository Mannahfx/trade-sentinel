# Trading Dashboard — Journal + Model Dataset

A premium one-page dark dashboard for logging trades, scoring setups, and chatting with an AI mentor about your own data. Everything is stored locally in your browser.

## Look and feel

- Deep slate/obsidian background, glassmorphism panels (translucent fill, blur, hairline borders), soft ambient glows.
- Accents: Emerald (BUY/WIN), Crimson (SELL/LOSS), Electric Blue (primary actions), amber for BE.
- Inter/Outfit typography loaded via the root head, tabular numbers for stats.
- Micro-animations: hover lifts, glow pulses on the Take-Trade indicator, smooth pill/toggle transitions. Fully responsive (stacks to one column on mobile).

## Layout

**Header + quick stats** — title, plus glass stat cards: Total Trades, TAKE = YES count, Win/Loss ratio (win rate %, avg R).

**Left column (60%) — Trade entry form**, multi-column grid:
- Instrument (synthetic indices: Volatility 10/25/50/75/100, 1s variants, Boom/Crash, Step, Jump).
- Direction as BUY/SELL toggle buttons.
- Selects: Zone type (FVG/OB), HTF Zone TF, Entry TF, Entry trigger, 4H Algo Structure (A/B/C), Zone Quality (A/B/C).
- Inputs: Date/Time, SL size, Planned R, Result (R).
- Outcome: Win / Loss / BE / No trade.
- Mistake tags as selectable glowing chips (entered early, wrong bias, TP too early, overtraded, no confirmation, moved SL, revenge trade, ignored HTF, chased entry).
- Textareas: "Why I took it", "One improvement".
- Three drag-and-drop image dropzones (D1, 4H, 15M) with icon, hover state, thumbnail preview and remove button.

**Right column (40%) — Action center + AI mentor:**
- Large glowing YES (Take) / NO (Skip) indicator that recalculates live from the form.
- Transparent scoring breakdown listing each rule, its points, and pass/fail.
- Massive "Save Trade" button with hover glow.
- AI Trading Mentor chat: scrollable history, seeded assistant message, composer placeholder "Ask your Mentor to analyze your data...", streaming replies, typing indicator.
- Secondary buttons: "Download CSV (Model-Ready)" and "Download JSON".

**Bottom — Recent trades ledger:** sortable table, sticky header, zebra rows, badges for Direction and Outcome, row expand for notes, delete per row.

## Take Trade? — based on your own history, not a grade

No arbitrary A/B/C points. The indicator reads the current form as a **combination** and looks up how that exact combination has actually performed in your saved trades.

- The combination key is: Zone Quality + 4H Algo Structure + Zone type + Entry trigger (with HTF/Entry TF pairing).
- The breakdown shows plain-language history lines, for example:
  - "A + FVG + BOS entry on 4H->15M: 7 trades, 6 wins, 1 loss (86%), avg +1.9R — WON before"
  - "A + OB + wick rejection: 4 trades, 1 win, 3 losses (25%), avg -0.6R — LOST before"
- Verdict: YES when the matched combination is net profitable with a positive win rate, NO when it has lost before, and "No data yet" (neutral) when the exact combination has never been traded.
- When there is no exact match, it falls back to the closest partial matches (each factor's individual win/loss record) and says which factor is dragging it down.
- Any selected mistake tag still forces NO.

So the dashboard learns from your saved journal: the more trades you log, the sharper the YES/NO gets.


## Data and AI

- Trades, screenshots (as data URLs) and the chat transcript persist in browser localStorage — no accounts, no backend database. Clearing browser data clears the journal.
- Chat is a single ongoing conversation (no thread list), restored on reload, with a "Clear chat" action.
- CSV export is flat and model-ready (one row per trade, mistake tags one-hot encoded, screenshots omitted); JSON export is the full record.

## Technical notes

- Route: rewrite `src/routes/index.tsx` as the dashboard; components split under `src/components/dashboard/`, state in a `useTrades` localStorage hook with SSR-safe hydration.
- Design tokens (obsidian, emerald, crimson, electric blue, glass surfaces, glow shadows) added to `src/styles.css` under `@theme inline`; fonts via `<link>` in `__root.tsx`.
- AI mentor: a TanStack server function/route calling the Lovable AI Gateway with `openai/gpt-5.6-sol`, streaming; the client sends the trade summary (aggregates + recent trades, no images) as context so answers reference real data. API key stays server-side.
- Page-level SEO head with a trading-specific title/description.
