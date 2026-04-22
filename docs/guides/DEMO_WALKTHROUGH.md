# Demo Walkthrough Guide

Step-by-step instructions to run complete SevaSync demos from start to finish.

---

## 🎯 Demo Overview

SevaSync has **7 complete demo scenarios** that showcase the platform end-to-end. Choose based on your time and needs:

| Demo | Duration | Audience | Prerequisites |
|------|----------|----------|---------------|
| **Quick Demo** | 5 min | Stakeholders | Platform running |
| **Coordinator Demo** | 10 min | Non-technical | Platform running |
| **Volunteer Demo** | 10 min | Users | Platform running |
| **Full End-to-End** | 20 min | All | Platform running + seed data |
| **IVR Demo** | 5 min | Technical | Twilio configured |
| **Offline Demo** | 10 min | Technical | Mobile/PWA access |
| **Analytics Demo** | 5 min | Management | Completed tasks |

---

## ⏱️ Setup (5 minutes)

### Step 1: Start the Platform

```bash
# Option A: Docker Compose (Recommended)
cd sevasync
docker-compose up --build

# Option B: Local Development
cd backend && npm run dev  # Terminal 1
cd frontend-dashboard && npm run dev  # Terminal 2
```

### Step 2: Seed Demo Data

```bash
# In another terminal
cd backend
npm run prisma:seed

# Output: Created 5 disasters, 50 volunteers, 100 tasks
```

### Step 3: Verify Services

Open these URLs in your browser:

- **Dashboard**: http://localhost:5173
- **API Health**: http://localhost:5000/health
- **PWA**: http://localhost:5174

All should show green/healthy status ✅

---

## 📱 DEMO 1: Quick Demo (5 minutes)

**Best for**: Quick stakeholder overview, elevator pitch

### Story
Coordinator receives flood alert, creates disaster, assigns volunteer, monitors status.

### Steps

**1. Login to Dashboard** (30 seconds)
- Go to http://localhost:5173
- Email: `coordinator@example.com`
- Password: `SecurePass@123`

**2. Create Disaster** (1 minute)
- Click "New Disaster" button
- Fill in:
  - Name: "Flash Flood - Downtown Area"
  - Type: "Flood"
  - Location: Draw on map or use: Lat 19.0760, Lon 72.8777 (Mumbai)
  - Severity: "High"
  - Description: "Rapid flooding in downtown residential area"
- Click "Create Disaster"
- ✅ Disaster appears in list as "Active"

**3. Assign Volunteer** (1.5 minutes)
- Click disaster to open details
- Go to "Volunteer Matching" tab
- View available volunteers (filtered by location, skills)
- Click "Assign" on top volunteer
- Assign to task "Immediate Evacuation"
- ✅ Volunteer assigned, status shows "Assigned"

**4. Monitor Dashboard** (1.5 minutes)
- Go to "Disaster Dashboard" (main page)
- Show real-time metrics:
  - Active disasters: 6
  - Volunteers deployed: 48
  - Tasks completed: 128
  - Lives impacted: 2,450+
- Show map with live volunteer locations
- ✅ Demo complete!

### Talking Points
- "One-click disaster creation"
- "Smart volunteer matching"
- "Real-time status tracking"
- "Geographic coordination"

---

## 👔 DEMO 2: Coordinator Full Workflow (10 minutes)

**Best for**: Admin training, feature walkthrough

### Story
Complete disaster management from creation to impact reporting.

### Pre-Demo Checklist
- [ ] Dashboard open
- [ ] Logged in as coordinator
- [ ] Seed data loaded

### Steps

**1. Dashboard Overview** (1 minute)
- Show home page with metrics
- Point out:
  - Active disasters count
  - Volunteer statistics
  - Task progress
  - Recent activity feed
- Click on map to show volunteer locations

**2. Create New Disaster** (2 minutes)
- Click "Create New Disaster" button
- Fill form:
  - **Name**: "Earthquake Response - Zone A"
  - **Type**: "Earthquake"
  - **Severity**: "Critical"
  - **Location**: Click map, select coordinates (latitude/longitude)
  - **Description**: "Major earthquake in densely populated area. Need immediate rescue and medical aid"
  - **Affected Population**: 10,000
  - **Safe Zones**: List 2-3 coordination points
- Click "Create"
- ✅ Disaster created, enters "Planning" phase

**3. Manage Tasks** (2 minutes)
- On disaster details page, go to "Tasks" tab
- Show pre-generated tasks:
  - "Immediate Rescue Operations"
  - "Medical First Aid Setup"
  - "Food & Water Distribution"
  - "Shelter Coordination"
  - "Search & Rescue"
