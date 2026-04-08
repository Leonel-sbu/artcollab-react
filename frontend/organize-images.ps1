# List all image files in the current directory
$imageFiles = Get-ChildItem -Path "*.jpg", "*.jpeg", "*.png", "*.webp" | Select-Object -First 3

# Create public/images folder if it doesn't exist
$imageFolder = "public/images"
if (-not (Test-Path $imageFolder)) {
    New-Item -ItemType Directory -Path $imageFolder -Force | Out-Null
}

# Copy first 3 images to public/images folder
for ($i = 0; $i -lt 3 -and $i -lt $imageFiles.Count; $i++) {
    $newName = "images($($i+1)).jpg"
    Copy-Item -Path $imageFiles[$i].FullName -Destination "$imageFolder/$newName" -Force
    Write-Host "Copied $($imageFiles[$i].Name) to $imageFolder/$newName"
}

Write-Host "`nImages organized! Update Home.jsx if needed with your image names."
Write-Host "The code expects: images(1).jpg, images(2).jpg, images(3).jpg in public/images/"
