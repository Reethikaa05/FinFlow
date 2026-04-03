#!/bin/bash
# FinFlow Startup Script
echo ""
echo "⚡  FinFlow — Finance Dashboard"
echo "================================"

# Check node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js v16+"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 16 ]; then
  echo "❌ Node.js v16+ required. Found: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# Install deps
echo ""
echo "📦 Installing dependencies..."
cd backend && npm install --silent && cd ..
cd frontend && npm install --silent && cd ..
echo "✅ Dependencies installed"

# Seed database
echo ""
echo "🌱 Seeding database..."
cd backend && node src/db/seed.js && cd ..

# Start backend
echo ""
echo "🚀 Starting backend on port 3001..."
cd backend && npm start &
BACKEND_PID=$!
sleep 3

# Verify backend
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "✅ Backend running at http://localhost:3001"
  echo "📚 Swagger docs at  http://localhost:3001/api/docs"
else
  echo "⚠️  Backend may still be starting..."
fi

# Start frontend
echo ""
echo "🌐 Starting frontend on port 3000..."
cd frontend && npm start &

echo ""
echo "================================"
echo "🎉 FinFlow is starting!"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  API Docs:  http://localhost:3001/api/docs"
echo "  API Base:  http://localhost:3001/api"
echo ""
echo "  Admin:     admin@finflow.com   / admin123"
echo "  Analyst:   sarah@finflow.com   / password123"
echo "  Viewer:    john@finflow.com    / password123"
echo ""
echo "Press Ctrl+C to stop"
wait
