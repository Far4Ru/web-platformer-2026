Add-Type -AssemblyName System.Drawing

$sourceRoot = Join-Path $PSScriptRoot '..\assets\spritesheets\source'
$targetRoot = Join-Path $PSScriptRoot '..\assets\animations'

function Export-Clip($sourceName, $columns, $clip, $frames, $top, $height) {
  $source = [System.Drawing.Bitmap]::FromFile((Join-Path $sourceRoot "$sourceName.png"))
  try {
    $frameWidth = [int]($source.Width / $columns)
    $folder = Join-Path $targetRoot $sourceName
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    $sheet = [System.Drawing.Bitmap]::new($frameWidth * $frames.Count, $height,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($sheet)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        for ($index = 0; $index -lt $frames.Count; $index++) {
          $graphics.DrawImage($source,
            [System.Drawing.Rectangle]::new($index * $frameWidth, 0, $frameWidth, $height),
            [System.Drawing.Rectangle]::new($frames[$index] * $frameWidth, $top,
              $frameWidth, $height), [System.Drawing.GraphicsUnit]::Pixel)
        }
      } finally { $graphics.Dispose() }
      if ($sourceName -eq 'pickups' -and $clip -eq 'open') {
        for ($y = 280; $y -lt $height; $y++) {
          for ($x = 0; $x -lt $sheet.Width; $x++) {
            if ($sheet.GetPixel($x, $y).A -le 5) {
              $sheet.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
          }
        }
      }
      $sheet.Save((Join-Path $folder "$clip.png"),
        [System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $sheet.Dispose() }
    $atlasFrames = @(for ($index = 0; $index -lt $frames.Count; $index++) {
      @{ x = $index * $frameWidth; y = 0; w = $frameWidth; h = $height }
    })
    $atlas = @{ frames = $atlasFrames; animations = @{ $clip = @(0..($frames.Count - 1)) } }
    [System.IO.File]::WriteAllText((Join-Path $folder "$clip.json"),
      (ConvertTo-Json -InputObject $atlas -Depth 8),
      [System.Text.UTF8Encoding]::new($false))
  } finally { $source.Dispose() }
}

Export-Clip 'explorer' 6 'idle' @(0) 70 535
Export-Clip 'explorer' 6 'run' @(1, 2) 70 535
Export-Clip 'explorer' 6 'jump' @(3) 70 535
Export-Clip 'explorer' 6 'hurt' @(4) 70 535
Export-Clip 'explorer' 6 'victory' @(5) 70 535
Export-Clip 'explorer-actions' 6 'prepare' @(0) 70 555
Export-Clip 'explorer-actions' 6 'leap' @(1) 70 555
Export-Clip 'explorer-actions' 6 'fall' @(2) 70 555
Export-Clip 'explorer-actions' 6 'land' @(3) 70 555
Export-Clip 'explorer-actions' 6 'sword' @(4) 70 555
Copy-Item -LiteralPath (Join-Path $sourceRoot 'explorer-actions-sword.png') -Destination (Join-Path $targetRoot 'explorer-actions\sword.png') -Force
$swordAtlas = @{ frames = @(@{ x = 0; y = 0; w = 1013; h = 1553 }); animations = @{ sword = @(0) } }
[System.IO.File]::WriteAllText((Join-Path $targetRoot 'explorer-actions\sword.json'),
  (ConvertTo-Json -InputObject $swordAtlas -Depth 8),
  [System.Text.UTF8Encoding]::new($false))
Export-Clip 'explorer-actions' 6 'victory' @(5) 70 555
Export-Clip 'golem' 4 'idle' @(0) 70 550
Export-Clip 'golem' 4 'walk' @(1, 2) 70 550
Export-Clip 'golem' 4 'cast' @(3) 70 550
Export-Clip 'guardian' 4 'idle' @(0) 70 550
Export-Clip 'guardian' 4 'walk' @(1, 2) 70 550
Export-Clip 'guardian' 4 'attack' @(3) 70 550
Export-Clip 'boss' 4 'idle' @(0) 0 660
Export-Clip 'boss' 4 'walk' @(1) 0 660
Export-Clip 'boss' 4 'attack' @(2) 0 660
Export-Clip 'boss' 4 'hurt' @(3) 0 660
Export-Clip 'pickups' 4 'spin' @(0, 1, 2, 3) 0 362
Export-Clip 'pickups' 4 'open' @(0, 1, 2, 3) 362 315
& (Join-Path $PSScriptRoot 'build-bright-coins.ps1')
python (Join-Path $PSScriptRoot 'repair-animation-artifacts.py')
python (Join-Path $PSScriptRoot 'align-coin-animation.py')
