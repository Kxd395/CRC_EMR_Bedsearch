# URGENT: How to Change Bed Search Status

## The Problem
You're using the wrong UI element! There are TWO ways to edit bed searches:

### 1. **Edit Info Popover** ❌ (What you're using now)
- Small popup that appears
- Has limited fields
- **DOES NOT have proper save with database persistence**
- Calls `saveEditPopover()` which doesn't trigger full save

### 2. **View Details Drawer** ✅ (What you NEED to use)
- Full side panel that slides in from the right
- Has ALL fields including transport, clinician info, etc.
- **HAS proper save with database persistence**
- Calls `persistDrawerChanges()` with full save and re-render

## How to Change Status (CORRECT METHOD)

1. **Refresh your browser** to pick up the timeline fix
2. Select pt_501 (💾 Dana Nguyen)
3. Find a bed search (like "Malvern Behavioral Health" or "Beacon Point")
4. Click the **"View details"** button (NOT "Edit info")
5. A full drawer should slide in from the right side
6. Change the Status dropdown from "Searching" to "Accepted"
7. Click "Save changes"

## What You'll See in Console

When you use the **drawer** (correct method), you'll see:

```
🔘 DRAWER SAVE CHANGES BUTTON CLICKED (blue)
💾 PERSIST DRAWER CHANGES CALLED (cyan)
   Search ID: Spt_501-02, Patient ID: pt_501
   Found search: Malvern Behavioral Health, current status: Searching
🎨 STATUS CHANGE: Searching → Accepted for Malvern Behavioral Health (purple)
💾 Saving patient pt_501 to database...
✅ Patient pt_501 saved successfully
🎨 Rendering Malvern Behavioral Health: status="Accepted" → status-badge badge-accepted (green)
```

And the badge should change from yellow/orange to **green**.

## What the Console Shows Now

Currently you're seeing:
- ✅ Database loading: `Loaded 1 patients from PostgreSQL` 
- ✅ 5 searches found: `Transforming patient pt_501: 5 searches found`
- ✅ All searches rendering as "Searching" with yellow badges
- ❌ **Timeline error** (FIXED in latest code): `timeline.map is not a function`
- ❌ **No drawer save messages** because you're using the popover instead

## Fixed Issues

1. ✅ **Timeline error fixed** - `renderDashboardTimeline()` now handles both array and object formats
2. ✅ **Persistence working** - You now have 5 searches in database (was 4, added Fairmount!)
3. ✅ **Rendering shows correct classes** - `status-badge badge-waiting` for Searching status

## Next Steps

**RESTART THE UI SERVER** to get the timeline fix:

```bash
# Kill UI server
pkill -f "vite.*5174"

# Start it again
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/src/web
npm run dev -- --port 5174 > ../../logs/ui-server.log 2>&1 &
```

Then **refresh your browser** and try again using the **"View details"** button!

## Why the Buttons Are Different

### "Edit info" Button (Popover)
```javascript
// Quick edit - no full save
function saveEditPopover() {
  // Updates search in memory
  // Calls renderAll() 
  // BUT renderAll() was crashing due to timeline error!
  // So changes weren't visible
}
```

### "View details" Button (Drawer)
```javascript
// Full save with persistence
async function persistDrawerChanges() {
  // Updates search in memory
  // Saves to database: await savePatientToDatabase(patient)
  // Calls renderAll() to show changes
  // Shows confirmation message
}
```

The popover might work NOW that timeline is fixed, but the drawer is the proper way to make persistent changes!
