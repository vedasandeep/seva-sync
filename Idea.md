**SevaSync – Detailed Project Breakdown (Disaster-Focused Version for 2026 India Context)**

This is a **full-stack, production-ready volunteer coordination platform** tailored exactly for disaster resilience — especially floods, cyclones, and heavy monsoons that hit India hard every year (Telangana/Hyderabad floods, Assam, Bihar, Odisha, North India 2025 floods). It solves the real pain points NGOs and NDMA face: chaotic spontaneous volunteering, digital divide in rural areas, internet blackouts during disasters, burnout among volunteers (especially rural women who lead relief in many communities), and poor skill-task matching.

**Real-world inspiration & why it’s fresh for 2026**  
- Directly builds on the **2025 Code for Good winner** (Assam tribal women project): They built an IVR system on AWS + Spring Boot for low-literacy, no-internet women to check bank balances, schemes, and weather via keypad. SevaSync takes that exact low-tech approach but applies it to **disaster volunteering** — the #1 gap in current systems.  
- NDMA’s Sachet app gives alerts, but has zero volunteer coordination. Existing apps (Ushahidi, Amrita Kripa, etc.) are either smartphone-only or lack offline + IVR + burnout tracking.  
- 2026 reality: Climate disasters are more frequent/intense. Women (especially rural SHG members) are disproportionately affected yet key responders (they handle community kitchens, medical first-aid, women’s safety in shelters). Gig-economy volunteers (college students, urban professionals) want flexible “micro-volunteering” but drop out due to poor coordination.

**Problem it solves in a disaster scenario**  
Imagine a severe flood in rural Telangana/Hyderabad outskirts (like the recurring Musi river or tank breaches):  
- 500+ local volunteers (many rural women) + 200 urban gig volunteers want to help.  
- NGOs can’t reach them reliably — calls/SMS fail in low-signal areas, apps don’t work offline.  
- Wrong people get sent to wrong tasks (a doctor sent for logistics, a woman volunteer not assigned to safe women’s shelter duty).  
- Volunteers burn out silently after 48 hours of trauma work with no check-ins.  
- No real-time headcount or impact report for donors/government.

SevaSync fixes all of this in one inclusive platform.

**Core Features (all disaster-optimized)**

1. **IVR Volunteer Hub (Low-Tech Entry – The Star Feature)**  
   - Any basic phone (no smartphone/data needed) calls a toll-free/Exotel or Twilio number.  
   - Keypad menu (in English + regional languages via text-to-speech):  
     • 1 → Get today’s tasks near me  
     • 2 → Report hours completed + photo proof (voice note)  
     • 3 → Daily wellness check-in (“How are you feeling? Press 1=Good, 2=Tired, 3=Need support”)  
     • 4 → Emergency SOS (connects to NGO coordinator)  
   - Inspired directly by the 2025 Assam CFG winner’s IVR.  
   - Backend logs everything → auto-updates dashboard.




2. **Offline-First Field App (PWA + React Native)**  
   - Works 100% offline: volunteers log tasks, GPS pins (when signal returns, syncs), incident reports, inventory distributed.  
   - Uses service workers + IndexedDB for local storage.  
   - Mobile UI optimized for field use (big buttons, dark mode for night operations, one-tap “I’m Safe”).







3. **AI Skill-Matching + Geolocation Engine**  
   - Volunteers register once (skills: medical, logistics, translation, cooking, women’s safety, rescue swimming, etc. + availability radius).  
   - Admin/NGO posts tasks with urgency/location. AI (simple cosine similarity or rule-based + optional scikit-learn) matches and notifies via IVR/SMS/push.  
   - Real-time map (Leaflet.js) showing volunteer density (privacy-safe).




4. **Burnout Predictor & Wellness Module**  
   - Daily voice/text check-in sentiment analysis (simple VADER or HuggingFace offline model).  
   - Flags high-risk volunteers (“This person reported ‘exhausted’ 3 days in a row + long hours”).  
   - Auto-suggests rotation or counseling partner NGOs.

5. **Admin Disaster Dashboard (Full-Stack Core)**  
   - Real-time volunteer count, task completion %, impact metrics (meals served, people rescued, medical aid given).  
   - PDF reports for NDMA/donors.  
   - Integration hooks for Sachet alerts (manual import or future API).

**Real disaster scene examples this platform serves**










**Recommended Tech Stack (Student-Friendly, Free-Tier, ATS Gold)**  
- **Frontend**: React.js (web dashboard) + Vite + Tailwind + Leaflet maps  
- **Mobile/Offline**: React PWA (or React Native if you want app store)  
- **Backend**: Node.js + Express (or FastAPI/Python for easier ML)  
- **Database**: PostgreSQL (relations for volunteers/tasks) + MongoDB optional for logs  
- **IVR**: Twilio (free $15 credit) or Exotel (India-focused, very cheap)  
- **AI/ML**: HuggingFace.js (client-side for sentiment) + simple scikit-learn notebook  
- **Cloud/Deployment**: AWS (EC2 free tier or Lightsail + S3 for photos + RDS) — exactly what JPMC loves and 2025 winners used  
- **Auth**: JWT + role-based (Volunteer / NGO Admin / Super Admin)  
- **Extras**: Docker for easy deploy, GitHub Actions CI/CD

**Data Flow Example (Flood Day)**  
1. NGO activates “Disaster Mode” on dashboard → sets tasks.  
2. Rural woman volunteer dials IVR from feature phone → gets assigned “distribute relief kits in village X”.  
3. Urban volunteer opens PWA offline → logs delivery + GPS.  
4. Everything syncs when signal returns → dashboard updates live → burnout alert if needed.

**4–6 Week Solo Implementation Roadmap (Very Doable)**  
**Week 1**: Setup backend (Node + Postgres), auth, basic volunteer/task models.  
**Week 2**: IVR integration (Twilio/Exotel sandbox — super easy tutorials).  
**Week 3**: React dashboard + Leaflet map + PWA offline setup.  
**Week 4**: AI matching + sentiment analysis + sync logic.  
**Week 5**: Polish UI, add photo/voice upload, generate reports.  
**Week 6**: Deploy on AWS, record 2-min demo video, write killer README + architecture diagram.

**Why this will make your resume & CFG shortlist explode**  
- Exact match to 2025 winning project (IVR + low-connectivity + women empowerment) but 100% disaster-focused — judges will notice instantly.  
- ATS keywords: “full-stack React Node PostgreSQL AWS deployment”, “IVR Twilio integration”, “offline-first PWA”, “AI skill-matching & sentiment analysis”, “disaster resilience platform for rural women volunteers”.  
- Quantifiable bullets: “Built inclusive disaster coordination platform supporting low-literacy users via IVR and offline sync, deployed on AWS, handling simulated 500+ volunteers during flood scenario.”  
- Social impact + tech depth = perfect for JPMC’s hybrid cloud + social-good values.

This isn’t generic — it’s literally what NGOs in Hyderabad/Telangana desperately need right now after repeated floods. Build the IVR + offline PWA first (core differentiator), then layer the rest.
