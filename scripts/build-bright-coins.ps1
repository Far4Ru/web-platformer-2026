Add-Type -AssemblyName System.Drawing
$sourcePath = Join-Path $PSScriptRoot '..\assets\spritesheets\source\coin-bright-source.png'
$reversePath = Join-Path $PSScriptRoot '..\assets\spritesheets\source\coin-bright-reverse-source.png'
$targetPath = Join-Path $PSScriptRoot '..\assets\animations\pickups\spin.png'
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
$reverse = [System.Drawing.Bitmap]::FromFile($reversePath)
$sheet = [System.Drawing.Bitmap]::new(1448, 362,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
try {
  $g = [System.Drawing.Graphics]::FromImage($sheet)
  try {
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $regions = @(@(0, 55, 600, 690), @(570, 55, 510, 690),
      @(1024, 55, 512, 690), @(1536, 55, 512, 690))
    for ($index = 0; $index -lt 4; $index++) {
      $region = $regions[$index]
      $frameSource = if ($index -eq 3) { $reverse } else { $source }
      if ($index -eq 3) { $region = @(1500, 70, 548, 520) }
      $g.DrawImage($frameSource,
        [System.Drawing.Rectangle]::new($index * 362 + 10, 10, 342, 342),
        [System.Drawing.Rectangle]::new($region[0], $region[1], $region[2], $region[3]),
        [System.Drawing.GraphicsUnit]::Pixel)
    }
  } finally { $g.Dispose() }
  $sheet.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $static = [System.Drawing.Bitmap]::new(362, 362,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $iconGraphics = [System.Drawing.Graphics]::FromImage($static)
    try {
      $iconGraphics.DrawImage($sheet,
        [System.Drawing.Rectangle]::new(0, 0, 362, 362),
        [System.Drawing.Rectangle]::new(0, 0, 362, 362),
        [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $iconGraphics.Dispose() }
    $static.Save((Join-Path $PSScriptRoot '..\assets\sprites\objects\gold-coin.png'),
      [System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $static.Dispose() }
} finally { $sheet.Dispose(); $source.Dispose(); $reverse.Dispose() }
