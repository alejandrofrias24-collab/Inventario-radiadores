$ErrorActionPreference = 'Stop'

$csvPath = Join-Path $PSScriptRoot 'productos.csv'
$healthUrl = 'http://localhost:3000/api/health'
$apiUrl = 'http://localhost:3000/api/productos'

if (-not (Test-Path -LiteralPath $csvPath)) {
  throw "No se encontró '$csvPath'. Exporta la consulta de productos a ese archivo CSV primero."
}

$firstLine = (Get-Content -LiteralPath $csvPath -TotalCount 1 -ErrorAction Stop).TrimStart([char]0xFEFF).Trim()
if ($firstLine -match '^(SELECT|WITH)\b') {
  throw "'$csvPath' contiene el texto de la consulta SQL, no el CSV de resultados. Ejecuta la consulta en SQL Server y usa Export en la cuadrícula de resultados para guardar los datos como CSV."
}

$rows = @(Import-Csv -LiteralPath $csvPath -Encoding UTF8)
if ($rows.Count -eq 0) {
  throw 'El CSV no contiene filas de productos.'
}

$requiredHeaders = @('codigo', 'nombre', 'marca', 'modelo', 'vehiculo', 'anioDesde', 'anioHasta', 'precio', 'stock')
$headers = @($rows[0].PSObject.Properties.Name)
$missingHeaders = @($requiredHeaders | Where-Object { $_ -notin $headers })
if ($missingHeaders.Count -gt 0) {
  throw "Faltan columnas CSV: $($missingHeaders -join ', '). Exporta la consulta con los alias indicados en las instrucciones."
}

try {
  Invoke-RestMethod -Uri $healthUrl -Method Get | Out-Null
} catch {
  throw 'No se pudo conectar con la API en http://localhost:3000. Iníciala en otra terminal con npm run dev y confirma que arranque sin errores.'
}

$existingCodes = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$page = 1
do {
  $listUri = '{0}?page={1}&limit=100' -f $apiUrl, $page
  $existing = Invoke-RestMethod -Uri $listUri -Method Get
  foreach ($product in $existing.data) {
    [void]$existingCodes.Add([string]$product.codigo)
  }
  $totalPages = [int]$existing.pagination.totalPages
  $page++
} while ($page -le $totalPages)

$created = 0
$skipped = 0
foreach ($row in $rows) {
  $code = ([string]$row.codigo).Trim()
  if ([string]::IsNullOrWhiteSpace($code)) {
    throw 'El CSV contiene un producto sin código.'
  }
  if ($existingCodes.Contains($code)) {
    $skipped++
    continue
  }

  $price = [double]::Parse([string]$row.precio, [Globalization.CultureInfo]::InvariantCulture)
  $body = @{
    codigo = $code
    nombre = ([string]$row.nombre).Trim()
    descripcion = [string]$row.descripcion
    marca = ([string]$row.marca).Trim()
    modelo = ([string]$row.modelo).Trim()
    vehiculo = ([string]$row.vehiculo).Trim()
    anioDesde = [int]$row.anioDesde
    anioHasta = [int]$row.anioHasta
    precio = $price
    stock = [int]$row.stock
  } | ConvertTo-Json -Depth 4

  Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType 'application/json; charset=utf-8' -Body $body | Out-Null
  [void]$existingCodes.Add($code)
  $created++
}

Write-Output "Importación finalizada. Creados: $created. Ya existían y se omitieron: $skipped. Total en CSV: $($rows.Count)."
