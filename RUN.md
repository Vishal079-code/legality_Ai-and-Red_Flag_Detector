# 🚀 How to Run the Website

## Quick Start (3 Steps)

### Step 1: Start MongoDB
Make sure MongoDB is running:
- **Local MongoDB**: Start the MongoDB service
- **MongoDB Atlas**: You're all set! (cloud database)

### Step 2: Start Backend Server

Open **Terminal 1**:
```bash
cd backend
npm install
npm start
```

Wait for: `🚀 Server running on http://localhost:5000`

### Step 3: Start Frontend

Open **Terminal 2** (new window):
```bash
cd frontend
npm install
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Step 4: Open Browser
Go to: **http://localhost:5173**

---

## Detailed Setup

### First Time Setup

1. **Create Backend Environment File:**
   ```bash
   cd backend
   # Copy the example file
   # Windows:
   copy .env.example .env
   
   # Mac/Linux:
   cp .env.example .env
   ```

2. **Edit `.env` file** in `backend/` folder:
   ```env
   MONGODB_URI=mongodb://localhost:27017/legality-ai
   PORT=5000
   ```
   
   **For MongoDB Atlas**, replace with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legality-ai
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**You need TWO terminal windows:**

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser!

---

## What You'll See

✅ **Backend running**: `Server running on http://localhost:5000`  
✅ **Frontend running**: `Local: http://localhost:5173/`  
✅ **Website**: Opens in browser showing the Legality AI homepage

---

## Troubleshooting

### "Cannot find module" error
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

### MongoDB connection error
- Check MongoDB is running
- Verify `.env` file has correct `MONGODB_URI`
- For MongoDB Atlas: Check your connection string

### Port already in use
- Backend: Change `PORT=5000` to `PORT=5001` in `.env`
- Frontend: Vite will auto-use next available port

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify `frontend/src/services/api.js` has correct URL

---

## Need MongoDB?

### Option 1: MongoDB Atlas (Free Cloud - Recommended)
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to `backend/.env`

### Option 2: Local MongoDB
1. Download from [mongodb.com/try/download](https://www.mongodb.com/try/download)
2. Install and start service
3. Use: `mongodb://localhost:27017/legality-ai`

---

## Success! 🎉

Once both servers are running:
- ✅ Upload documents on the Upload page
- ✅ View analysis results
- ✅ See risk highlights
- ✅ Download PDF reports (after Python model integration)