- Click "Edit" on one task
  - Change priority: "Critical"
  - Set deadline: Tomorrow 6 AM
  - Add notes: "Highly urgent - dense population"
- Click "Save"
- ✅ Task updated

**4. Volunteer Matching** (2 minutes)
- Go to "Volunteer Matching" tab
- Show filter panel:
  - Skills: "Search and Rescue", "Medical"
  - Availability: "Available Now"
  - Languages: "English"
- Show matched volunteers (filtered by criteria)
- Click "Assign" on 3-4 volunteers
- Assign them to "Rescue Operations" task
- ✅ Volunteers assigned with confirmation

**5. Monitor Progress** (1.5 minutes)
- Go to "Live Tracking" tab
- Show volunteers on map moving in real-time
- Show task completion status:
  - 2 tasks completed
  - 3 in progress
  - 2 pending
- Click on volunteer marker to see:
  - Name, skills, availability
  - Assigned tasks
  - Contact info

**6. Generate Report** (1 minute)
- Go to "Reports & Analytics"
- Click "Export Disaster Report"
- Show PDF preview:
  - Disaster summary
  - Volunteer assignments
  - Tasks completed
  - Impact metrics
  - Timeline
- Click "Download PDF"
- ✅ Report generated

### Key Features to Highlight
- Disaster creation wizard
- Smart volunteer filtering
- Real-time task tracking
- Automated reporting
- Geographic awareness

---

## 🙋 DEMO 3: Volunteer Mobile Experience (10 minutes)

**Best for**: Volunteer user training, mobile app demo

### Story
Volunteer receives task assignment, completes work, submits report.

### Pre-Demo Setup
```bash
# Have PWA open in different window
# http://localhost:5174

# Login as volunteer
Email: volunteer@example.com
Password: VolunteerPass@123
```

### Steps

**1. Home Screen** (1 minute)
- Show volunteer home page
- Highlight:
  - **Quick Stats**: Tasks assigned, completed, pending
  - **Active Disasters**: List of current emergencies
  - **Quick Actions**: "Accept Task", "Report Status", "Need Help"

**2. View Assigned Tasks** (2 minutes)
- Go to "My Tasks" tab
- Show assigned tasks with:
  - Task title, description
  - Location on map
  - Deadline countdown
  - Priority indicator (color-coded)
- Click on "Evacuation Support" task
- Show task details:
  - Full description
  - Assigned since: "2 hours ago"
  - Deadline: Tomorrow 10 AM
  - Team members also assigned
  - Location with navigation

**3. Accept & Start Task** (2 minutes)
- Click "Accept Task"
- Confirmation: "Task accepted at 3:45 PM"
- Status changes to "In Progress"
- Show real-time location sharing:
  - "Your location is being shared with coordinator"
  - Volunteer position appears on map
  - Coordinator sees volunteer moving in real-time

**4. Report Status Updates** (2 minutes)
- While "in task", show status update options:
  - Quick status: "Safe", "On Site", "Completed", "Need Help"
- Tap "Completed"
- Add completion report:
  - **People Helped**: 45
  - **Time Spent**: 3 hours
  - **Notes**: "Successfully evacuated 45 residents. One elderly resident needed medical support, transferred to hospital."
  - **Photos**: (show upload option)
- Click "Submit Report"
- ✅ Task marked complete with submission time

**5. Request Support** (1 minute)
- If volunteer clicks "Need Help", show:
  - Immediate alert sent to coordinator
  - Auto-shares location
  - Shows nearby volunteers (if any)
  - Coordinator receives push notification
  - Shows as "Priority" in coordinator dashboard

**6. Offline Mode** (1.5 minutes)
- Simulate offline (disconnect WiFi/close network)
- Show app continues to work:
  - Can view tasks (cached)
  - Can accept/update status (queued)
  - Offline indicator shows "Syncing when online"
- Reconnect network
- Show "Syncing..." then "All updates sent ✓"
- ✅ Offline-first capability demonstrated

### Key Features to Highlight
- Mobile-first interface
- Real-time location sharing
- Offline capability
- Task completion workflow
- Status reporting

---

## 📞 DEMO 4: IVR Phone System (5 minutes)

**Best for**: Technical demo, disaster communication

### Prerequisites
- Twilio account configured
- Phone number in system

### Story
Volunteer calls disaster hotline, gets assignment, confirms participation.

### Steps

**1. Show IVR Setup** (1 minute)
- Open phone dialer (or use Twilio console)
- Show configured phone number: +1(XXX)XXX-XXXX
- Explain IVR flow diagram on screen

