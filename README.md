# Legality AI Red Flag Detector

A modern React + Vite + Tailwind CSS frontend application for detecting risky clauses and potential legal issues in documents.

## Features

- **Home Page**: Welcome page with feature overview and how it works
- **Upload Page**: Drag-and-drop file upload with preview support
- **Analysis Page**: Document analysis with risk highlighting and filtering
- **Components**: Reusable UI components (Navbar, UploadBox, Loader, ClauseHighlighter, RiskCard)

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── UploadBox.jsx
│   ├── Loader.jsx
│   ├── ClauseHighlighter.jsx
│   └── RiskCard.jsx
├── pages/
│   ├── Home.jsx
│   ├── Upload.jsx
│   └── Analysis.jsx
├── services/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

## API Configuration

Update the `API_BASE_URL` in `src/services/api.js` with your actual API endpoint.

## Supported File Types

- Documents: PDF, DOC, DOCX
- Images: JPG, JPEG, PNG

