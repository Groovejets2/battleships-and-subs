<#
.SYNOPSIS
    Starts the Battleships and Subs game server locally.
.DESCRIPTION
    This PowerShell script installs dependencies (if needed) and starts the development server
    for the Battleships and Subs game.
.NOTES
    File Name      : Start-GameServer.ps1
    Author         : Aider
    Prerequisite   : Node.js must be installed
#>

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm -v
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not available. Please install Node.js." -ForegroundColor Red
    exit 1
}

# Navigate to the project directory (assuming this script is in docs/scripts/)
$scriptPath = $PSScriptRoot
$projectRoot = Resolve-Path "$scriptPath\..\.."
Set-Location $projectRoot

Write-Host "Project directory: $projectRoot" -ForegroundColor Cyan

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "package.json not found in $projectRoot" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "Dependencies installed successfully." -ForegroundColor Green
    } catch {
        Write-Host "Failed to install dependencies: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

try {
    npm run dev
} catch {
    Write-Host "Failed to start server: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Server stopped." -ForegroundColor Yellow