**2. Make Test Call** (3 minutes)
- Call the number
- Hear: "Welcome to Disaster Relief Coordination. Press 1 if you're a volunteer, 2 for general inquiries"
- Press 1
- Hear: "Thank you. Please enter your volunteer ID or press * for more options"
- Press *
- Hear: "You have 2 urgent tasks. Press 1 for evacuation support in Downtown. Press 2 for medical assistance in North Zone"
- Press 1
- Hear: "Task details... Location... Deadline... Press 1 to accept, 2 for details, 3 to skip"
- Press 1
- Hear: "Task accepted. You'll receive SMS confirmation shortly. Thank you for helping!"
- ✅ Task accepted via IVR

**3. Show SMS Confirmation** (1 minute)
- Check phone for SMS:
  - "Task Accepted: Evacuation Support. Location: Downtown Area. Deadline: 6 PM. Questions? Call or text HELP"
- Open dashboard to show:
  - Task status updated to "Accepted"
  - Volunteer appears in "Assigned" list
  - Timestamp of IVR acceptance

### Key Features to Highlight
- Voice-based task assignment
- Works without internet
- SMS confirmation
- Accessibility for offline areas
- Integration with live dashboard

---

## 📊 DEMO 5: Analytics & Reporting (5 minutes)

**Best for**: Management, impact demonstration

### Story
View disaster impact and volunteer contribution metrics.

### Steps

**1. Dashboard Analytics** (1.5 minutes)
- Go to "Reports & Analytics"
- Show overview metrics:
  - **Total Impact**: 15,000+ lives helped
  - **Volunteers Deployed**: 450+
  - **Tasks Completed**: 1,200+
  - **Disaster Response Time**: Avg 45 minutes
- Show trend charts:
  - Volunteer deployment over time
  - Task completion rate
  - Disaster progression

**2. Disaster-Specific Report** (2 minutes)
- Select a disaster from list
- Show disaster report dashboard:
  - **Timeline**: Creation → Response → Recovery
  - **Volunteers**: 48 assigned, 45 completed, 3 in progress
  - **Tasks**: 32 created, 28 completed, 4 active
  - **Impact Metrics**:
    - People rescued: 234
    - Medical cases treated: 45
    - Shelters set up: 5
    - Food distributed: 2,300 meals
- Show map with color-coded task completion status

**3. Export Reports** (1 minute)
- Click "Export Full Report"
- Choose format: PDF, Excel, CSV
- Show download preview
- Click "Download"
- ✅ Report ready for sharing with stakeholders

### Key Features to Highlight
- Real-time impact metrics
- Historical data tracking
- Multi-format export
- Stakeholder reporting
- Data-driven insights

---

## 🌐 DEMO 6: Offline Functionality (10 minutes)

**Best for**: Technical demo, disaster resilience

### Story
Volunteer works in area with poor connectivity, app continues working offline.

### Pre-Demo Setup
```bash
# Have PWA open
http://localhost:5174

# Login as volunteer
```

### Steps

**1. Online Baseline** (1 minute)
- Show app working normally
- Network indicator shows "Connected"
- Assigned tasks load instantly
- Real-time map shows volunteers

**2. Simulate Network Loss** (5 minutes)

**Browser DevTools Method:**
- Right-click > Inspect
- Go to "Network" tab
- Click "Offline" checkbox
- Explain to audience: "We're now completely offline"

**Device Method:**
- Airplane mode on (if on tablet/mobile)
- Or disable WiFi

**3. Show Offline Capability** (3 minutes)
- Refresh page
- App still loads! ✅
- Go to "My Tasks" section
- Tasks still visible (cached from before)
- Show offline banner: "You're offline. Changes will sync when online."
- Try to update task status
- Action queued with indicator: "Pending sync..."
- Add status update: "50 people helped"
- Show queued notification

**4. Simulate Reconnection** (1 minute)
- Go back to DevTools > Network
- Uncheck "Offline" checkbox
- Or disable Airplane mode / enable WiFi
- Wait 3 seconds
- Show sync in progress: "Syncing..."
- Then success: "All updates synced ✓"
- Check dashboard:
  - Task status updated remotely
  - Timestamp reflects when submitted
  - No data lost

### Key Features to Highlight
- Works completely offline
- Automatic syncing
- Progressive enhancement
- Zero data loss
- Critical for disaster zones with poor connectivity

---

## 🎓 DEMO 7: Complete End-to-End Scenario (20 minutes)

**Best for**: Comprehensive overview, training sessions

### Scenario: Monsoon Flood Response

This demo combines all previous demos into one cohesive story.

### Timeline (20 minutes)

**T+0 (0-2 min): Disaster Alert**
- Show news ticker: "Heavy rainfall reported in coastal areas"
- Coordinator receives push notification
- Dashboard updates with new disaster alert

