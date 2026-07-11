$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir '..\..')
$Port = 5500
$HostName = '127.0.0.1'
$GameUrl = "http://${HostName}:$Port/index.html"

function Test-PortOpen {
    param (
        [string]$ComputerName,
        [int]$PortNumber
    )

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.BeginConnect($ComputerName, $PortNumber, $null, $null)
        $isOpen = $connection.AsyncWaitHandle.WaitOne(250, $false)

        if ($isOpen) {
            $client.EndConnect($connection)
        }

        return $isOpen
    }
    catch {
        return $false
    }
    finally {
        $client.Close()
    }
}

Set-Location $ProjectRoot

Write-Host "Battleships and Subs launcher"
Write-Host "Project: $ProjectRoot"
Write-Host "Game:    $GameUrl"
Write-Host ''

if (Test-PortOpen -ComputerName $HostName -PortNumber $Port) {
    Write-Host "A server is already running on port $Port. Opening the game..."
    Start-Process $GameUrl
    exit 0
}

$HttpServer = Join-Path $ProjectRoot 'node_modules\.bin\http-server.cmd'

if (Test-Path $HttpServer) {
    Write-Host "Starting local server with http-server..."
    Start-Process $GameUrl
    & $HttpServer . -a $HostName -p $Port -c-1
    exit $LASTEXITCODE
}

$Python = Get-Command python -ErrorAction SilentlyContinue

if ($Python) {
    Write-Host "http-server was not found. Starting local server with Python..."
    Start-Process $GameUrl
    & $Python.Source -m http.server $Port --bind $HostName
    exit $LASTEXITCODE
}

Write-Error "No local server runtime found. Run 'npm install' from $ProjectRoot, then run this script again."
