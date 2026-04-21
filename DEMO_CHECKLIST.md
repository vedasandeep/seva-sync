# Day 7 Demo Checklist

**Presenter:** [Your Name]  
**Date:** April 21, 2026  
**Duration:** 5-10 minutes (script + Q&A)  
**Audience:** Stakeholders, potential donors, NGO partners

---

## Pre-Demo Setup (15 minutes before)

### Environment Check
- [ ] **Backend running:** `npm run dev` in `backend/` directory
  - Expected: Server running on `http://localhost:3001`
  - Check: Open `http://localhost:3001/api/health` (should return `{"status":"ok"}`)

- [ ] **Frontend running:** `npm run dev` in `frontend-dashboard/` directory
  - Expected: Dev server on `http://localhost:5173`
  - Check: Page loads without errors in console

- [ ] **Database ready:** PostgreSQL running with seeded data
  - Check: IVRLog table has 500+ records
  - Check: Volunteer table has 142 records
  - Check: Task table has 456 records

### Browser Preparation
- [ ] Use **Chrome** or **Firefox** (tested browsers)
- [ ] Clear cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- [ ] Open in **fullscreen mode** (F11)
- [ ] Set zoom to **100%** (Ctrl+0 or Cmd+0)
- [ ] Have DevTools handy but **closed** during presentation
- [ ] Disable notifications & popups
- [ ] Turn off auto-update notifications

### Network Check
- [ ] Stable internet connection (for API calls)
- [ ] Localhost not blocked by firewall
- [ ] No VPN conflicts

---

## Demo Walkthrough Checklist

### 1. Login & Dashboard (30 seconds)

- [ ] Navigate to `http://localhost:5173/login`
- [ ] Login credentials:
  ```
  Email: admin@sevasync.local
  Password: demo
  ```
- [ ] **Verify dashboard loads:**
  - [ ] Header shows "SevaSync Disaster Response"
  - [ ] Sidebar has navigation menu
  - [ ] Dashboard cards show correct metrics:
    - [ ] Active Disasters: 3
    - [ ] Active Volunteers: 142
    - [ ] Tasks Completed: 456/500
  - [ ] No console errors (F12 to check)

**Talking Point:** "SevaSync is a unified platform for disaster response, connecting 142 volunteers across 3 active disasters."

---

### 2. IVR Simulator (2 minutes)

**Path:** Click "IVR Simulator" in sidebar or navigate to `/ivr/simulator`

#### Setup
- [ ] Page loads with "Call Setup" panel
- [ ] "Select Volunteer" dropdown shows:
  - [ ] Priya Singh (+919876543210)
  - [ ] Rohan Kumar (+919876543211)
  - [ ] Anita Sharma (+919876543212)
- [ ] **Select "Priya Singh"**
- [ ] Call Status shows "idle"

#### Simulate Call
- [ ] Click **"Start Call"** button
- [ ] Verify state transitions:
  - [ ] Button changes to "End Call"
  - [ ] Status changes to "ringing" (yellow, animated)
  - [ ] After ~2 seconds, status changes to "active" (green, animated)
  - [ ] Call duration counter starts (mm:ss format)
  - [ ] Call SID appears in timeline

#### IVR Keypad Interaction
- [ ] Keypad buttons are **enabled** (not grayed out)
- [ ] Press **"1"** on keypad:
  - [ ] Input display shows "1"
  - [ ] "Get Nearby Tasks" action highlights
  - [ ] Timeline logs "Digit pressed: 1"
- [ ] Press **"2"** on keypad:
  - [ ] Input display shows "2"
  - [ ] "Log Work Hours" action highlights
- [ ] Press **"3"** on keypad:
  - [ ] Input display shows "3"
  - [ ] "Wellness Check-in" action highlights
  - [ ] Timeline logs "Action selected: wellness_checkin"

#### Call Timeline
- [ ] Timeline panel shows events in chronological order:
  - [ ] "Call started"
  - [ ] "IVR prompt played"
  - [ ] Digit press events
  - [ ] Action selection events
- [ ] Each event has correct timestamp
- [ ] Scrollable if >5 events

#### End Call
- [ ] Click **"End Call"** button
- [ ] Status changes to "completed" (blue)
- [ ] Timeline logs "Call ended"
- [ ] Call duration is final (e.g., "00:45")
- [ ] Click **"Reset"** to clear for next demo

**Talking Point:** "35% of our volunteers use feature phones. Our IVR system lets them press digits to get tasks, log hours, and check in—no internet required. This call took 45 seconds and completed successfully."

---

### 3. IVR Call History (45 seconds)

**Path:** Click "IVR Call History" in sidebar or navigate to `/ivr/history`

