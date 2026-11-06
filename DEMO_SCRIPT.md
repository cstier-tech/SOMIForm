# SOMI Form — Demo Script

A walkthrough for showing the SOMI Form live. **Run time: about 20 minutes.**

- **Part 1** (12 min) takes one request from start to **Approved**.
- **Part 2** (6 min) shows what happens when things don't go to plan: sending a request back, denying
  it, and canceling it.
- **Part 3** (2 min) is wrap-up and questions.

Each scene has **Do** (what to click) and **Say** (talking points). Say them in your own words.

---

## Before the demo

### Setup checklist

- [ ] The app is running and the records list loads.
- [ ] An estimate file is ready to upload (any PDF, e.g. `Northwind_Estimate.pdf`).
- [ ] The three practice records for Part 2 are created (see below).
- [ ] Old test records have been cleaned up, so the list looks tidy.
- [ ] The browser is zoomed to 110–125% so the audience can read it.

### Practice records for Part 2

Create these ahead of time so Part 2 doesn't need a lot of clicking. Any Sales details will do.

| Record | Customer | Get it to this status |
| --- | --- | --- |
| **B** | Lakeside Pharmacy | **Pending TSP Approval** (Manufacturing 2 has approved) |
| **C** | Harbor Auto Group | **Pending Process Approval** (Sales has just submitted it) |
| **D** | Summit Credit Union | **Process Approved** (Manufacturing has approved) |

> Record D has to be past Manufacturing's approval. A request canceled straight after it's
> submitted can't be revived, so the cancel-and-revive scene wouldn't work.

### Demo data for Part 1

These numbers give a clean sell price of **$1.42**.

**Sales**

| Field | Value |
| --- | --- |
| Date | Today |
| Customer Name | Northwind Clinics |
| Customer Number | 40218 |
| Item Name | Patient Intake Form, 2-part NCR |
| Customer Consumption per Month | 1000 |
| Sold at Storefront | Yes |
| Sold with Kits | No |
| Accepts Responsibility for Obsolete Inventory | Yes |
| Signed SOMI Agreement | Yes |
| Reorder Points Established | Yes |
| Reorder Point Quantity | 500 |
| Who Monitors Reorders | Customer Service |
| Business Justification | Customer orders monthly and wants same-week delivery. Stocking 3 months avoids rush charges. |

**Manufacturing:** Process **Litho**, Outside Purchase **No**

**Estimating**

| Field | Value |
| --- | --- |
| Estimate | `Northwind_Estimate.pdf` |
| Estimator | Your name |
| Estimating System | PSI |
| 1 month | Quantity 1200, Cost 1050 |
| 2 months | Quantity 2000, Cost 1700 |
| 3 months | Quantity 3000, Cost 2400 |
| Number of Skids | 2 |

**Manufacturing 2:** approve **3 Months**

**Accounting:** PSI Number **PSI-104522**

**Web Support:** Veracore Number **VC-88317**

---

## Part 1: One request, start to finish

### Scene 1 — The records list (1 min)

**Do:** Start on the **SOMI Form** home page.

**Say:**
- "This is every SOMI request in one place, newest first."
- "The **Status** column shows where each one is. Yellow means it's in progress, green means it's
  done, red means it was denied, and gray means it was canceled."
- "No more chasing emails to find out who has a request."

---

### Scene 2 — Sales submits a request (2 min)

**Do:**
1. Click **Add Record**.
2. Click **Submit** straight away, with the form empty.

**Say:** "The form won't let a request through without the basics: customer, item, consumption and a
business justification."

**Do:**
3. Fill in the Sales fields from the demo data. Set **Are Reorder Points Established** to **No**
   first, then change it to **Yes**.

**Say:** "Questions only show up when they're relevant. The reorder point fields only appear once
we say reorder points are established."

**Do:**
4. Click **Submit**.

**Say:** "That's Sales done. The request now has its own page, and its status is **Pending Process
Approval**, so it's waiting on Manufacturing."

---

### Scene 3 — A tour of the record page (1 min)

**Do:** Point to each area as you go.

