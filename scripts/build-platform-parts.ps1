Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot '..\assets\sprites\objects'
foreach ($kind in @('moss', 'ice', 'swamp')) {
  $source = [System.Drawing.Bitmap]::FromFile((Join-Path $root "$kind-platform.png"))
  try {
    foreach ($part in @(@('left', 38, 62), @('middle', 236, 40), @('right', 412, 62))) {
      $name, $sourceX, $width = $part
      $target = [System.Drawing.Bitmap]::new([int]$width, 250,
        [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($target)
        try {
          $graphics.DrawImage($source,
            [System.Drawing.Rectangle]::new(0, 0, [int]$width, 250),
            [System.Drawing.Rectangle]::new([int]$sourceX, 25, [int]$width, 250),
            [System.Drawing.GraphicsUnit]::Pixel)
        } finally { $graphics.Dispose() }
        # Extend artwork to every edge of each independent tile.
        for ($y = 0; $y -lt $target.Height; $y++) {
          $last = $null
          for ($x = 0; $x -lt $target.Width; $x++) {
            $pixel = $target.GetPixel($x, $y)
            if ($pixel.A -gt 10) {
              $last = [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B)
              $target.SetPixel($x, $y, $last)
            }
            elseif ($null -ne $last) { $target.SetPixel($x, $y, $last) }
          }
          $last = $null
          for ($x = $target.Width - 1; $x -ge 0; $x--) {
            $pixel = $target.GetPixel($x, $y)
            if ($pixel.A -gt 10) {
              $last = [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B)
              $target.SetPixel($x, $y, $last)
            }
            elseif ($null -ne $last) { $target.SetPixel($x, $y, $last) }
          }
        }
        for ($y = $target.Height - 2; $y -ge 0; $y--) {
          if ($target.GetPixel(0, $y).A -gt 10) { continue }
          for ($x = 0; $x -lt $target.Width; $x++) {
            $target.SetPixel($x, $y, $target.GetPixel($x, $y + 1))
          }
        }
        for ($y = 1; $y -lt $target.Height; $y++) {
          if ($target.GetPixel(0, $y).A -gt 10) { continue }
          for ($x = 0; $x -lt $target.Width; $x++) {
            $target.SetPixel($x, $y, $target.GetPixel($x, $y - 1))
          }
        }
        $target.Save((Join-Path $root "$kind-platform-$name.png"),
          [System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $target.Dispose() }
    }
  } finally { $source.Dispose() }
}
