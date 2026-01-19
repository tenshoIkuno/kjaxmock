# Start mcp_server simple script
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python が見つかりません。Python 3.12+ をインストールしてください。"
    exit 1
}

Set-Location -Path "$PSScriptRoot\mcp_server"

Write-Output "mcp_server を起動します (main.py を実行)..."
python main.py