**T+1 (2-5 min): Disaster Creation & Planning**
- Coordinator logs in
- Creates disaster: "Monsoon Flood - Coastal Zone"
- Severity: "High"
- Affected population: 8,000
- Auto-populates tasks based on disaster type

**T+2 (5-9 min): Volunteer Activation**
- Show "Urgent Call-in" for nearby volunteers
- IVR sends bulk SMS: "Urgent: Flood response needed. Tap link or call"
- Volunteers receive notifications
- First 10 volunteers accept via IVR/app

**T+3 (9-13 min): Task Assignment & Live Tracking**
- Show volunteer matching panel
- Assign volunteers to "Evacuation Support"
- Map shows volunteers arriving on scene
- Real-time location updates
- Tasks move to "In Progress"

**T+4 (13-17 min): Volunteer Work**
- Switch to PWA/mobile view
- Volunteer at scene updates status
- Photos uploaded showing work progress
- Completes task: "Evacuated 65 residents"
- Task marked complete

**T+5 (17-20 min): Impact Report**
- Go to Reports & Analytics
- Show metrics updated:
  - 65 people rescued
  - 2 medical cases treated
  - 3 hours of volunteer effort
- Generate PDF report
- Show dashboard impact summary

### Key Highlights Throughout
- Seamless flow from alert to resolution
- Real-time collaboration
- Mobile and desktop integration
- Offline resilience
- Impact measurement

---

## 🎤 Presentation Tips

### Before Demo
- ✅ Test all services are running
- ✅ Seed data loaded
- ✅ Clear browser cache
- ✅ Mute notifications
- ✅ Have backup screenshots ready

### During Demo
- **Speak slowly** - Let action complete before clicking
- **Narrate actions** - "I'm now creating a disaster..."
- **Highlight insights** - "Notice how volunteers auto-filtered by location"
- **Use gestures** - Point to screen elements
- **Pause for questions** - After each major step

### After Demo
- ✅ Answer questions
- ✅ Show code (if technical audience)
- ✅ Share link for self-exploration
- ✅ Collect feedback

---

## 📱 Demo Data Reference

### Pre-Seeded Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | `admin@sevasync.local` | `AdminPass@123` | Full system access |
| Coordinator | `coordinator@example.com` | `SecurePass@123` | Create disasters, assign volunteers |
| Volunteer | `volunteer@example.com` | `VolunteerPass@123` | Accept tasks, report work |

### Pre-Seeded Disasters

- **Flood (Active)** - 48 volunteers assigned, 28 tasks completed
- **Earthquake (Planning)** - 0 volunteers, 5 tasks waiting
- **Cyclone (Response)** - 32 volunteers active
- **Landslide (Recovery)** - 15 volunteers, winding down
- **Fire (Concluded)** - Archived, historical data available

### Pre-Seeded Volunteers

- **50 total volunteers**
- **Skills**: Medical, Search & Rescue, Logistics, Communications, Driving
- **Languages**: English, Hindi, Tamil, Marathi
- **Availability**: Various time windows and skill combinations

---

## 🎬 Recording Demos

To record your demo:

```bash
# Using OBS Studio (free, recommended)
# 1. Download from obsproject.com
# 2. Create new scene
# 3. Add display capture source
# 4. Click "Start Recording"
# 5. Run demo
# 6. Click "Stop Recording"

# Or use built-in screen recording:
# macOS: Cmd+Shift+5
# Windows: Windows+Shift+S (Snip & Sketch)
# Linux: Ctrl+Alt+Shift+R
```

---

## 🆘 Troubleshooting Demos

### App Won't Load
```bash
# Clear browser cache
# Ctrl+Shift+Delete (Chrome)
# Cmd+Shift+Delete (Firefox)

# Restart services
docker-compose restart
# or
npm run dev
```

### Seed Data Missing
```bash
# Re-seed database
cd backend
npm run prisma:seed
```

### Map Not Showing
```bash
# Ensure VITE_API_URL is correct
# In frontend .env:
VITE_API_URL=http://localhost:5000

# Restart frontend
npm run dev
```

### Performance Issues
```bash
# Close unnecessary tabs
# Reduce map zoom level
# Disable network throttling in DevTools
```

---

## 📹 Demo Videos

Pre-recorded demos are available in `/docs/archive/demo-videos/`:

- `quick-demo-5min.mp4` - Quick overview
- `full-workflow-20min.mp4` - Complete end-to-end
- `mobile-experience-10min.mp4` - Volunteer PWA

---

**Status**: ✅ Complete  
**Last Updated**: April 22, 2026  
**All Demos Tested**: ✅ Working
