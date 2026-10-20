Add-Type -AssemblyName System.Drawing
$folder = Join-Path $PSScriptRoot '..\assets\ui'
$base = [System.Drawing.Bitmap]::FromFile((Join-Path $folder 'round_brown.png'))
$ink = [System.Drawing.Brushes]::SaddleBrown
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(61, 39, 20), 4)
try {
  foreach ($name in @('pause', 'play', 'sound', 'sound-off', 'restart', 'trophy')) {
    $bitmap = [System.Drawing.Bitmap]::new(64, 64,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
      $g.DrawImage($base, 0, 0, 64, 64)
      switch ($name) {
        'pause' {
          $g.FillRectangle($ink, 23, 20, 6, 24)
          $g.FillRectangle($ink, 35, 20, 6, 24)
        }
        'play' {
          $points = [System.Drawing.Point[]]@(
            [System.Drawing.Point]::new(25, 18), [System.Drawing.Point]::new(45, 32),
            [System.Drawing.Point]::new(25, 46))
          $g.FillPolygon($ink, $points)
        }
        { $_ -in @('sound', 'sound-off') } {
          $points = [System.Drawing.Point[]]@(
            [System.Drawing.Point]::new(17, 27), [System.Drawing.Point]::new(24, 27),
            [System.Drawing.Point]::new(34, 19), [System.Drawing.Point]::new(34, 45),
            [System.Drawing.Point]::new(24, 37), [System.Drawing.Point]::new(17, 37))
          $g.FillPolygon($ink, $points)
          if ($name -eq 'sound') { $g.DrawArc($pen, 28, 20, 19, 24, -55, 110) }
          else {
            $g.DrawLine($pen, 40, 25, 49, 39)
            $g.DrawLine($pen, 49, 25, 40, 39)
          }
        }
        'restart' {
          $g.DrawArc($pen, 19, 20, 27, 27, -55, 290)
          $points = [System.Drawing.Point[]]@(
            [System.Drawing.Point]::new(45, 15), [System.Drawing.Point]::new(47, 28),
            [System.Drawing.Point]::new(36, 23))
          $g.FillPolygon($ink, $points)
        }
        'trophy' {
          $g.FillEllipse($ink, 23, 17, 19, 22)
          $g.DrawArc($pen, 13, 17, 18, 20, 0, 180)
          $g.DrawArc($pen, 35, 17, 18, 20, 0, 180)
          $g.FillRectangle($ink, 30, 37, 5, 9)
          $g.FillRectangle($ink, 23, 45, 19, 4)
        }
      }
      $bitmap.Save((Join-Path $folder "icon-$name.png"),
        [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $g.Dispose(); $bitmap.Dispose() }
  }
} finally { $base.Dispose(); $pen.Dispose() }
