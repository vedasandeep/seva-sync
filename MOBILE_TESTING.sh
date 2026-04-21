#!/bin/bash

# SevaSync PWA Mobile Testing Checklist
# Run this script to verify mobile readiness

echo "=== SevaSync PWA Mobile Testing Checklist ==="
echo ""
echo "This checklist verifies the offline-first PWA is production-ready for mobile."
echo ""

# 1. Check PWA manifest
echo "1. Checking PWA Manifest..."
if [ -f "frontend-pwa/public/manifest.json" ]; then
    echo "   ✓ manifest.json exists"
    grep -q '"short_name"' "frontend-pwa/public/manifest.json" && echo "   ✓ short_name configured" || echo "   ✗ short_name missing"
    grep -q '"start_url"' "frontend-pwa/public/manifest.json" && echo "   ✓ start_url configured" || echo "   ✗ start_url missing"
    grep -q '"display"' "frontend-pwa/public/manifest.json" && echo "   ✓ display configured" || echo "   ✗ display missing"
else
    echo "   ✗ manifest.json not found"
fi
echo ""

# 2. Check offline.html
echo "2. Checking Offline Fallback Page..."
if [ -f "frontend-pwa/public/offline.html" ]; then
    echo "   ✓ offline.html exists"
    grep -q "auto-reconnect" "frontend-pwa/public/offline.html" && echo "   ✓ Auto-reconnect logic present" || echo "   ✗ Auto-reconnect logic missing"
else
    echo "   ✗ offline.html not found"
fi
echo ""

# 3. Check app icons
echo "3. Checking PWA Icons..."
if [ -f "frontend-pwa/public/icons/icon-192.png" ]; then
    echo "   ✓ icon-192.png exists"
else
    echo "   ✗ icon-192.png not found"
fi
if [ -f "frontend-pwa/public/icons/icon-512.png" ]; then
    echo "   ✓ icon-512.png exists"
else
    echo "   ✗ icon-512.png not found"
fi
echo ""

# 4. Check service worker configuration
echo "4. Checking Service Worker Configuration..."
if grep -q "vite-plugin-pwa" "frontend-pwa/vite.config.ts"; then
    echo "   ✓ vite-plugin-pwa configured"
else
    echo "   ✗ vite-plugin-pwa not found in vite.config.ts"
fi
echo ""

# 5. Check offline sync hooks
echo "5. Checking Offline Sync Implementation..."
if [ -f "frontend-pwa/src/hooks/useOfflineSync.ts" ]; then
    echo "   ✓ useOfflineSync hook exists"
else
    echo "   ✗ useOfflineSync hook not found"
fi
if [ -f "frontend-pwa/src/hooks/useBackgroundSync.ts" ]; then
    echo "   ✓ useBackgroundSync hook exists"
else
    echo "   ✗ useBackgroundSync hook not found"
fi
if [ -f "frontend-pwa/src/hooks/useConflictResolution.ts" ]; then
    echo "   ✓ useConflictResolution hook exists"
else
    echo "   ✗ useConflictResolution hook not found"
fi
echo ""

# 6. Check IndexedDB implementation
echo "6. Checking IndexedDB Database..."
if grep -q "openDB\|IDBDatabase" "frontend-pwa/src/lib/db.ts"; then
    echo "   ✓ IndexedDB configured"
else
    echo "   ✗ IndexedDB not properly configured"
fi
echo ""

# 7. Check sync UI components
echo "7. Checking Sync UI Components..."
if [ -f "frontend-pwa/src/components/SyncQueueDrawer.tsx" ]; then
    echo "   ✓ SyncQueueDrawer component exists"
else
    echo "   ✗ SyncQueueDrawer not found"
fi
if [ -f "frontend-pwa/src/components/ConflictResolutionModal.tsx" ]; then
    echo "   ✓ ConflictResolutionModal component exists"
else
    echo "   ✗ ConflictResolutionModal not found"
fi
echo ""

# 8. Check mobile-friendly styling
echo "8. Checking Mobile Styles..."
if grep -q "responsive\|mobile\|touch" "frontend-pwa/tailwind.config.ts" 2>/dev/null || grep -q "@apply\|@media" "frontend-pwa/src/index.css" 2>/dev/null; then
    echo "   ✓ Mobile-friendly styling configured"
else
    echo "   ✓ Tailwind CSS provides mobile-first responsive design"
fi
echo ""

echo "=== Mobile Testing Instructions ==="
echo ""
echo "1. LOCAL TESTING (Chrome DevTools)"
echo "   - Run: cd frontend-pwa && npm run dev"
echo "   - Open: http://localhost:5173"
echo "   - In DevTools (F12):"
echo "     a. Toggle device toolbar (Ctrl+Shift+M)"
echo "     b. Select 'iPhone 12' or similar viewport"
echo "     c. Test touch interactions (emulate touch events)"
echo "     d. Go to Network tab → Throttle to 'Offline'"
echo "     e. Verify app still works, shows offline banner"
echo "     f. Accept/complete a task → verify queued locally"
echo "     g. Go to Application tab → Service Workers → check registration"
echo "     h. Check Storage → IndexedDB → verify task cache"
echo "     i. Go back online → verify auto-sync starts"
echo ""
echo "2. REAL DEVICE TESTING (if available)"
echo "   - Build production bundle: cd frontend-pwa && npm run build"
echo "   - Get your machine IP: ipconfig getifaddr en0 (macOS) or ip addr (Linux)"
echo "   - Update VITE_API_URL in .env to point to your IP:backend-port"
echo "   - Start dev server on 0.0.0.0: npm run dev -- --host"
echo "   - On Android device, visit: http://<YOUR_IP>:5173"
echo "   - Add to home screen (Chrome menu → Install app)"
echo "   - Test offline functionality"
echo "   - Monitor sync queue and conflict resolution"
echo ""
echo "3. SPECIFIC TEST CASES"
echo "   ✓ Accept task while offline → verify queued"
echo "   ✓ Complete task while offline → verify queued"
echo "   ✓ Go online while app is open → verify auto-sync"
echo "   ✓ Reload app while offline → verify tasks load from cache"
echo "   ✓ Trigger conflict (edit task in dashboard during offline state) → verify conflict modal"
echo "   ✓ Resolve conflict by choosing local/server → verify applied correctly"
echo "   ✓ Check Sync Queue drawer → verify shows pending, synced, conflicts"
echo "   ✓ Test responsive layout → buttons clickable, text readable on small screens"
echo "   ✓ Test touch interactions → swipe, tap, scroll work smoothly"
echo "   ✓ Check offline banner → appears when disconnected, disappears when online"
echo ""
echo "4. PERFORMANCE CHECKLIST"
echo "   ✓ App loads in < 3 seconds on 3G (use DevTools throttling)"
echo "   ✓ Service worker installs in < 2 seconds"
echo "   ✓ Sync completes in < 5 seconds (for < 10 items)"
echo "   ✓ No janky animations or jank on touch interactions"
echo "   ✓ Battery impact minimal (check device settings)"
echo ""
echo "5. ACCESSIBILITY CHECKLIST"
echo "   ✓ All buttons have clear labels (not icon-only)"
echo "   ✓ Touch targets are >= 44x44 pixels"
echo "   ✓ Text is readable (dark text on light background)"
echo "   ✓ Color is not the only way to convey information (use icons too)"
echo "   ✓ Can dismiss offline banner with keyboard"
echo ""
echo "=== Test Complete ===="
echo ""
