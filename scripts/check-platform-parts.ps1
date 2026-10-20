Add-Type -AssemblyName System.Drawing
$folder = Join-Path $PSScriptRoot '..\assets\sprites\objects'
foreach ($file in (Get-ChildItem -LiteralPath $folder -Filter '*-platform-*.png')) {
  $bitmap = [System.Drawing.Bitmap]::FromFile($file.FullName)
  try {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      for ($x = 0; $x -lt $bitmap.Width; $x++) {
        if ($bitmap.GetPixel($x, $y).A -ne 255) {
          throw "$($file.Name) has a transparent pixel at $x,$y"
        }
      }
    }
  } finally { $bitmap.Dispose() }
}
Write-Output 'All platform parts are fully opaque.'
