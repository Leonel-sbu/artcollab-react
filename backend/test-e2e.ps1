Write-Host "1) Health..." -ForegroundColor Cyan
$h = Invoke-RestMethod http://localhost:5000/api/health
if (-not $h.success) { throw "Health failed" }
Write-Host "   PASS" -ForegroundColor Green

Write-Host "2) Register..." -ForegroundColor Cyan
$email = "e2e$((Get-Random -Minimum 1000 -Maximum 9999))@demo.com"
$reg = @{ name="E2E User"; email=$email; password="Pass1234!"; role="artist" } | ConvertTo-Json
$r = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" -Body $reg
$token = $r.token
if (-not $token) { throw "Register did not return token" }
Write-Host "   PASS ($email)" -ForegroundColor Green

Write-Host "3) /me..." -ForegroundColor Cyan
$me = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/auth/me" `
  -Headers @{ Authorization="Bearer $token" }
if (-not $me.success) { throw "/me failed" }
Write-Host "   PASS" -ForegroundColor Green

Write-Host "4) Stats before..." -ForegroundColor Cyan
$s1 = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/dashboard/stats" `
  -Headers @{ Authorization="Bearer $token" }
$before = [int]$s1.data.totalArtworks
Write-Host "   totalArtworks=$before" -ForegroundColor Yellow

Write-Host "5) Create artwork..." -ForegroundColor Cyan
$art = @{
  title="E2E Test Artwork"
  description="Created during E2E"
  price=2500
  imageUrl="https://picsum.photos/seed/artcollab/900/600"
  status="published"
} | ConvertTo-Json

$c = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/artworks" `
  -Headers @{ Authorization="Bearer $token" } `
  -ContentType "application/json" -Body $art

if (-not $c.success) { throw "Create artwork failed" }
Write-Host "   PASS" -ForegroundColor Green

Write-Host "6) Stats after..." -ForegroundColor Cyan
$s2 = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/dashboard/stats" `
  -Headers @{ Authorization="Bearer $token" }

$after = [int]$s2.data.totalArtworks
if ($after -ne ($before + 1)) {
  throw "Expected totalArtworks to increase by 1 ($before -> $after)"
}

Write-Host "   PASS totalArtworks=$after" -ForegroundColor Green

Write-Host "7) List artworks..." -ForegroundColor Cyan
$list = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/artworks"
if (-not $list.success) { throw "List artworks failed" }

Write-Host "   PASS items=$($list.items.Count)" -ForegroundColor Green

Write-Host "`nALL TESTS PASSED " -ForegroundColor Green
