# Day 7 Demo Scenario: SevaSync Disaster Response Platform

**Duration:** 3-5 minutes  
**Objective:** Demonstrate SevaSync as an inclusive, measurable disaster response platform with IVR capabilities, reporting, and impact analytics.

---

## Scene 1: Login & Dashboard (30 seconds)

**Goal:** Show the platform is live and ready

1. Start at login page: `localhost:5173/login`
   - Email: `admin@sevasync.local`
   - Password: `demo`
   - Click "Sign In"

2. Dashboard loads showing:
   - Active disasters: 3 (Hyderabad Floods, Chennai Water Crisis, Kerala Landslides)
   - Total volunteers: 142
   - Tasks completed: 456/500
   - Overview cards with real-time stats

**Key Message:** "SevaSync is a comprehensive disaster response platform connecting 142 volunteers across 3 active disasters."

---

## Scene 2: IVR Simulator (2 minutes)

**Goal:** Show how feature-phone users (35% of volunteers) can participate via IVR

### Path: `/ivr/simulator`

**Setup:**
1. Click "IVR Simulator" in sidebar → Opens simulator page
2. Select volunteer: **"Priya Singh"** (Hindi speaker)
3. Click **"Start Call"**

**Call Flow:**
- Status changes: `idle` → `ringing` (2 sec) → `active`
- Timeline shows: "Incoming call from simulator to Priya Singh"
- IVR Prompt displays: `"Press 1 for tasks, 2 to log hours, 3 for wellness check, 0 to disconnect"`

**User Interaction:**
1. Press **"1"** on keypad (Get Nearby Tasks)
   - Timeline logs: "Digit pressed: 1"
   - Highlight "Get Nearby Tasks" action
2. Press **"2"** on keypad (Log Work Hours)
   - Highlight "Log Work Hours" action
3. Press **"3"** on keypad (Wellness Check-in)
   - Highlight "Wellness Check-in" action
   - Timeline logs: "Action selected: wellness_checkin"

**Key Message:** "35% of our volunteers use feature phones. Our IVR system lets them press digits to report tasks, log hours, and check in—no internet required."

---

## Scene 3: IVR Call History & Analytics (45 seconds)

**Goal:** Show IVR adoption and volunteer engagement

### Path: `/ivr/history`

1. Click "IVR Call History" in sidebar
2. Show the call list with 50 realistic calls:
   - Filter by **Status**: Show "Completed" calls (most recent)
   - Show statistics:
     - Total Calls: ~500
     - Completed: 85%
     - Failed: 5%
     - Missed: 10%
     - Avg Duration: 3:45

3. (Optional) Click "Export as CSV" to show export capability

**Key Message:** "Our IVR system has 500+ calls/week with 85% completion rate, proving feature-phone volunteers are highly engaged."

---

## Scene 4: Reports & Export (1 minute)

**Goal:** Show reporting and export capabilities for NGOs

### Path: `/reports`

1. Click "Reports" in sidebar
2. Show 6 report types:
   - IVR Call Summary
   - Volunteer Performance
   - Task Analytics
   - Impact Metrics
   - Disaster Report
   - Data Sync Report

3. Click **"IVR Call Summary"** report
   - Show report preview with metrics
   - Highlight **"Export as PDF"** button
   - Mention: PDF exports include charts, tables, and executive summaries

4. Show **"Volunteer Performance"** report
   - Click **"Export as CSV"** to show data export for analysis

**Key Message:** "NGOs can generate professional reports and export data for donor reporting, impact analysis, and decision-making."

---

## Scene 5: Impact Analytics Dashboard (1 minute)

**Goal:** Show measurable disaster response impact

### Path: `/impact-analytics`

1. Click "Impact Analytics" in sidebar
2. Showcase **8 KPI Cards:**
   - 👥 **12,000** people helped
   - ⚡ **2,840** volunteer hours
   - ✓ **456** tasks completed
   - 💪 **142** active volunteers
   - 📊 **35%** IVR adoption
   - 🌍 **3** active disasters
   - ⏱️ **12** min avg response time
   - 📈 **91%** success rate

3. Scroll down to **Recent Impact Stories:**
   - **Story 1:** Hyderabad Flood Relief - 2,500 people, 45 volunteers, 340 hours
   - **Story 2:** Chennai Water Crisis - 5,000 people, 38 volunteers, 420 hours
   - **Story 3:** Kerala Landslide - 1,200 people, 72 volunteers, 580 hours

4. Show **Overall Impact Summary:**
   - Total people impacted: 12,000+
   - Volunteer contributions: 2,840 hours
   - Avg hours per volunteer: 20
   - Cost per person: ₹237

**Key Message:** "SevaSync doesn't just coordinate—it measures impact. 12,000 people helped, 2,840 volunteer hours, 91% task completion rate. Every action is tracked and quantified."

---

## Scene 6: Mobile Responsiveness (30 seconds - if time allows)

**Goal:** Show platform works on feature phones and mobile devices

1. Open Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test viewport sizes:
   - **Mobile (375px):** IVR Simulator keypad, report cards responsive
   - **Tablet (768px):** Two-column layouts work well
   - **Desktop (1920px):** Full-featured dashboard

**Key Message:** "SevaSync is built mobile-first because many volunteers use feature phones and older devices."

---

## Demo Timeline Summary

| Time | Scene | Action | Duration |
|------|-------|--------|----------|
| 0:00 | Login | Sign in to dashboard | 30s |
| 0:30 | IVR Simulator | Simulate call, press digits, select actions | 2:00 |
| 2:30 | IVR History | Show call history, filter, export CSV | 45s |
| 3:15 | Reports | Generate IVR & volunteer reports, export PDF | 1:00 |
| 4:15 | Impact Analytics | Show KPIs, impact stories, summary | 1:00 |
| 5:15 | Mobile Test | Show responsive design on mobile | 30s |
| **5:45** | **END** | **Q&A** | |

---

## Key Talking Points

### Why SevaSync Matters
- **Inclusive:** IVR system supports feature-phone users (35% of volunteers)
- **Measurable:** Every action tracked, quantified, and reported
- **Real-Time:** Live dashboards for disaster coordinators
- **Data-Driven:** Export reports for donor reporting and impact analysis

### Technical Highlights
- **IVR Module:** Webhook-based, HMAC-signed, scales to 500+ calls/week
- **Reports:** PDF + CSV exports with @react-pdf/renderer
- **Analytics:** Real-time KPIs, trend analysis, per-volunteer tracking
- **Mobile:** Fully responsive, optimized for 3G networks

### Disaster Response Impact
- **12,000+ people helped** across 3 active disasters
- **2,840 volunteer hours** contributed
- **456 tasks completed** (91% completion rate)
- **142 volunteers** actively engaged
- **35% adoption** of IVR system

---

## Troubleshooting

**If call doesn't connect:**
- Refresh page
- Select a different volunteer
- Check browser console for errors

**If reports don't load:**
- Ensure backend is running (`npm run dev` in backend folder)
- Check API logs

**If mobile view doesn't work:**
- Clear browser cache
- Open in private/incognito mode
- Zoom to 100% (Ctrl+0)

---

## Post-Demo Notes

- Save screenshots of impact analytics for slides
- Note volunteer adoption rate (35%) for impact narrative
- Highlight cost efficiency: ₹237 per person helped
- Mention IVR success rate (85%) for mobile coverage claims
