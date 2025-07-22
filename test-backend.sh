#!/bin/bash
echo "Testing backend server startup..."
cd backend
node index.js &
BACKEND_PID=$!
sleep 3
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend server started successfully!"
    kill $BACKEND_PID
else
    echo "❌ Backend server failed to start"
fi
