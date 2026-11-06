# SOMI Form — User Guide

The SOMI Form takes a SOMI (stocked inventory) request from the first sales request to final setup.
Each department completes its own step in order. The form tracks where the request is, who did each
step, and any comments left along the way.

---

## Contents

1. [The records list](#the-records-list)
2. [Creating a new request](#creating-a-new-request)
3. [The record page](#the-record-page)
4. [Choosing your stage](#choosing-your-stage)
5. [The workflow, step by step](#the-workflow-step-by-step)
6. [Statuses and what they mean](#statuses-and-what-they-mean)
7. [Approving, denying, submitting and canceling](#approving-denying-submitting-and-canceling)
8. [Comments](#comments)
9. [The Progress Tracker](#the-progress-tracker)
10. [Going back to an earlier step](#going-back-to-an-earlier-step)
11. [Documents](#documents)
12. [Quantity and cost calculations](#quantity-and-cost-calculations)
13. [Quick reference](#quick-reference)

---

## The records list

The home page, **SOMI Form**, lists every request with the newest first. It shows:

| Column | What it shows |
| --- | --- |
| Date | The date Sales entered on the request |
| Customer Name / Customer Number | The customer the request is for |
| Item Name | The item to be stocked |
| Process | The production process Manufacturing chose |
| Estimator | Who prepared the estimate |
| PSI Number / Veracore Number | Filled in by Accounting and Web Support at the end |
| Status | Where the request is in the workflow (see [Statuses](#statuses-and-what-they-mean)) |

- Click **View** to open a request.
- Click **Add Record** to start a new request.

---

## Creating a new request

New requests are entered by **Sales**. Click **Add Record**, fill in the form, and click **Submit**.

| Field | Required? | Notes |
| --- | --- | --- |
| Date | Yes | |
| Customer Name | Yes | |
| Customer Number | Yes | |
| Item Name | Yes | |
| Customer Consumption per Month | Yes | How many units the customer uses each month. Used in the cost calculations. |
| Item Product Sold at Storefront | — | Yes / No |
| Item Product Sold with Kits | — | Yes / No |
| Customer Accepts Responsibility for Obsolete or Slow-Moving Inventory | — | Yes / No |
| Customer Signed SOMI Agreement | — | Yes / No |
| Are Reorder Points Established | — | Yes / No. Answering **Yes** shows the next two fields. |
| Reorder Point Quantity | Yes, if reorder points are established | |
| Who Monitors Reorders | Yes, if reorder points are established | |
| Business Justification | Yes | Why the item should be stocked |

After you submit, the request is saved with the status **Pending Process Approval**. The page then
switches to the new record, and the request moves on to Manufacturing.

---

## The record page

When you open a request you'll see:

- **The header**: the request's current **status** badge, the **Stage** drop-down, and a summary with
  the Item, Customer, Customer # and Date. The buttons for your stage appear on the right of the
  summary.
- **Quantity and cost calculations**: shown once Manufacturing has approved a number of months of
  inventory (see [Calculations](#quantity-and-cost-calculations)).
- **SOMI Details**: everything Sales and Manufacturing entered. A blank value means it hasn't been
  filled in yet.
- **Estimate Details** and **Quantity Estimated**: what Estimating entered, with a check mark on the
  months Manufacturing approved.
- **Sidebar**: the **Progress Tracker** and the **Documents** list.

---

## Choosing your stage

Use the **Stage** drop-down at the top of a record to choose the department you're acting for:

> Sales · Manufacturing · Estimating · Manufacturing 2 · Sales 2 · Accounting · Web Support

The buttons next to the summary change to match the stage you choose. When a stage finishes its
step, the drop-down automatically switches to the next stage in line.

---

## The workflow, step by step

A request goes through seven steps in this order. Each step is done by one stage, and finishing it
moves the request to a new status.

| # | Step | Done by | What they do | Status afterwards |
| --- | --- | --- | --- | --- |
| 1 | **Submit request** | Sales | Enter the customer, item and justification | Pending Process Approval |
| 2 | **Manufacturing to review request** | Manufacturing | Choose the process and approve, or deny | Process Approved |
| 3 | **Enter estimate & details** | Estimating | Upload the estimate and enter quantities and costs | Pending Estimate Approval |
| 4 | **Manufacturing to review estimate** | Manufacturing 2 | Choose how many months of inventory to approve, or deny | Pending TSP Approval |
| 5 | **Sales to review TSP** | Sales 2 | Confirm the sell price (TSP), or deny | Approved Pending PSI Number |
| 6 | **Enter PSI number** | Accounting | Enter the PSI number | Approved Pending Veracore Number |
| 7 | **Enter Veracore number** | Web Support | Enter the Veracore number | **Approved** |

### Step 1 — Submit request (Sales)

Sales creates the request (see [Creating a new request](#creating-a-new-request)). After that,
Sales's only button on the record is **Cancel**.

### Step 2 — Manufacturing to review request (Manufacturing)

Click **Approve** or **Deny**.

When approving, fill in:

- **Process to Produce Product**: Litho, Digital or EB
- **Outside Purchase**: Yes / No
- **Comments** (optional)

### Step 3 — Enter estimate & details (Estimating)

Click **Submit Estimate** and fill in:

- **Estimate**: upload the estimate file
- **Estimator**
- **Estimating System**: PSI, Filemaker or Print IQ
- **Quantity Estimated**: a quantity and manufacturing cost for **1, 2 and 3 months** of inventory
- **Number of Skids Required to Inventory Item**
- **Comments** (optional)

Estimating doesn't approve or deny. It only submits the estimate. Once it's submitted, the button
goes away. To redo the estimate, [go back](#going-back-to-an-earlier-step) to this step.

### Step 4 — Manufacturing to review estimate (Manufacturing 2)

Click **Approve** or **Deny**.

When approving, choose the **Approved Months of Inventory**. The table shows each option (1, 2 or 3
months) with the quantity and manufacturing cost Estimating entered. Pick one.

The approved months drive the [calculations](#quantity-and-cost-calculations), including the sell
price.

### Step 5 — Sales to review TSP (Sales 2)

Click **Approve** or **Deny**.

When approving, tick **Confirm $X.XX TSP**. The amount shown is the sell price worked out from the
approved estimate.

### Step 6 — Enter PSI number (Accounting)

Click **Enter PSI Number** and type in the **PSI Number** (required).

If the number needs correcting later, Accounting can click **Edit PSI Number**.

### Step 7 — Enter Veracore number (Web Support)

Click **Enter Veracore Number** and type in the **Veracore Number** (required).

Once it's saved, the request's status becomes **Approved** and the workflow is complete. If the
number needs correcting later, Web Support can click **Edit Veracore Number**.

---

## Statuses and what they mean

The status badge shows the **last step that was finished**. That also tells you **who needs to act
next**.

| Status | Badge | Meaning | Waiting on |
| --- | --- | --- | --- |
| **Pending Process Approval** | Yellow | Sales has submitted the request | Manufacturing to review the request |
| **Process Approved** | Yellow | Manufacturing approved the process | Estimating to submit an estimate |
| **Pending Estimate Approval** | Yellow | Estimating submitted the estimate | Manufacturing 2 to approve the months of inventory |
| **Pending TSP Approval** | Yellow | Manufacturing approved the estimate | Sales 2 to confirm the TSP |
| **Approved Pending PSI Number** | Yellow | Sales confirmed the TSP | Accounting to enter the PSI number |
| **Approved Pending Veracore Number** | Yellow | Accounting entered the PSI number | Web Support to enter the Veracore number |
| **Approved** | Green | Every step is done | Nobody. The request is complete. |
| **Denied** | Red | A reviewing stage turned the request down | Nobody. The request is closed. |
| **Canceled** | Gray | Sales canceled the request | Nobody, unless the request is sent back to an earlier step |

---

## Approving, denying, submitting and canceling

Each stage has its own buttons:

| Stage | Buttons |
| --- | --- |
| Sales | **Cancel** |
| Manufacturing | **Approve**, **Deny** |
| Estimating | **Submit Estimate** |
| Manufacturing 2 | **Approve**, **Deny** |
| Sales 2 | **Approve**, **Deny** |
| Accounting | **Enter PSI Number**, later **Edit PSI Number** |
| Web Support | **Enter Veracore Number**, later **Edit Veracore Number** |

Clicking a button opens a panel on the right with that stage's fields. Fill it in and click
**Submit**. To close the panel without saving, click the **X**.

**Things to know:**

- **Approve** saves your stage's fields and moves the request on to the next step.
- **Deny** only asks for a comment, and **the comment is required**. Your stage's fields aren't
  saved. A denied request is **closed for good**: no stage can act on it again, and it can't be sent
  back to an earlier step.
- **Cancel** (Sales only) stops the request. A comment is optional. A canceled request stays paused
  until someone [sends it back to an earlier step](#going-back-to-an-earlier-step).
- A reviewing stage only approves or denies **once**. After that its buttons go away. If a stage
  needs to review again, send the request back to that stage's step.
- Your buttons won't appear when there's nothing left for your stage to do.

---

## Comments

Every panel has a **Comments** box. Comments are saved along with your decision. You can't leave a
comment on its own.

Comments appear in the **Progress Tracker** under the step of the stage that wrote them, oldest
first:

- **Comments:** left when approving or submitting
- **Denial comments:** / **Cancellation comments:** left when denying or canceling

A comment's line breaks are kept as you typed them.

---

## The Progress Tracker

The **Progress Tracker** in the sidebar lists the seven steps and shows how far the request has got.

| Icon | Meaning |
| --- | --- |
| Green check | The step is done. Below it: who did it and when, for example *"Approved by Manufacturing on 11/6/2026, 10:42 AM"*. |
| Highlighted dot | The step that's up next. |
| Empty, grayed-out circle | A step still to come. |
| Red text | The request was sent back to this step: *"Reverted to … by … on …"*. |

**Denied requests:** the step where the request was denied is shown in red, with who denied it, when,
and their comment. The steps after it are hidden.

**Canceled requests:** a red **Request Canceled** item appears after the last finished step, with who
canceled it, when and why. Every remaining step is grayed out.

If a step has been done more than once (because the request was sent back), every time is listed in
order.

---

## Going back to an earlier step

You can send a request back to redo a step, for example if the estimate needs to change, or to revive
a canceled request.

1. In the **Progress Tracker**, find the finished step you want to redo.
2. Click the **undo** button (↺, labeled *Back to this step*) on that step.
3. Read the confirmation and click **Yes**.

**What happens:**

- The request goes back to the status it had **before** that step.
- **Everything entered in that step and every step after it is deleted**, along with those steps'
  comments. Each of those stages has to do its step again.
- If the Estimating step is undone, the uploaded **estimate file is deleted** too.
- If the request was canceled, the cancellation (and its comment) is removed.
- The step shows a red *"Reverted to … by … on …"* line, so there's a record that it happened.

> **This can't be undone.** Data that's cleared doesn't come back, so check you've picked the right
> step.

**Limits:**

- **Submit request** (step 1) can't be gone back to, since nothing comes before it.
- **Denied** requests can't be sent back.

---

## Documents

The **Documents** card in the sidebar lists the request's files:

| Document | Notes |
| --- | --- |
| **Estimate** | Uploaded by Estimating in step 3. If a new estimate is submitted later, it replaces the old one. |
| **Customer Agreement** | The customer's signed SOMI agreement. |

Click the **download** button next to a document to save it. **Not Submitted** means nothing has
been uploaded yet.

---

## Quantity and cost calculations

Once Manufacturing 2 has approved a number of months, the top of the record shows the SOMI cost
worksheet. Until then, a note explains that the calculations will appear later.

The calculations use the **quantity and manufacturing cost for the approved months**, plus Sales's
**monthly consumption** and Estimating's **number of skids**.

| Calculation | How it's worked out |
| --- | --- |
| **Est Qty on Hand /mo.** | Approved quantity − monthly consumption |
| **Unit DM Cost from Est** | Approved manufacturing cost ÷ approved quantity |
| **Est Value of SOMI @ DM** | Est qty on hand × unit DM cost |
| **Mos. of Est Inventory** | Approved quantity ÷ monthly consumption |
| **Storage Charge** | Number of skids × $21 per skid per month × months of inventory |
| **Mark-Up at 1.61** | Unit DM cost × 1.61 |
| **Unit Storage /mo.** | Storage charge ÷ monthly consumption |
| **Interest Rate /mo.** | 12.5% a year ÷ 12 (about 1.042%) |
| **Cost to Carry /mo.** | Est value of SOMI × monthly interest rate |
| **Unit Cost to Carry /mo.** | Cost to carry ÷ est qty on hand |
| **Sell Price** | Mark-up + unit storage + unit cost to carry |

A **dash (-)** means a value can't be worked out yet because something it depends on is missing (for
example, the number of skids is blank).

The **Sell Price** is the TSP that Sales 2 confirms in step 5.

---

## Quick reference

**"What do I need to do?"** Open the request, choose your department in **Stage**, and use the
buttons that appear. No buttons means there's nothing for you to do right now.

**"Who has it now?"** Look at the highlighted step in the **Progress Tracker**, or check the
[status table](#statuses-and-what-they-mean).

**"Something was entered wrong in an earlier step."** Use the undo button on that step in the
Progress Tracker. Remember that this clears that step **and every step after it**. Accounting and
Web Support can correct their numbers directly with **Edit PSI Number** / **Edit Veracore Number**.

**"The request was denied by mistake."** Denied requests can't be reopened in the form. Contact
whoever manages the SOMI Form.
