# Quick Start Guide - How to Run the Website

Follow these steps to run the Legality AI Red Flag Detector website locally.

## Prerequisites

Before starting, make sure you have:
- ✅ **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ **MongoDB** - Either:
  - Local MongoDB installed, OR
  - MongoDB Atlas account (free cloud database)

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Easiest - Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/legality-ai`)

### Option B: Local MongoDB

1. Download MongoDB from [mongodb.com/try/download](https://www.mongodb.com/try/download)
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017/legality-ai`

## Step 2: Set Up Backend

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Or manually create .env file with:
   ```

4. **Edit `.env` file** (create it if it doesn't exist):
   ```env
   MONGODB_URI=mongodb://localhost:27017/legality-ai
   PORT=5000
   ```
   
   **For MongoDB Atlas**, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legality-ai?retryWrites=true&w=majority
   PORT=5000
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   🚀 Server running on http://localhost:5000
   📡 API Base URL: http://localhost:5000
   MongoDB Connected: ...
   ```

   **Keep this terminal open!**

## Step 3: Set Up Frontend

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

## Step 4: Open the Website

1. **Open your browser** and go to:
   ```
   http://localhost:5173
   ```

2. You should see the **Legality AI Red Flag Detector** homepage!

## Running Both Services

You need **TWO terminal windows** running simultaneously:

### Terminal 1 - Backend:
```bash
cd backend
npm start
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Testing the Website

1. **Home Page**: Should show welcome page with features
2. **Upload Page**: Click "Upload" in navbar, drag & drop a PDF/DOCX/image
3. **Analysis Page**: After upload, you'll be redirected to see analysis results

## Troubleshooting

### Backend won't start
- **MongoDB not connected**: Check your `.env` file has correct `MONGODB_URI`
- **Port 5000 already in use**: Change `PORT` in `.env` to another number (e.g., 5001)
- **Missing dependencies**: Run `npm install` again in `backend/` folder

### Frontend won't start
- **Port 5173 already in use**: Vite will automatically use next available port
- **Missing dependencies**: Run `npm install` again in `frontend/` folder
- **API connection error**: Make sure backend is running on port 5000

### Can't upload files
- **Backend not running**: Make sure backend server is running
- **CORS error**: Backend CORS is configured for `localhost:5173`
- **File too large**: Maximum file size is 10MB

### MongoDB Connection Error
- **Local MongoDB**: Make sure MongoDB service is running
  - Windows: Check Services app, start "MongoDB" service
  - Mac/Linux: `sudo systemctl start mongod` or `mongod`
- **MongoDB Atlas**: Check your connection string is correct
- **Firewall**: MongoDB Atlas may require IP whitelist (add `0.0.0.0/0` for testing)

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies (first time only)
npm start           # Start backend server

# Frontend  
cd frontend
npm install          # Install dependencies (first time only)
npm run dev         # Start frontend dev server

# Build frontend for production
cd frontend
npm run build       # Creates dist/ folder
```

## Next Steps

- ✅ Website is running!
- 📝 Upload documents to test
- 🔧 Integrate your Python model (see `backend/INTEGRATION_GUIDE.md`)
- 🚀 Deploy to production (see `DEPLOYMENT.md`)

## Need Help?

- Check `backend/README.md` for backend details
- Check `frontend/README.md` for frontend details
- Check `backend/INTEGRATION_GUIDE.md` for Python model integration