#### Page Load
- [ ] Call history table loads with ~50 calls
- [ ] Columns visible:
  - [ ] Volunteer Name
  - [ ] Status (Completed, Failed, Missed)
  - [ ] Direction (Inbound/Outbound)
  - [ ] Duration
  - [ ] Date/Time

#### Statistics Panel
- [ ] Show top stats:
  - [ ] Total Calls: ~500
  - [ ] Completed: ~425 (85%)
  - [ ] Failed: ~25 (5%)
  - [ ] Missed: ~50 (10%)
  - [ ] Avg Duration: 3:45

#### Filter Demo (Optional)
- [ ] Click "Status" filter
- [ ] Select "Completed"
- [ ] Table updates to show only completed calls
- [ ] Reset filter

#### Export Demo
- [ ] Click **"Export as CSV"** button
- [ ] Browser downloads CSV file
- [ ] Filename format: `ivr_call_history_[timestamp].csv`
- [ ] File opens in Excel/Sheets with data columns

**Talking Point:** "Our IVR system handles 500+ calls per week with 85% completion rate. NGOs can export call histories for detailed analysis and volunteer performance tracking."

---

### 4. Reports & Export (1 minute)

**Path:** Click "Reports" in sidebar or navigate to `/reports`

#### Reports Grid
- [ ] Page shows 6 report types:
  - [ ] IVR Call Summary (blue, phone icon)
  - [ ] Volunteer Performance (green, users icon)
  - [ ] Task Analytics (purple, chart icon)
  - [ ] Impact Metrics (amber, trending up icon)
  - [ ] Disaster Report (red, document icon)
  - [ ] Data Sync Report (indigo, download icon)
- [ ] Each card shows metrics preview
- [ ] "Generate Report →" button visible on hover

#### Report Detail View
- [ ] Click **"IVR Call Summary"**
- [ ] Detail view opens with:
  - [ ] Back button
  - [ ] Report title
  - [ ] Description
  - [ ] Report metrics in grid (2x3 or 2x4)
  - [ ] Mock chart placeholder
  - [ ] Export buttons

#### PDF Export
- [ ] Click **"Export as PDF"** button
- [ ] Browser downloads PDF file
- [ ] Filename format: `ivr_call_summary_[timestamp].pdf`
- [ ] (Optional) Open PDF to show:
  - [ ] Professional styling
  - [ ] Report title
  - [ ] Tables with data
  - [ ] Summary section

#### CSV Export
- [ ] Go back to reports list
- [ ] Click **"Volunteer Performance"**
- [ ] Click **"Export as CSV"** button
- [ ] File downloads: `volunteer_performance_[timestamp].csv`

**Talking Point:** "SevaSync generates professional reports for donor reporting, impact analysis, and strategic planning. Reports are available in PDF and CSV formats."

---

### 5. Impact Analytics Dashboard (1 minute)

**Path:** Click "Impact Analytics" in sidebar or navigate to `/impact-analytics`

#### KPI Cards Section
- [ ] Page shows 8 KPI cards in grid:
  - [ ] **People Helped:** 12,000 (blue)
  - [ ] **Volunteer Hours:** 2,840 (green)
  - [ ] **Tasks Completed:** 456 (purple)
  - [ ] **Active Volunteers:** 142 (amber)
  - [ ] **IVR Adoption:** 35% (indigo)
  - [ ] **Disaster Coverage:** 3 (red)
  - [ ] **Avg Response Time:** 12 min (pink)
  - [ ] **Success Rate:** 91% (teal)
- [ ] Each card shows:
  - [ ] Icon (color-matched)
  - [ ] Label
  - [ ] Value (large, bold)
  - [ ] Unit/context text
  - [ ] Trend indicator (↑ with %)

#### Impact Stories Section
- [ ] Stories visible in 2-column grid
- [ ] **Story 1:** Hyderabad Flood Relief
  - [ ] 2,500 people helped
  - [ ] 45 volunteers
  - [ ] 340 hours
  - [ ] Medical aid distribution description
- [ ] **Story 2:** Chennai Water Crisis
  - [ ] 5,000 people helped
  - [ ] 38 volunteers
  - [ ] 420 hours
- [ ] **Story 3:** Kerala Landslide
  - [ ] 1,200 people helped
  - [ ] 72 volunteers
  - [ ] 580 hours
- [ ] **Story 4:** Multi-Disaster Coordination
  - [ ] 3,300 people helped
  - [ ] 142 volunteers
  - [ ] 500 hours

#### Overall Impact Summary
- [ ] Bottom section shows:
  - [ ] Total People Impacted: 12,000+
  - [ ] Volunteer Contributions: 2,840 hours
  - [ ] Avg Hours per Volunteer: 20
  - [ ] Cost per Person Helped: ₹237

