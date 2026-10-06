/* ─────────────────────────────────────────────────────────────
   POINT BREAK — site switches
   round2Enabled:
     false → Round 2 is LOCKED: the landing-page links are greyed out
             and round2.html only shows a "not open yet" screen.
             Its data and script are never loaded.
     true  → Round 2 works normally.

   To open Round 2 again:
     1. set round2Enabled to true
     2. delete the two lines in .vercelignore (so the answer data is
        uploaded again) and redeploy:  npx vercel deploy --prod --yes
   ───────────────────────────────────────────────────────────── */
window.SITE = { round2Enabled: false };
