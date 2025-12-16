# Legality AI Frontend

React + Vite + Tailwind CSS frontend for Legality AI Red Flag Detector.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Configuration

Update API URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API service functions
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── index.html
└── package.json
```