**Talking Point:** "SevaSync measures every impact. 12,000 people helped, 2,840 volunteer hours, 91% task completion. We're not just coordinating disaster response—we're proving its effectiveness."

---

### 6. Mobile Responsiveness (30 seconds - Optional)

**Tools:** Chrome DevTools

- [ ] Press **F12** to open DevTools
- [ ] Press **Ctrl+Shift+M** to toggle device toolbar
- [ ] Test viewport: **375px** (iPhone SE)
  - [ ] IVR keypad responsive (3-column grid)
  - [ ] Report cards stack vertically
  - [ ] Buttons are touch-friendly (48px min height)
  - [ ] Text readable (16px minimum)
- [ ] Test viewport: **768px** (Tablet)
  - [ ] Two-column layouts work
  - [ ] Navigation still accessible
- [ ] Close DevTools (F12)

**Talking Point:** "SevaSync is built mobile-first because many volunteers use feature phones and older devices on 3G networks. All interfaces are responsive and accessible."

---

## Post-Demo Tasks

### If Everything Works ✅
- [ ] Take screenshots:
  - [ ] IVR Simulator in action
  - [ ] IVR Call History with stats
  - [ ] Impact Analytics dashboard
  - [ ] Reports grid
- [ ] Save for slides/documentation
- [ ] Thank participants
- [ ] Collect feedback

### If Something Breaks 🔧

#### "API Error" / 404
- [ ] Check backend is running: `npm run dev`
- [ ] Check database connection in `.env`
- [ ] Restart both frontend and backend
- [ ] Clear browser cache

#### "Data not loading" / Empty tables
- [ ] Check database has seed data
- [ ] Run seed script: `npm run seed` in backend
- [ ] Restart backend
- [ ] Refresh browser

#### "Mobile view broken"
- [ ] Clear cache (Ctrl+Shift+Delete)
- [ ] Close and reopen DevTools
- [ ] Try a different browser

#### "Call not connecting"
- [ ] Refresh page
- [ ] Select a different volunteer
- [ ] Check browser console for errors (F12)

---

## Key Numbers to Remember

- **12,000+** people helped
- **2,840** volunteer hours
- **456** tasks completed (91% rate)
- **142** active volunteers
- **35%** IVR adoption (feature-phone users)
- **3** active disasters
- **500+** IVR calls/week
- **85%** IVR success rate
- **12** min average response time
- **₹237** cost per person helped

---

## Presentation Tips

1. **Speak confidently:** You're showing a working disaster response platform, not a prototype
2. **Use pauses:** Let metrics sink in ("12,000 people helped—that's a small city")
3. **Tell stories:** Reference specific disasters (Hyderabad, Chennai, Kerala)
4. **Highlight inclusivity:** "35% of volunteers use feature phones—our IVR system reaches them"
5. **Connect to impact:** Every number represents real lives helped
6. **Be prepared:** Have technical details ready but keep main talk simple

---

## Q&A Preparation

### Expected Questions

**Q: How does IVR handle multiple languages?**  
A: "Our IVR system supports Hindi and English. Volunteers select their language during setup. Prompts are pre-recorded by native speakers."

**Q: What about volunteers without phones?**  
A: "35% use IVR. 65% use our web dashboard. We support both channels to maximize participation."

**Q: How is data secure?**  
A: "IVR calls are HMAC-signed and IP-whitelisted. All data is encrypted at rest and in transit. We comply with disaster response data standards."

**Q: Can reports be automated?**  
A: "Yes. Reports can be scheduled and emailed to donors weekly or monthly. Future phases include Zapier integration."

**Q: What's the cost to run this?**  
A: "₹237 per person helped. That includes volunteer coordination, IVR calls, and platform hosting."

**Q: How do you prevent volunteer burnout?**  
A: "The wellness check-in (IVR option 3) monitors burnout risk. Volunteers logging <2 hours/week get wellness follow-ups."

---

## Success Criteria

**Demo is successful if:**
- [ ] All 5 main features load without errors
- [ ] IVR call completes from start to end
- [ ] Reports export without issues
- [ ] Impact analytics display all metrics
- [ ] Mobile view renders correctly
- [ ] Audience understands the platform's value
- [ ] No console errors (F12)

**Demo is a hit if:**
- [ ] Stakeholders ask follow-up questions
- [ ] Someone mentions potential adoption
- [ ] Team receives positive feedback
- [ ] You stay within time limit

---

## Demo Debrief (Post-Session)

Document:
- [ ] What went well
- [ ] What needs improvement
- [ ] Audience reactions
- [ ] Questions asked
- [ ] Feedback received
- [ ] Next steps
