# Trade Sentinel

ystem / Style Requirements: Create a premium, state-of-the-art one-page Trading Dashboard. The aesthetic should be a sleek, modern "Dark Mode" with glassmorphism elements (translucent backgrounds with subtle blur and thin borders). Use a curated, harmonious color palette: deep slate/obsidian for the background, with vibrant but professional neon accents (e.g., Emerald Green for BUY/WIN, Crimson Red for SELL/LOSS, and a vibrant Electric Blue for primary actions). Typography must use a modern sans-serif font like Inter or Outfit. The interface must feel dynamic, featuring subtle micro-animations on hover, smooth transitions, and a highly responsive layout. Do not use generic browser defaults; everything must feel custom, high-end, and professional.

Layout & Structure: The dashboard is divided into three main sections:

1. Header & Quick Stats (Top)

A clean header with the app title ("Trading Dashboard — Journal + Model Dataset").

A row of minimalist "Glass" statistic cards showing: Total Trades, "TAKE = YES" Count, and Win/Loss Ratio.

2. The Trade Entry Form (Main Left Column - 60% width)

A highly structured, compact, and interactive form. Use a multi-column CSS grid so it doesn't feel overwhelming.

Dropdowns/Selects: Instrument (Synthetic indices), Direction (BUY/SELL toggle buttons instead of a dropdown for speed), Zone type (FVG/OB), HTF Zone TF, Entry TF, Entry trigger, 4H Algo Structure (A/B/C), Zone Quality (A/B/C).

Number Inputs: Date/Time, SL size, Planned R, Result (R).

Outcome Select: Win/Loss/BE/No trade.

Mistake Tags: A sleek grid of selectable "pills" or chips for checklist items (entered early, wrong bias, TP too early, overtraded, etc.). When clicked, they should light up.

Text Areas: Quick notes ("Why I took it" & "One improvement").

Image Uploads (Screenshots): Replace standard URL inputs with three elegant, drag-and-drop file upload zones for images (labeled: D1 Screenshot, 4H Screenshot, 15M Screenshot). They should show a small image icon and a "Click to upload or drag image" state.

3. Action Center & AI Chatbot (Main Right Column - 40% width)

The "Take Trade?" Indicator: A large, prominent, glowing indicator module that dynamically shows YES (Take) or NO (Skip) based on form inputs. Include a transparent "Scoring Logic" breakdown beneath it.

Primary Action: A massive, premium "Save Trade" button with a hover glow effect.

The AI Trading Mentor (Chatbot): A sleek, modern chat interface embedded right below the action buttons. It should have a chat history window and an input field saying "Ask your Mentor to analyze your data...". Add a placeholder message from the AI: "I have analyzed your saved trades. What would you like to know about your win probabilities or mistakes?"

Data Management: Two secondary buttons for dataset exporting: "Download CSV (Model-Ready)" and "Download JSON" with small icons.

4. Recent Trades Ledger (Bottom Section)

A clean, sortable data table displaying recently saved trades.

The table should have sticky headers, alternating subtle row colors, and use badges/chips for Status (Win/Loss) and Direction (Buy/Sell).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/da4f7dec-f7d9-4898-b7a5-82d2b8e1f2f5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
