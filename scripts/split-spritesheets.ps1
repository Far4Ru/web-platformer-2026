Add-Type -AssemblyName System.Drawing

$sourceRoot = Join-Path $PSScriptRoot '..\assets\spritesheets\source'
$targetRoot = Join-Path $PSScriptRoot '..\assets\sprites'

function Clear-TransparentFringe($bitmap) {
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $alpha = $bitmap.GetPixel($x, $y).A
      if ($alpha -gt 0 -and $alpha -le 5) {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      }
    }
  }
}

function Export-Cells($sourceName, $group, $columns, $rows, $names) {
  $sourcePath = Join-Path $sourceRoot "$sourceName.png"
  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    for ($row = 0; $row -lt $rows; $row++) {
      for ($column = 0; $column -lt $columns; $column++) {
        $name = $names[$row * $columns + $column]
        if (-not $name) { continue }
        $folder = Join-Path $targetRoot $group
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        $left = [int][Math]::Round($column * $source.Width / $columns)
        $top = [int][Math]::Round($row * $source.Height / $rows)
        $right = [int][Math]::Round(($column + 1) * $source.Width / $columns)
        $bottom = [int][Math]::Round(($row + 1) * $source.Height / $rows)
        $width = $right - $left
        $height = $bottom - $top
        $cell = [System.Drawing.Bitmap]::new($width, $height,
          [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
          $graphics = [System.Drawing.Graphics]::FromImage($cell)
          try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.DrawImage($source,
              [System.Drawing.Rectangle]::new(0, 0, $width, $height),
              [System.Drawing.Rectangle]::new($left, $top, $width, $height),
              [System.Drawing.GraphicsUnit]::Pixel)
          } finally { $graphics.Dispose() }
          if ($group -in @('effects', 'pickups')) { Clear-TransparentFringe $cell }
          $cell.Save((Join-Path $folder "$name.png"),
            [System.Drawing.Imaging.ImageFormat]::Png)
        } finally { $cell.Dispose() }
      }
    }
  } finally { $source.Dispose() }
}

function Export-Rect($sourceName, $group, $name, $left, $top,
  $width, $height, $canvasWidth = $width, $canvasHeight = $height) {
  $folder = Join-Path $targetRoot $group
  New-Item -ItemType Directory -Path $folder -Force | Out-Null
  $source = [System.Drawing.Bitmap]::FromFile((Join-Path $sourceRoot "$sourceName.png"))
  try {
    $cell = [System.Drawing.Bitmap]::new($canvasWidth, $canvasHeight,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($cell)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.DrawImage($source,
          [System.Drawing.Rectangle]::new(0, 0, $width, $height),
          [System.Drawing.Rectangle]::new($left, $top, $width, $height),
          [System.Drawing.GraphicsUnit]::Pixel)
      } finally { $graphics.Dispose() }
      if ($group -in @('effects', 'pickups')) { Clear-TransparentFringe $cell }
      $cell.Save((Join-Path $folder "$name.png"),
        [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $cell.Dispose() }
  } finally { $source.Dispose() }
}

Export-Cells 'objects' 'objects' 3 3 @(
  'gold-coin', 'moss-chest', 'cursed-chest',
  '', '', '',
  'stone-spike', '', 'carved-pedestal')
Export-Rect 'objects' 'objects' 'moss-platform' 0 341 512 309 512 341
Export-Rect 'objects' 'objects' 'ice-platform' 512 341 512 260 512 341
Export-Rect 'objects' 'objects' 'swamp-platform' 1024 341 512 330 512 341
Export-Rect 'objects' 'objects' 'jade-portal' 512 610 512 390
Export-Cells 'effects' 'effects' 3 3 @(
  '', 'fireball', 'ice-shard',
  '', '', '',
  'dust-puff', '', '')
Export-Rect 'effects' 'effects' 'sword-slash' 0 55 512 310
Export-Rect 'effects' 'effects' 'wooden-arrow' 0 445 512 185
Export-Rect 'effects' 'effects' 'hostile-projectile' 512 380 512 260
Export-Rect 'effects' 'effects' 'healing-beam' 1024 380 512 270
Export-Rect 'effects' 'effects' 'coin-sparkle' 512 655 512 369
Export-Rect 'effects' 'effects' 'cursed-spike' 1024 650 512 374
Export-Cells 'pickups' 'pickups' 4 3 @(
  '', '', '', '',
  '', '', '', '',
  'heal-potion', 'speed-boots', 'damage-sword', 'sparkles')
