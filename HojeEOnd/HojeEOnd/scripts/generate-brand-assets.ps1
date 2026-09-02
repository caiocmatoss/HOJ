param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\assets\images")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-RoundedRectanglePath {
  param(
    [System.Drawing.RectangleF]$Rectangle,
    [float]$Radius
  )

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $Radius * 2
  $arc = [System.Drawing.RectangleF]::new($Rectangle.X, $Rectangle.Y, $diameter, $diameter)

  $path.AddArc($arc, 180, 90)
  $arc.X = $Rectangle.Right - $diameter
  $path.AddArc($arc, 270, 90)
  $arc.Y = $Rectangle.Bottom - $diameter
  $path.AddArc($arc, 0, 90)
  $arc.X = $Rectangle.X
  $path.AddArc($arc, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-NavigationPath {
  param([float]$Size)

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $points = [System.Drawing.PointF[]]@(
    ([System.Drawing.PointF]::new(0, -($Size * 0.31))),
    ([System.Drawing.PointF]::new($Size * 0.27, $Size * 0.28)),
    ([System.Drawing.PointF]::new(0, $Size * 0.15)),
    ([System.Drawing.PointF]::new(-($Size * 0.27), $Size * 0.28))
  )
  $path.AddPolygon($points)
  return $path
}

function Draw-BrandSymbol {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$CenterX,
    [float]$CenterY,
    [float]$TileSize,
    [bool]$Monochrome = $false,
    [bool]$DrawGlow = $true
  )

  $saved = $Graphics.Save()
  $Graphics.TranslateTransform($CenterX, $CenterY)
  $Graphics.RotateTransform(12)

  if ($Monochrome) {
    $navigation = New-NavigationPath ($TileSize * 0.96)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $Graphics.FillPath($white, $navigation)
    $white.Dispose()
    $navigation.Dispose()
    $Graphics.Restore($saved)
    return
  }

  if ($DrawGlow) {
    $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 245, 197, 66))
    $Graphics.FillEllipse(
      $glowBrush,
      -($TileSize * 0.64),
      -($TileSize * 0.64),
      $TileSize * 1.28,
      $TileSize * 1.28
    )
    $glowBrush.Dispose()
  }

  $tileRectangle = [System.Drawing.RectangleF]::new(
    -($TileSize / 2),
    -($TileSize / 2),
    $TileSize,
    $TileSize
  )
  $tilePath = New-RoundedRectanglePath $tileRectangle ($TileSize * 0.22)
  $tileBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $tileRectangle,
    [System.Drawing.Color]::FromArgb(255, 255, 218, 91),
    [System.Drawing.Color]::FromArgb(255, 224, 169, 43),
    45
  )
  $Graphics.FillPath($tileBrush, $tilePath)

  $highlightPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(92, 255, 244, 188), [Math]::Max(2, $TileSize * 0.012))
  $Graphics.DrawPath($highlightPen, $tilePath)

  $navigation = New-NavigationPath ($TileSize * 0.72)
  $navigationBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 13, 15))
  $Graphics.FillPath($navigationBrush, $navigation)

  $navigationBrush.Dispose()
  $navigation.Dispose()
  $highlightPen.Dispose()
  $tileBrush.Dispose()
  $tilePath.Dispose()
  $Graphics.Restore($saved)
}

function New-BrandBitmap {
  param(
    [int]$Size,
    [string]$Path,
    [float]$TileScale,
    [bool]$Transparent = $false,
    [bool]$Monochrome = $false,
    [bool]$Ambient = $false
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  if ($Transparent) {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 11, 13, 15))
  }

  if ($Ambient) {
    $outer = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 245, 197, 66))
    $inner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 106, 191, 160))
    $graphics.FillEllipse($outer, $Size * 0.09, $Size * 0.09, $Size * 0.82, $Size * 0.82)
    $graphics.FillEllipse($inner, $Size * 0.19, $Size * 0.19, $Size * 0.62, $Size * 0.62)
    $outer.Dispose()
    $inner.Dispose()
  }

  $drawArguments = @{
    Graphics = $graphics
    CenterX = $Size / 2
    CenterY = $Size / 2
    TileSize = $Size * $TileScale
    Monochrome = $Monochrome
    DrawGlow = -not $Monochrome
  }
  Draw-BrandSymbol @drawArguments

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

New-BrandBitmap -Size 1024 -Path (Join-Path $resolvedOutput "brand-icon.png") -TileScale 0.47 -Ambient $true
New-BrandBitmap -Size 512 -Path (Join-Path $resolvedOutput "brand-splash.png") -TileScale 0.56 -Transparent $true
New-BrandBitmap -Size 1024 -Path (Join-Path $resolvedOutput "brand-android-foreground.png") -TileScale 0.48 -Transparent $true
New-BrandBitmap -Size 1024 -Path (Join-Path $resolvedOutput "brand-android-monochrome.png") -TileScale 0.34 -Transparent $true -Monochrome $true
New-BrandBitmap -Size 256 -Path (Join-Path $resolvedOutput "brand-favicon.png") -TileScale 0.5 -Ambient $true

Write-Output "Brand assets generated in $resolvedOutput"