**Say:**
- "Up top: the **status**, and the key details: item, customer, customer number and date."
- "The **Stage** drop-down picks which department we're acting as. For the demo, I'll play every
  department."
- "On the right, the **Progress Tracker** shows all seven steps. Step 1 is ticked off with who did
  it and when, and the highlighted step is next: Manufacturing's review."
- "Below that is **Documents**. Nothing's been uploaded yet."
- "The main area shows everything entered so far. The cost calculations are empty for now, and fill
  in once the estimate is approved."

---

### Scene 4 — Manufacturing reviews the request (1 min)

**Do:**
1. The Stage drop-down has already switched to **Manufacturing**. Point that out.
2. Click **Approve**.
3. Choose **Litho** and **Outside Purchase: No**. In Comments, type "Standard litho run, no
   concerns."
4. Click **Submit**.

**Say:**
- "The form moved to Manufacturing by itself, because that's who's up next."
- "Each department only sees its own questions."
- "Comments go with the decision and show in the Progress Tracker under that step, so the next
  person sees the context."

---

### Scene 5 — Estimating submits the estimate (2 min)

**Do:**
1. Stage is now **Estimating**. Click **Submit Estimate**.
2. Upload `Northwind_Estimate.pdf` and fill in the rest from the demo data.
3. Click **Submit**.

**Say:**
- "Estimating prices up three options: one, two and three months of inventory."
- "The estimate file is stored with the request."

**Do:** Point at the **Documents** card. The Estimate now has a download button.

**Say:** "Anyone looking at the request can download the estimate from here. No digging through
shared drives."

---

### Scene 6 — Manufacturing approves the months of inventory (2 min)

**Do:**
1. Stage is now **Manufacturing 2**. Click **Approve**.
2. Point out that the table shows Estimating's three options.
3. Select **3 Months** and click **Submit**.

**Say:** "Manufacturing picks how much inventory to carry. That choice drives the pricing."

**Do:** Scroll up to the calculation cards that just appeared.

**Say:** "The form now works out the full SOMI cost worksheet on its own:"

| Card | Value | Talking point |
| --- | --- | --- |
| Unit DM Cost from Est | $0.80 | $2,400 ÷ 3,000 units |
| Mos. of Est Inventory | 3 | 3,000 units ÷ 1,000 a month |
| Storage Charge | $126.00 | 2 skids × $21 × 3 months |
| Mark-Up at 1.61 | $1.29 | |
| Unit Storage /mo. | $0.13 | |
| Unit Cost to Carry /mo. | $0.01 | Interest on the money tied up in stock |
| **Sell Price** | **$1.42** | "This is the TSP Sales will confirm next." |

**Say:** "No spreadsheet and no retyping, so no copy-paste mistakes."

---

### Scene 7 — Sales confirms the TSP (1 min)

**Do:**
1. Stage is now **Sales 2**. Click **Approve**.
2. Point at the checkbox label: **Confirm $1.42 TSP**.
3. Tick it and click **Submit**.

**Say:** "Sales sees exactly the price they're agreeing to, worked out from the approved estimate."

---

### Scene 8 — Accounting and Web Support finish it off (2 min)

**Do:**
1. Stage is now **Accounting**. Click **Enter PSI Number**, type **PSI-104522**, and click **Submit**.
2. Stage is now **Web Support**. Click **Enter Veracore Number**, type **VC-88317**, and click
   **Submit**.

**Say:** "The last two steps are just setting up the item in our systems. Both numbers are required,
so a request can't be marked approved without them."

**Do:** Point at the status badge, now green **Approved**, and the Progress Tracker with every step
ticked.

**Say:** "That's the full trail: every step, who did it, when, and their comments."

**Do (optional):** Switch Stage to **Accounting** and show the **Edit PSI Number** button.

**Say:** "If a number was typed wrong, Accounting or Web Support can fix it without redoing anything
else."

**Do:** Click **Back to records**. Northwind Clinics is at the top with a green badge and its PSI and
Veracore numbers showing.

---

## Part 2: When things don't go to plan

