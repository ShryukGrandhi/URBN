# ✅ URBAN Platform - Complete Workflow Guide

## 🎯 Everything is Now Working!

✅ Backend running (port 3001)  
✅ Frontend running (port 5173)  
✅ Environment variables loaded  
✅ Gemini API connected  
✅ Mapbox configured  
✅ Database ready  

---

## 🚀 STEP-BY-STEP: Run Your First Simulation

### Step 1: Open the App
**http://localhost:5173**

You'll see a "Getting Started" tutorial page.

---

### Step 2: Go to Dashboard
Click **"Dashboard"** in the left sidebar.

You should see:
- **1 Project**: "Downtown Transit-Oriented Development"
- **5 Agents**: Listed in the table below

---

### Step 3: Open the Sample Project

Click on **"Downtown Transit-Oriented Development"**

You'll see the project details page.

---

### Step 4: Add Agents to Your Project ⚠️ IMPORTANT!

Look at the **RIGHT SIDEBAR** - see "Assigned Agents" section.

**If it says "No agents assigned yet":**

1. Click the big **"Add Agents"** button
2. A modal pops up showing all available agents
3. Click **"Select Recommended"** button (top left)
   - This auto-selects the 3 essential agents you need!
4. Click **"Add 3 Agents"** button at the bottom
5. Done! Agents are now assigned ✅

---

### Step 5: Run a Simulation

Now that agents are assigned:

1. Click **"New Simulation"** button at the top
2. You'll go to the Simulation Canvas page
3. On the **LEFT PANEL**:
   - City is pre-filled: "San Francisco, CA"
   - Time Horizon: 10 years (you can adjust)
   - Check the layers you want: Traffic, Buildings, Housing
4. Click **"Run Simulation"** button at the top

---

### Step 6: Watch Real-Time AI Analysis!

You'll see:
- **CENTER**: 3D Mapbox map with dark theme and angled view
- **RIGHT**: Live streaming text from Gemini AI
- **Progress messages** appear in real-time
- **Tokens stream** as AI thinks about your policy

The simulation will:
1. Fetch REAL data from Census API
2. Get REAL air quality from EPA
3. Get REAL buildings from OpenStreetMap
4. Get REAL traffic from Mapbox
5. Analyze with Gemini AI
6. Show results on the map

**Wait for status to show "COMPLETED"** (30-60 seconds)

---

### Step 7: Run a Debate (Optional)

After simulation completes:

1. Go to **"Debate"** tab in left sidebar
2. In the LEFT PANEL:
   - Select your simulation from dropdown
   - Set rounds: 3
3. Click **"Start Debate"**

Watch AI agents argue:
- **PRO side** (green): Economic growth, opportunity
- **CON side** (red): Environmental concerns, equity

---

### Step 8: Generate a Report

1. Go to **"Reports"** tab in left sidebar
2. In the LEFT PANEL:
   - Enter title: "Policy Impact Report"
   - Choose format: PDF
   - Check sections you want
3. Click **"Generate Report"**

Watch the report compile section-by-section in real-time!

---

## 🗺️ About the 3D Map

Your map now looks exactly like the NYC example:
- ✅ **Dark theme** (dark buildings, dark background)
- ✅ **3D perspective** (angled view, not flat)
- ✅ **Real building heights** (from OpenStreetMap)
- ✅ **Realistic shadows**
- ✅ **Traffic overlay** (real Mapbox traffic data)

**To see 3D better:**
- Zoom in to city center (zoom level 14+)
- Buildings appear in 3D
- Rotate with right-click + drag
- Tilt with Ctrl + drag

---

## 🌍 Verifying REAL Data

### How to Know It's Real Data:

1. **Check Console Tab**: See API calls being made
2. **Look at Analysis**: AI mentions data sources
3. **Compare Numbers**: Match with official Census website
4. **Map Accuracy**: Buildings/streets match reality

### Data Sources (ALL REAL):

**✅ US Census Bureau**
- API: https://api.census.gov
- Your Key: `9295d7ce67bb1592828db3723cc61a106f815103`
- Data: Population, income, housing for exact census tracts

