$ErrorActionPreference = 'Stop'

$containerName = 'mi-proyecto-sqlserver'
$envFilePath = Join-Path $PSScriptRoot '.env'

$inspectJson = docker inspect $containerName
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo inspeccionar el contenedor '$containerName'. Verifica que esté iniciado."
}

$container = ($inspectJson -join [Environment]::NewLine) | ConvertFrom-Json
$passwordEntry = $container[0].Config.Env |
  Where-Object { $_.StartsWith('MSSQL_SA_PASSWORD=') } |
  Select-Object -First 1

if (-not $passwordEntry) {
  throw 'El contenedor no tiene MSSQL_SA_PASSWORD configurada.'
}

$password = $passwordEntry.Substring('MSSQL_SA_PASSWORD='.Length)
if ([string]::IsNullOrWhiteSpace($password)) {
  throw 'La contraseña configurada en el contenedor está vacía.'
}

$escapedPassword = $password.Replace('\', '\\').Replace('"', '\"')
$replacement = 'SQL_PASSWORD="' + $escapedPassword + '"'

if (Test-Path $envFilePath) {
  $lines = [System.IO.File]::ReadAllLines($envFilePath)
} else {
  $lines = @()
}

$found = $false
$updatedLines = foreach ($line in $lines) {
  if ($line -match '^\s*SQL_PASSWORD=') {
    if (-not $found) { $replacement }
    $found = $true
  } else {
    $line
  }
}

if (-not $found) {
  $updatedLines += $replacement
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText(
  $envFilePath,
  (($updatedLines -join "`r`n") + "`r`n"),
  $utf8NoBom
)

Write-Output 'api/.env sincronizado con la contraseña configurada en el contenedor. No se mostró el secreto.'
