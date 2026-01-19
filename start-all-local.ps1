# Start all services in separate PowerShell windows
Write-Output "フロントエンド、バックエンド、mcp_server をそれぞれ別ウィンドウで起動します。"

$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root'; .\start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root'; .\start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root'; .\start-mcp_server.ps1"

Write-Output "開始コマンドを送信しました。各ウィンドウのログを確認してください。"
