# Start backend (FastAPI) in current PowerShell window
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python が見つかりません。Python 3.12+ をインストールしてください。"
    exit 1
}

Set-Location -Path "$PSScriptRoot\backend"

$venvPath = "$PSScriptRoot\\.venv_backend"
if (-not (Test-Path $venvPath)) {
    Write-Output "仮想環境を作成します: $venvPath"
    python -m venv $venvPath
}

Write-Output "仮想環境をアクティベートします"
. "$venvPath\Scripts\Activate.ps1"

Write-Output "pip を更新し、ビルドと依存関係をインストールします..."
python -m pip install --upgrade pip setuptools build
python -m pip install -e .
python -m pip install uvicorn[standard] alembic

Write-Output "(オプション) マイグレーションを適用します: alembic upgrade head"
Write-Output "バックエンドを起動します (uvicorn)..."
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