### Scene 9 — Sending a request back (3 min)

**Do:** Open **Record B (Lakeside Pharmacy)**.

**Say:** "Say Sales looks at this price and the customer's numbers have changed, so we need a new
estimate."

**Do:**
1. In the Progress Tracker, hover over the undo button (↺) on **Enter estimate & details**. The
   tooltip says *Back to this step*.
2. Click it and read the confirmation aloud.

**Say:** "It warns us that this step and every step after it will be undone. That's on purpose: if
the estimate changes, Manufacturing's approval of the old estimate doesn't count any more."

**Do:**
3. Click **Yes**.
4. Point out:
   - the status is back to **Process Approved**
   - the red *"Reverted to … by … on …"* line on the step
   - the estimate details and calculations are cleared
   - the Estimate document shows **Not Submitted** again

**Say:** "Nothing is quietly overwritten, and the tracker keeps a record that it was sent back and by
whom. Estimating now redoes the estimate, and it flows through the same approvals again."

---

### Scene 10 — Denying a request (2 min)

**Do:** Open **Record C (Harbor Auto Group)**. Set Stage to **Manufacturing** and click **Deny**.

**Do:** Click **Submit** without typing a comment.

**Say:** "To deny a request you have to say why. Nobody gets a 'no' without a reason."

**Do:** Type "Item is changing artwork next quarter, not a good candidate to stock." and click
**Submit**.

**Do:** Point at the red **Denied** badge and the red step in the Progress Tracker with the reason.

**Say:**
- "The request stops here. The steps after it are hidden, and nobody can act on it any more."
- "Denied is final, so it's a deliberate decision."

---

### Scene 11 — Canceling, and bringing a request back (1 min)

**Do:** Open **Record D (Summit Credit Union)**. Set Stage to **Sales**, click **Cancel**, type "Customer
put the project on hold," and click **Submit**.

**Say:** "Sales can cancel a request if the customer pulls out. It goes gray, and the tracker shows
who canceled it and why."

**Do:** Click the undo button on **Manufacturing to review request**, then click **Yes**.

**Say:** "If the customer comes back, we don't start from scratch. Send it back to a step and it
picks up again from there."

---

## Part 3: Wrap-up (2 min)

**Say:**
- "One form for the whole SOMI process, from request to setup."
- "Everyone can see where every request is and who has it."
- "The pricing math is done for you."
- "A full trail of who did what, and why."

**Questions to expect:**

| Question | Answer |
| --- | --- |
| "How do I know it's my turn?" | Check the status, or the highlighted step in the Progress Tracker. Open the request, choose your department, and if you see buttons, it's waiting on you. |
| "Can I change something after I've approved it?" | Ask for the request to be sent back to your step. Accounting and Web Support can edit their numbers directly. |
| "Can a denied request be reopened?" | Not in the form. Denying is final. |
| "Where do the cost numbers come from?" | The quantity and cost for the approved months, the customer's monthly consumption, and the number of skids. The full formulas are in the user guide. |
| "Will I always have to pick my department?" | Choosing a stage is how the demo plays every department. *(Update this answer once stages come from sign-in.)* |

**Close:** Point people to [USER_GUIDE.md](USER_GUIDE.md) for the full guide.

---

## Things to avoid during the demo

These are known gaps in the current version. Stay clear of them on stage.

- **Don't cancel a request that has only been submitted.** It can't be revived, because there's no
  finished step to go back to. Use Record D for the cancel scene.
- **On a canceled request, don't switch to a stage that hasn't acted yet.** Its Approve or Submit
  buttons still show and would move the canceled request forward.
- **Don't promise a Customer Agreement upload.** The Documents card lists it, but there's no way to
  upload one in the form yet.
- **The step label reads "Manuacturing to review request"** (a typo) unless it has been fixed. Fix it
  before the demo, or be ready for someone to notice.
- **Approve 3 months in Scene 6, as scripted.** The numbers in the talking points are for 3 months.
  Also, if an approved quantity equals the monthly consumption exactly, the sell price shows as a
  dash, so don't change the demo data on the fly.
