# Local Development Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18.x or higher | https://nodejs.org |
| Python | 3.8 - 3.11 | https://python.org |
| MongoDB | 6.x or higher | https://mongodb.com |
| Git | Latest | https://git-scm.com |

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Deepseek
```

## Step 2: Backend Setup

### 2.1 Navigate to backend folder
```bash
cd backend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Configure environment variables
Create a `.env` file in the backend folder:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/attendance_system

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=30d

# AI/ML Service URL
AI_SERVICE_URL=http://localhost:8000

# CORS Settings
FRONTEND_URL=http://localhost:3001
```

### 2.4 Start the backend server
```bash
npm run dev
```

Backend will run on: `http://localhost:5001`

## Step 3: Frontend Setup

### 3.1 Navigate to frontend folder
```bash
cd ../frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Start the development server
```bash
npm run dev
```

Frontend will run on: `http://localhost:3001`

## Step 4: AI/ML Service Setup

### 4.1 Navigate to ai-ml folder
```bash
cd ../ai-ml
```

### 4.2 Create Python virtual environment (recommended)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 4.3 Install Python dependencies
```bash
pip install -r requirements.txt
```

### 4.4 Download pre-trained models
The face recognition models will be downloaded automatically on first run.

### 4.5 Start the AI service
```bash
python api/app.py
```

AI Service will run on: `http://localhost:8000`

## Step 5: MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service:
   - Windows: MongoDB runs as a service automatically
   - Linux: `sudo systemctl start mongod`
   - Mac: `brew services start mongodb-community`

### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://cloud.mongodb.com
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## Step 6: Verify Installation

### Check Backend
```bash
curl http://localhost:5001/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Attendance System API is running",
  "version": "1.0.0"
}
```

### Check Frontend
Open `http://localhost:3001` in browser

### Check AI Service
```bash
curl http://localhost:8000/api/health
```

## Running All Services Together

### Using separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 3 - AI Service:**
```bash
cd ai-ml && python api/app.py
```

### Using Docker (Optional):
```bash
docker-compose up
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher@school.com | teacher123 |

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings

### AI Service Dependencies
If face_recognition fails to install:
```bash
# Windows - Install Visual Studio Build Tools first
# Linux - Install cmake and dlib dependencies
sudo apt-get install build-essential cmake
sudo apt-get install libopenblas-dev liblapack-dev
```

### Camera Not Working
- Grant browser camera permissions
- Use HTTPS in production (required for camera API)

## Next Steps

1. Create a school profile
2. Add teachers
3. Add classes and sections
4. Register students with face data
5. Start taking attendance!

---

For more help, see the [User Guides](../user-guides/) folder.
