# Start frontend (Vite) in current PowerShell window
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error 'Node.js not found. Please install Node.js.'
    exit 1
}

Set-Location -Path "$PSScriptRoot\frontend"

if (-not (Test-Path node_modules)) {
    Write-Output 'node_modules not found. Installing dependencies...'
    npm install
}

# Start mock server in background (prefer .cjs for CommonJS)
$mockPathCjs = Join-Path $PSScriptRoot 'frontend\mock-server\server.cjs'
$mockPathJs = Join-Path $PSScriptRoot 'frontend\mock-server\server.js'
$nodeExeLocal = Join-Path $env:USERPROFILE '.local\node-v20.19.0-win-x64\node.exe'

if (Test-Path $mockPathCjs) {
    Write-Output 'Starting mock server (cjs) in background...'
    if (Test-Path $nodeExeLocal) {
        Start-Process $nodeExeLocal -ArgumentList "`"$mockPathCjs`"" -WorkingDirectory (Join-Path $PSScriptRoot 'frontend') -WindowStyle Hidden
    } else {
        Start-Process node -ArgumentList "`"$mockPathCjs`"" -WorkingDirectory (Join-Path $PSScriptRoot 'frontend') -WindowStyle Hidden
    }
    Start-Sleep -Milliseconds 300
} elseif (Test-Path $mockPathJs) {
    Write-Output 'Starting mock server (js) in background...'
    Start-Process node -ArgumentList "`"$mockPathJs`"" -WorkingDirectory (Join-Path $PSScriptRoot 'frontend') -WindowStyle Hidden
    Start-Sleep -Milliseconds 300
}

Write-Output 'Starting frontend (vite)...'
$viteCli = Join-Path (Join-Path $PSScriptRoot 'frontend') 'node_modules\vite\bin\vite.js'
if ((Test-Path $nodeExeLocal -PathType Leaf -ErrorAction SilentlyContinue) -and (Test-Path $viteCli)) {
    Write-Output 'Launching Vite with portable node...'
    Start-Process $nodeExeLocal -ArgumentList "`"$viteCli`"" -WorkingDirectory (Join-Path $PSScriptRoot 'frontend') -NoNewWindow -Wait
} else {
    Write-Output 'Launching Vite via npm run dev...'
    npm run dev
}
