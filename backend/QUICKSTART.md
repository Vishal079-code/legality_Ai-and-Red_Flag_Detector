# Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (running locally or MongoDB Atlas connection string)

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/legality-ai
PORT=5000
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legality-ai?retryWrites=true&w=majority
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

**Or use MongoDB Atlas** (cloud) - no local installation needed.

### 4. Start the Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Upload a Document:**
```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@/path/to/your/document.pdf"
```

## Frontend Integration

The frontend is already configured to use `http://localhost:5000` as the API base URL.

To start the frontend:
```bash
cd ..  # Go back to root
npm install
npm run dev
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For local MongoDB, ensure it's running on port 27017

### OCR Errors
- Tesseract.js requires time to download language data on first run
- Large images may take longer to process
- Ensure sufficient disk space for temporary file storage

### File Upload Errors
- Check file size (max 10MB)
- Ensure file type is supported (PDF, DOCX, JPG, PNG)
- Check `uploads/` directory has write permissions

