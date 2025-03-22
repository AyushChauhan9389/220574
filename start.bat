@echo off
echo [94m[%time%][0m Setting up backend...

:: Setup backend
cd backend
if %errorlevel% neq 0 (
    echo [91mError: Backend directory not found[0m
    exit /b 1
)

echo [94m[%time%][0m Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [91mError: Failed to install backend dependencies[0m
    exit /b 1
)

echo [94m[%time%][0m Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo [91mError: Failed to build backend[0m
    exit /b 1
)

:: Setup frontend
echo [94m[%time%][0m Setting up frontend...
cd ../frontend
if %errorlevel% neq 0 (
    echo [91mError: Frontend directory not found[0m
    exit /b 1
)

echo [94m[%time%][0m Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [91mError: Failed to install frontend dependencies[0m
    exit /b 1
)

:: Start both services
echo [92m[%time%][0m Starting services...[0m

:: Start backend
cd ../backend
start "Backend Server" cmd /c "npm run dev"

:: Start frontend
cd ../frontend
start "Frontend Server" cmd /c "npm run dev"

echo [92mServices started successfully![0m
echo [94mBackend running on http://localhost:8080[0m
echo [94mFrontend running on http://localhost:3000[0m
echo [94mClose this window to stop all services[0m

:: Keep the script running
pause > nul