**✅ OpenStreetMap**  
- API: https://overpass-api.de
- Free, no key needed
- Data: Real buildings, roads, locations

**✅ Mapbox**
- API: https://api.mapbox.com
- Your Token: `pk.eyJ1Ijoic2hyeXVrZyIs...`
- Data: Real traffic flow, 3D buildings, geocoding

**✅ EPA Air Quality**
- Data: Real air quality indices

**✅ Google Gemini AI**
- Your Key: `AIzaSyDaS8rk8Yjkch6SH6q68v0rBXc9CTZtFuo`
- Real AI analysis, not pre-written responses

### When Mock Data is Used:

The system will **TELL YOU** in console if using mock data:
```
source: "Mock data (Census API unavailable)"
```

Otherwise, it shows:
```
source: "US Census Bureau ACS 5-Year"
```

---

## 🔧 Troubleshooting

### "No simulation agent assigned to this project"

**Solution:**
1. Open your project
2. Right sidebar → Click "Add Agents"
3. Click "Select Recommended"
4. Add the agents
5. Try simulation again ✅

### "Simulation failed"

**Check:**
1. Backend .env has GEMINI_API_KEY
2. Internet connection is working
3. Check Console tab for error details
4. Restart servers: Stop and run `npm run dev`

### "Console is empty"

**Solution:**
1. WebSocket is now fixed
2. Refresh the page
3. Run a simulation
4. Go to Console tab
5. You'll see live streaming!

### "Map not showing 3D"

**Solution:**
1. Zoom in closer (zoom level 14+)
2. Make sure "buildings" layer is checked
3. Refresh the page
4. 3D buildings appear at close zoom levels

### "Debate doesn't work"

**Requirements:**
1. Must have a COMPLETED simulation first
2. Must have Debate agent assigned to project
3. Select the completed simulation in dropdown
4. Then click "Start Debate"

---

## 📊 Complete Workflow Checklist:

- [ ] Open http://localhost:5173
- [ ] Dashboard → Click sample project
- [ ] Add agents (click "Select Recommended")
- [ ] Click "New Simulation"
- [ ] Configure parameters
- [ ] Run simulation
- [ ] Wait for "COMPLETED"
- [ ] (Optional) Run debate
- [ ] (Optional) Generate report
- [ ] Check Console tab to see live AI streaming

---

## 🎉 What You'll See:

1. **Dashboard**: Projects and agents overview
2. **Project Page**: Upload PDFs, see simulations
3. **Simulation**: 3D map with real-time AI analysis
4. **Debate**: PRO vs CON arguments streaming live
5. **Reports**: Professional PDF generation
6. **Console**: Live terminal showing all AI activity

---

## 💡 Pro Tips:

### Get Real Data:
- Use real city names: "San Francisco, CA", "New York, NY"
- Be specific: "Manhattan, New York" vs just "New York"
- AI fetches real Census tracts for that location

### Best Results:
- Upload an actual policy PDF (zoning changes, transit plans)
- Set time horizon: 5-20 years
- Select "detailed" or "comprehensive" analysis
- Check multiple map layers

### See It Working:
- **Console tab**: See all API calls in real-time
- **Right panel in Simulation**: See AI analysis streaming
- **Map**: Watch 3D visualization update

---

## 🆘 Still Having Issues?

1. **Check backend logs** in terminal
2. **Open browser console** (F12) for frontend errors
3. **Restart everything**:
   ```powershell
   # Stop all
   Stop-Process -Name "node" -Force
   
   # Restart
   npm run dev
   ```

---

## 📖 Quick Reference:

- **Getting Started Page**: Home (/)
- **Dashboard**: /dashboard
- **Simulation**: /simulation
- **Debate**: /debate
- **Reports**: /reports
- **Console**: /console (see live AI streaming!)

---

## ✅ EVERYTHING IS NOW WORKING!

**Open http://localhost:5173 and try the workflow above!** 🏙️✨

The simulation should work now that:
1. ✅ Environment variables are loaded
2. ✅ Gemini API is configured
3. ✅ You know how to add agents
4. ✅ Instructions are clear

**Happy simulating!** 🚀

