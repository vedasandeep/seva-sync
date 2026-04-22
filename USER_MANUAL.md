# SevaSync User Manual

**Version:** 1.0  
**Last Updated:** 2025-04-22  
**Target Users:** Disaster Coordinators, Volunteers, NGO Administrators  

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Coordinator Guide](#coordinator-guide)
3. [Volunteer Guide](#volunteer-guide)
4. [IVR System Guide](#ivr-system-guide)
5. [Mobile & Feature Phone Guide](#mobile--feature-phone-guide)
6. [Reports & Analytics](#reports--analytics)
7. [FAQ](#faq)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is SevaSync?

SevaSync is an **inclusive disaster response platform** that:
- Connects coordinators with 142+ volunteers in real-time
- Works on smartphones AND feature phones (no internet required)
- Tracks every volunteer's location, status, and wellness
- Generates impact reports for donors and stakeholders
- Reduces emergency response time from 45 minutes to 12 minutes

### Who Should Use SevaSync?

| Role | Responsibilities |
|------|------------------|
| **Coordinator** | Activate disasters, create tasks, assign volunteers, monitor progress, generate reports |
| **Volunteer** | Accept tasks, log work hours, update location, check-in wellness, report completion |
| **Admin** | Manage users, view analytics, export data, configure system settings |
| **Donor** | View impact metrics, download reports, track fund utilization |

### Supported Devices

| Device Type | Browser | Features | Notes |
|-------------|---------|----------|-------|
| **Smartphone** | Chrome, Firefox, Safari | Full features | Best experience |
| **Tablet** | Chrome, Firefox, Safari | Full features | Optimized layout |
| **Desktop** | Chrome, Firefox, Safari, Edge | Full features + Admin | Recommended for coordinators |
| **Feature Phone** | Built-in browser OR IVR | IVR system only | No internet needed |

---

## Coordinator Guide

### Logging In

1. Open `https://app.sevasync.local` (or your instance URL)
2. Enter credentials:
   - **Email:** your-email@ngo.org
   - **Password:** Your secure password
3. Click **"Sign In"**
4. If 2FA enabled: Enter 6-digit code from authenticator app

**Tip:** Save your login credentials in a secure password manager.

### Dashboard Overview

The Coordinator Dashboard shows:

```
┌─────────────────────────────────────────┐
│        SEVASYNC COORDINATOR DASHBOARD    │
├─────────────────────────────────────────┤
│                                          │
│ Active Disasters: 3  | Volunteers: 142  │
│ Tasks Pending: 45    | Tasks Complete: 456
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Hyderabad Floods        [ACTIVE]    │ │
│ │ Status: High Activity               │ │
│ │ Volunteers: 85 | Tasks: 230 / 250  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Chennai Water Crisis    [ACTIVE]    │ │
│ │ Status: Medium Activity             │ │
│ │ Volunteers: 38 | Tasks: 180 / 200  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Kerala Landslides       [ACTIVE]    │ │
│ │ Status: Medium Activity             │ │
│ │ Volunteers: 19 | Tasks: 46 / 50    │ │
│ └─────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

### Activating a New Disaster

1. Click **"Disasters"** in the sidebar
2. Click **"New Disaster"** button
3. Fill in the disaster details:
   - **Disaster Name:** e.g., "Hyderabad Flash Flood 2025"
   - **Location:** City/Region affected
   - **Type:** Flood, Earthquake, Landslide, Cyclone, etc.
   - **Urgency:** CRITICAL, HIGH, MEDIUM, LOW
   - **Description:** Brief details (optional)
4. Click **"Activate Disaster"**
5. System sends notifications to all available volunteers

**Result:** Disaster appears on dashboard, volunteers see notification immediately.

### Creating & Assigning Tasks

#### Create Task

1. Click **"Tasks"** → **"New Task"**
2. Select **Disaster:** Choose which disaster this task is for
3. Fill task details:
   - **Task Name:** e.g., "Emergency Shelter Setup"
   - **Location:** GPS coordinates or address
   - **Task Type:** Shelter, Medical Aid, Water Supply, etc.
   - **Urgency:** CRITICAL (0-2 hours), HIGH (2-8 hours), MEDIUM (8-24 hours)
   - **Description:** What needs to be done?
4. Click **"Create Task"**

#### Assign Task

**Option A: Manual Assignment**
1. Click task → **"Assign Volunteer"**
2. Select volunteer from dropdown
3. Click **"Confirm Assignment"**
4. Volunteer gets push notification + SMS

**Option B: Auto-Assignment (Recommended)**
1. Click task → **"Auto-Match"**
2. System shows:
   - Nearby volunteers (within 5km)
   - Travel time estimates
   - Volunteer skills match
3. Click **"Assign Top 3"** or **"Assign Selected"**
4. Multiple volunteers get assignments simultaneously

**Tip:** Use Auto-Match for faster response. System prioritizes based on distance, availability, and skills.

### Monitoring Volunteer Progress

1. Click **"Volunteers"** in sidebar
2. View **Volunteer Map:**
   - 🟢 Green = Available
   - 🟡 Yellow = In Progress
   - 🔴 Red = Offline
   - ⚫ Grey = Inactive

3. Click on volunteer to see:
   - Current task assignment
   - Tasks completed today
   - Hours logged
   - Burnout score
   - Last location update
   - Response time

### Wellness Monitoring & Burnout Prevention

1. Click **"Volunteers"** → **"Wellness Analytics"**
2. See burnout risk scores:
   - 🔴 **High Risk:** Working >35 hours/week → Recommend break
   - 🟡 **Medium Risk:** Working 25-35 hours/week → Monitor
   - 🟢 **Healthy:** Working <25 hours/week → Keep engaged

3. For at-risk volunteers:
   - Click volunteer → **"Reduce Workload"**
   - System auto-redistributes their tasks
   - Volunteer gets notification: "Your workload has been adjusted. Take time to rest."

**Tip:** Check wellness daily. Preventing burnout is critical for volunteer retention.

### Creating Reports

1. Click **"Reports"** in sidebar
2. Select report type:
   - **Impact Metrics** - People helped, hours logged, tasks completed
   - **Volunteer Performance** - Individual volunteer stats
   - **IVR Call Summary** - Feature phone engagement
   - **Task Analytics** - Task completion rates by type
   - **Disaster Report** - Per-disaster overview
   - **Data Sync Report** - Offline data sync status

3. Configure filters (if available):
   - Date range
   - Disaster filter
   - Volunteer group

4. Click **"Generate Report"**
5. Choose format:
   - **PDF** - For presentations, donor reports
   - **CSV** - For Excel analysis, data import
   - **JSON** - For API integration

6. Report downloads automatically

**Example:** To show donors impact, generate "Impact Metrics" PDF report with date range from disaster activation to today.

---

## Volunteer Guide

### Logging In (Smartphones)

1. Open app: `https://volunteer.sevasync.local`
2. Enter phone number: `+91 9123456789`
3. Wait for SMS code
4. Enter code in app
5. Tap **"Verify"**

**Alternative:** If you have email, click "Sign in with Email" instead.

### Volunteer Dashboard

Your dashboard shows:

```
┌──────────────────────────┐
│   YOUR TASKS (3)         │
├──────────────────────────┤
│                          │
│ 🔴 URGENT (1)           │
│ ├─ Emergency Shelter    │
│ │  Location: Mehdipatnam│
│ │  Distance: 2.3 km     │
│ │  Action: [Start]      │
│                          │
│ 🟡 HIGH (2)             │
│ ├─ Medical Aid Distrib. │
│ │  Location: Uppal      │
│ │  Distance: 5.1 km     │
│ │  Action: [Start]      │
│ │                       │
│ └─ Water Distribution   │
│    Location: Secunderbd │
│    Distance: 12 km      │
│    Action: [Start]      │
│                          │
└──────────────────────────┘
```

### Starting a Task

1. Find task in your list with **"PENDING"** status
2. Tap **"Start Task"** button
3. System records:
   - Start time
   - Your location
   - Task status → "IN PROGRESS"
4. Work on the task
5. When done → Tap **"Complete Task"**
6. System logs:
   - Completion time
   - Hours worked
   - Completion location
7. Get notification: "Task completed! Thank you for helping."

**Tip:** Don't leave app while task is in progress. System tracks your location in real-time to ensure safety.

### Logging Work Hours

1. Tap **"Log Hours"** in sidebar
2. Select date and task
3. Enter hours worked: e.g., `3.5`
4. Add notes (optional): "Helped distribute 500 meals"
5. Tap **"Submit"**
6. Coordinator sees your contribution immediately

### Updating Your Location

1. Tap **"Location"** in sidebar
2. Allow location permission (if prompted)
3. Tap **"Update Location"**
4. Map shows your current position
5. Tap **"Confirm"** to save
6. Coordinator can now see your updated location for task assignments

**Important:** Enable location services in your phone settings for real-time updates.

### Wellness Check-in

1. Tap **"Wellness"** in sidebar
2. Answer 3 questions:
   - **How are you feeling?** (Good / Okay / Tired)
   - **Are you injured?** (Yes / No)
   - **Do you need support?** (Yes / No)
3. Tap **"Submit"**

**Result:** 
- If "Tired" or injury reported → Coordinator notified
- If "Need support" → Coordinator calls you
- Your burnout score decreases by 15% for check-in

**Tip:** Check in daily. Coordinators use this to ensure your safety and wellbeing.

### Offline Work

**If you lose internet connection:**

1. Keep app open
2. Your work (task start, completion, location) syncs automatically when reconnected
3. You'll see **"Syncing..."** indicator at top
4. Once synced → Indicator disappears
5. Coordinator sees your updates

**Important:** Don't close app mid-sync. Wait for sync to complete.

### Notifications

You'll receive notifications for:
- ✓ New task assignment: "Emergency Shelter Setup task assigned to you"
- ✓ Task reminder: "Please start your assigned task"
- ✓ Burnout check: "How are you feeling? Quick wellness check"
- ✓ System updates: "You've been offline. Sync in progress..."

**Control Notifications:**
1. Tap **"Settings"** → **"Notifications"**
2. Toggle notification types on/off
3. Set quiet hours (e.g., 10 PM - 6 AM)

---

## IVR System Guide

### For Volunteers (Feature Phone Users)

The **IVR (Interactive Voice Response) System** lets you participate using only a feature phone with SMS/call capability. No internet needed.

#### How to Use IVR

1. **Call the IVR Number:** `+91 1234567890` (your coordinator will provide)
2. **Listen to menu:**
   ```
   "Welcome to SevaSync. Press 1 for tasks, 2 to log hours, 
    3 for wellness check, or 0 to hang up."
   ```
3. **Press a digit** (using phone keypad)
4. System responds with voice or SMS

#### Menu Options

| Option | Action | Response | Time |
|--------|--------|----------|------|
| **1** | Get nearby tasks | SMS lists available tasks with numbers | 30s |
| **2** | Start task | Voice: "Task started" | 20s |
| **3** | Complete task | Voice: "Task logged as complete" | 20s |
| **4** | Wellness check | SMS: "How are you feeling? Reply 1=Good, 2=Okay, 3=Tired" | 30s |
| **0** | Hang up | Call ends, all data syncs | - |

#### Detailed Walkthrough

**Getting Your Tasks (Press 1):**
```
IVR: "You have 3 nearby tasks. 
      Press 1 for Emergency Shelter,
      Press 2 for Medical Aid Distribution,
      Press 3 for Water Supply Assessment"
```
You press: `1`
IVR: "Task: Emergency Shelter at Mehdipatnam, 2.3 km away.
      Press 1 to accept, 0 to go back."

**Starting a Task (Press 2):**
```
IVR: "Which task? (1=Emergency Shelter, 2=Medical Aid, 3=Water Supply)"
You press: `1`
IVR: "Starting Emergency Shelter task. Press 0 when done."
[You work on task]
You press: `0`
IVR: "Task completed. Thank you for helping! Data synced."
```

**Wellness Check (Press 4):**
```
IVR: "How are you feeling? 
      Press 1 for good,
      Press 2 for okay,
      Press 3 for tired."
You press: `3`
IVR: "We received your check-in. Your coordinator is notified. Take rest!"
```

### For Coordinators: IVR Analytics

1. Click **"IVR"** → **"Call History"**
2. See all incoming calls:
   - Volunteer name
   - Call duration
   - Actions taken (tasks started, completed, check-ins)
   - Success/failure status

3. Click **"IVR"** → **"Analytics"**
4. View metrics:
   - Total calls this week: 500+
   - Average call duration: 3:45
   - Success rate: 85%
   - Peak hours: 6 AM - 10 AM
   - Feature phone adoption: 35% of volunteers

5. Export IVR data:
   - CSV for analysis
   - PDF for reports

---

## Mobile & Feature Phone Guide

### Smartphone (iOS/Android)

1. **Download SevaSync App** from App Store or Google Play
2. **Or open in browser:** `https://volunteer.sevasync.local`
3. All features available:
   - Task management
   - Location tracking
   - Photos/attachments
   - Real-time notifications
   - Offline sync

**Recommended:** Use app for faster performance.

### Feature Phone (No Internet)

**Option 1: IVR Voice System**
- Call the IVR number
- Press digits to interact
- See Volunteer Guide: IVR System Guide section

**Option 2: SMS Commands**
```
Send SMS to: +91 1234567890

Commands:
TASK -> Get your assigned tasks
START 1 -> Start task #1
DONE 1 -> Complete task #1
CHECKIN GOOD -> Wellness check-in (GOOD/OKAY/TIRED)
STATUS -> View your current status
```

Example:
```
You: TASK
Response: "You have: 1. Emergency Shelter (2km), 2. Medical Aid (5km)"
You: START 1
Response: "Emergency Shelter task started. Time: 10:23 AM"
```

### Mobile with Low Bandwidth (2G/3G)

SevaSync is optimized for slow networks:

1. **App loads in <3 seconds** even on 2G
2. **Images load progressively** (blur first, then sharp)
3. **Essential features load first** (tasks, location, notifications)
4. **Maps use low-bandwidth tiles** (lightweight, faster)
5. **Auto-sync happens in background** (no waiting)

**Tip:** For very slow networks, disable image loading in Settings → Advanced → Mobile Optimization.

---

## Reports & Analytics

### Available Reports

#### 1. Impact Metrics Report
**For:** Donors, leadership, annual reports

Shows:
- Total people helped: 12,347
- Volunteer hours contributed: 2,840
- Tasks completed: 456 (91% success rate)
- Average response time: 12 minutes (vs 45 min baseline)
- Cost per person helped: ₹237
- Active volunteers: 142
- Disasters managed: 3

#### 2. Volunteer Performance Report
**For:** Volunteer recognition, performance management

Shows per volunteer:
- Tasks completed this week
- Hours logged
- Burnout score
- Wellness check-ins
- Response time
- Last activity

#### 3. IVR Call Summary
**For:** Feature phone usage metrics, mobile outreach effectiveness

Shows:
- Total calls: 500+ per week
- Success rate: 85%
- Failed calls: 5%
- Missed calls: 10%
- Average call duration: 3:45
- Peak usage hours
- Top actions: Task queries, completions, check-ins

#### 4. Task Analytics
**For:** Operational efficiency

Shows:
- Tasks by type (Shelter, Medical, Water, etc.)
- Completion rate: 91%
- Average task duration: 2.5 hours
- Tasks by urgency level
- Pending vs completed
- Overdue tasks

#### 5. Disaster Report
**For:** Per-disaster overview, stakeholder updates

Shows per disaster:
- Status: ACTIVE/RESOLVED
- Duration: Days active
- Volunteers deployed: Count by status
- Tasks: Total, completed, pending
- People helped estimate
- Impact summary

#### 6. Data Sync Report
**For:** Technical monitoring, offline system health

Shows:
- Offline items pending sync: 45
- Last sync time
- Volunteers offline >24h: 3
- Sync errors: 0
- Data integrity: 100%

### Generating & Exporting Reports

1. Go to **"Reports"** in sidebar
2. Select report type
3. Configure filters:
   - Date range
   - Disaster filter
   - Volunteer filter
4. Click **"Generate"**
5. Download:
   - **PDF** - Formatted report with graphics
   - **CSV** - Raw data for analysis
   - **JSON** - For system integration

### Using Reports Effectively

| Audience | Report | Use Case |
|----------|--------|----------|
| **Donors** | Impact Metrics PDF | Annual impact report, funding justification |
| **Leadership** | Disaster Report PDF | Operational briefing, status update |
| **Volunteers** | Volunteer Performance PDF | Recognition, performance feedback |
| **Analysis** | Any Report CSV | Excel analysis, trend identification |
| **Integration** | Any Report JSON | System-to-system data sharing |

---

## FAQ

### General Questions

**Q: Is SevaSync free?**
A: Yes, SevaSync is open-source and free for any NGO or disaster response organization.

**Q: Does SevaSync work without internet?**
A: Yes! Volunteers can work offline (tasks, location, wellness). Data syncs when back online.

**Q: How do feature phone users participate?**
A: They call the IVR system or send SMS commands. No app needed, no internet needed.

**Q: Is my location data safe?**
A: Yes. Location is encrypted, only visible to your coordinator, and not shared with third parties.

### Coordinator Questions

**Q: How do I activate a new disaster?**
A: Click "Disasters" → "New Disaster" → Fill details → Click "Activate". Volunteers get notified immediately.

**Q: What's the best way to assign tasks?**
A: Use "Auto-Match" feature. System finds nearest volunteers with right skills.

**Q: How do I monitor volunteer burnout?**
A: Go to "Volunteers" → "Wellness Analytics". Red-flagged volunteers need reduced workload.

**Q: Can I export data to Excel?**
A: Yes. Any report can be exported as CSV (Excel format).

### Volunteer Questions

**Q: How do I get task assignments?**
A: Open the app. Coordinator assigns tasks based on your location and availability. You'll get notified immediately.

**Q: What if I don't have internet?**
A: Call the IVR system or continue working offline. Your work auto-syncs when you reconnect.

**Q: How do I log my work hours?**
A: Tap "Log Hours" → Select task → Enter hours → Submit. Or use IVR system.

**Q: Can I see my burnout score?**
A: Yes, in "Wellness" section. High scores mean you should reduce workload. Talk to your coordinator.

**Q: Is my phone number shared?**
A: No. Only your coordinator can contact you. Your number is never shared publicly.

### Technical Questions

**Q: What happens if app crashes mid-task?**
A: No problem! Restart app. Your task is still in progress. All data syncs automatically.

**Q: How long does sync take?**
A: Typically 5-10 seconds on 4G, 30-60 seconds on 3G. Runs in background.

**Q: Can I work multiple disasters at once?**
A: Yes. You can have tasks from different disasters. Complete them independently.

**Q: What's my data used for?**
A: Only to coordinate disaster response, generate reports for donors, and improve the system. Never sold or shared.

---

## Troubleshooting

### Login Issues

**Problem: "Invalid email or password"**
- Check email is correct (case-insensitive)
- Check caps lock is OFF
- Try password recovery: Click "Forgot Password"

**Problem: "Too many login attempts"**
- Account locked for 15 minutes for security
- Try again later or contact admin

### App Won't Open

**Problem: "Can't connect to server"**
- Check internet connection
- Try opening in different browser
- Check if SevaSync service is down (ask coordinator)

**Problem: "App crashes on startup"**
- Clear app cache: Settings → Apps → SevaSync → Storage → Clear Cache
- Restart phone
- Reinstall app if issue persists

### Location Not Updating

**Problem: "Location not updating on map"**
- Go to Settings → Location → SevaSync → Allow "Always"
- Make sure GPS is enabled
- Close other apps using GPS
- Try pressing "Update Location" button in app

### Task Not Appearing

**Problem: "I don't see my assigned task"**
- Refresh app: Pull down to refresh
- Check notification - you might have missed it
- Ask coordinator if task was assigned

### Offline Sync Not Working

**Problem: "Changes not syncing after reconnect"**
- Wait 60 seconds - sync is automatic
- Check internet connection is stable
- Try closing and reopening app
- If still not working, contact support

### Burnout Score Too High

**Problem: "My burnout score is 90%"**
- You're working too hard! Reduce workload
- Talk to your coordinator
- Reduce hours or tasks until score drops
- Take wellness check-ins (helps score decrease)
- Get at least 6 hours sleep (important!)

### Report Won't Generate

**Problem: "Report generation failed"**
- Check date range is valid (start date < end date)
- Try smaller date range
- Try different report type
- Refresh page and try again

### SMS Commands Not Working

**Problem: "IVR SMS response not received"**
- Check SMS is sent to correct number (ask coordinator)
- Check command format is correct (TASK, START 1, etc.)
- Wait 30 seconds for response
- SMS rates apply - check with your provider

---

## Getting Help

### Contact Your Coordinator

For disaster-specific issues:
- Coordinator name: [To be filled]
- Phone: [To be filled]
- Email: [To be filled]
- WhatsApp: [To be filled]

### Contact SevaSync Support

For technical issues:
- Email: support@sevasync.org
- Phone: +91 1234567890
- Hours: 8 AM - 10 PM (during active disaster)

### Emergency Support

If someone is injured or in danger:
1. **Call 911 (or local emergency number)**
2. Notify your coordinator immediately
3. Use "Emergency Alert" in app (if available)

---

## Best Practices

### For Coordinators
✅ Check volunteer wellness daily  
✅ Use Auto-Match for faster task assignments  
✅ Export reports weekly for stakeholder updates  
✅ Celebrate milestone tasks (200/500 etc.)  
✅ Reach out to high-burnout volunteers  

### For Volunteers
✅ Accept tasks immediately (faster response = bigger impact)  
✅ Update location regularly (helps coordinator track you)  
✅ Check in wellness daily (even if "tired")  
✅ Log hours accurately (impacts reports for donors)  
✅ Stay hydrated and take breaks (prevent burnout)  

---

**For more information, visit:** https://sevasync.org/help  
**Last Updated:** 2025-04-22  
**Version:** 1.0
