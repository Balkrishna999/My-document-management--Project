Write-Host "Testing backend server startup..." -ForegroundColor Green
Set-Location "backend"
Write-Host "Starting node server..." -ForegroundColor Yellow
try {
    $process = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -NoNewWindow
    Start-Sleep 3
    if (!$process.HasExited) {
        Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
        $process.Kill()
    } else {
        Write-Host "❌ Backend server failed to start" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
}
