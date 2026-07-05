# XyloFacilitator Agent Demo - Setup Script
# Run this once to install dependencies and generate a wallet

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  XyloFacilitator Agent Demo - Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js not found. Install Node.js 22+ first." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green

# Install seller-api dependencies
Write-Host "`n--- Installing Seller API dependencies ---" -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\seller-api"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Failed to install seller-api deps" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Seller API dependencies installed" -ForegroundColor Green

# Install agent dependencies
Write-Host "`n--- Installing Agent dependencies ---" -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\agent"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Failed to install agent deps" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Agent dependencies installed" -ForegroundColor Green

# Create .env files from examples if they don't exist
Set-Location -Path "$PSScriptRoot\seller-api"
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Created seller-api/.env (edit with your XYLO_API_KEY)" -ForegroundColor Green
}

Set-Location -Path "$PSScriptRoot\agent"
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Created agent/.env (edit with your OPENAI_API_KEY)" -ForegroundColor Green
}

# Generate agent wallet
Write-Host "`n--- Generating Agent Wallet ---" -ForegroundColor Yellow
npx tsx src/wallet.ts

Set-Location -Path $PSScriptRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor White
Write-Host "  1. Edit seller-api/.env  -> Add your XYLO_API_KEY" -ForegroundColor White
Write-Host "  2. Edit agent/.env       -> Add your OPENAI_API_KEY" -ForegroundColor White
Write-Host "  3. Start the seller:       cd seller-api; npm run dev" -ForegroundColor White
Write-Host "  4. Start the agent:        cd agent; npm start" -ForegroundColor White
Write-Host "  5. Ask a question:         'What's the weather in Dubai?'" -ForegroundColor White
Write-Host ""
