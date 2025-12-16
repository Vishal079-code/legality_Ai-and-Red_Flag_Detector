# Deployment Guide

This guide covers deploying the Legality AI Red Flag Detector application with separate frontend and backend.

## Project Structure

```
legality-ai-red-flag-detector/
├── frontend/          # React frontend (deploy separately)
├── backend/           # Node.js backend (deploy separately)
│   └── python/        # Python model service
└── README.md
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Update API URL:**
   - After deployment, update `frontend/src/services/api.js` with your backend URL
   - Or use environment variables in Vite

### Option 2: Netlify

1. **Build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy:**
   - Drag and drop the `dist/` folder to Netlify
   - Or connect your Git repository

3. **Update API URL** in `src/services/api.js`

### Option 3: Traditional Hosting

1. **Build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload `dist/` folder** to your web server (Apache, Nginx, etc.)

3. **Configure server** to serve `index.html` for all routes (SPA routing)

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**

2. **Create Heroku app:**
   ```bash
   cd backend
   heroku create legality-ai-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set PORT=5000
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Install Python buildpack** (for model service):
   ```bash
   heroku buildpacks:add heroku/python
   heroku buildpacks:add heroku/nodejs
   ```

### Option 2: DigitalOcean / AWS EC2

1. **SSH into server**

2. **Install dependencies:**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Python
   sudo apt-get install python3 python3-pip
   
   # MongoDB (or use MongoDB Atlas)
   # Follow MongoDB installation guide
   ```

3. **Clone repository:**
   ```bash
   git clone your-repo
   cd legality-ai-red-flag-detector/backend
   ```

4. **Install dependencies:**
   ```bash
   npm install
   cd python
   pip3 install -r requirements.txt
   ```

5. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

6. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name legality-ai-backend
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx** (reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Docker

1. **Create Dockerfile in backend:**
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```

2. **Build and run:**
   ```bash
   docker build -t legality-ai-backend .
   docker run -p 5000:5000 --env-file .env legality-ai-backend
   ```

## Python Model Service Setup

### On Server

1. **Install Python dependencies:**
   ```bash
   cd backend/python
   pip3 install -r requirements.txt
   ```

2. **Ensure Python is accessible:**
   - Check Python path: `which python3`
   - Update `backend/services/pythonService.js` if needed:
     ```javascript
     const pythonProcess = spawn('python3', [...]);
     ```

3. **Test Python service:**
   ```bash
   python3 backend/python/model_service.py --input test.pdf --analyze_only
   ```

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legality-ai
PORT=5000
NODE_ENV=production
```

### Frontend

Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'https://your-backend-url.com';
```

Or use Vite environment variables:
- Create `frontend/.env.production`:
  ```
  VITE_API_URL=https://your-backend-url.com
  ```
- Update `api.js`:
  ```javascript
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  ```

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legality-ai
   ```

### Option 2: Self-Hosted MongoDB

1. Install MongoDB on server
2. Configure authentication
3. Update connection string in `.env`

## File Storage

### For PDF Report Generation

The backend stores PDFs in `backend/storage/` for report generation. Ensure:

1. **Directory exists:**
   ```bash
   mkdir -p backend/storage
   mkdir -p backend/reports
   ```

2. **Permissions:**
   ```bash
   chmod 755 backend/storage
   chmod 755 backend/reports
   ```

3. **For cloud storage** (AWS S3, etc.):
   - Update `uploadController.js` to upload to S3
   - Update `reportController.js` to download from S3
   - Store S3 URLs in database instead of file paths

## CORS Configuration

Update `backend/server.js` for production:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.com', 'http://localhost:5173'],
  credentials: true
}));
```

## SSL/HTTPS

### Using Let's Encrypt (Nginx)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Using Cloudflare

- Add your domain to Cloudflare
- Enable SSL/TLS (Full)
- Update DNS records

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs legality-ai-backend
```

### Health Check

Test backend health:
```bash
curl https://your-backend-url.com/health
```

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check port availability

### Python model fails
- Verify Python is installed
- Check Python dependencies
- Test Python script directly
- Check file permissions

### CORS errors
- Update CORS configuration in `server.js`
- Verify frontend URL is whitelisted

### File upload fails
- Check file size limits
- Verify upload directory permissions
- Check disk space

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] MongoDB connected
- [ ] Python model service working
- [ ] File uploads working
- [ ] PDF report generation working
- [ ] CORS configured correctly
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] Error logging configured
- [ ] Backup strategy in place

