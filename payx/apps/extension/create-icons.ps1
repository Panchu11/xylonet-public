Add-Type -AssemblyName System.Drawing

$iconsDir = "c:\Users\DELL\Desktop\Panchu\arc\payx\apps\extension\icons"

$sizes = @(16, 32, 48, 128)

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(45, 212, 191))
    
    $fontSize = [Math]::Max(8, $size / 2)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString("P", $font, $brush, $rect, $sf)
    
    $g.Dispose()
    $font.Dispose()
    $brush.Dispose()
    $sf.Dispose()
    
    $filePath = Join-Path $iconsDir "icon$size.png"
    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    Write-Host "Created $filePath"
}

Write-Host "All icons created!"
