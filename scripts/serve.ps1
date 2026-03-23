$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$port = 8080

function Start-PythonServer {
  param(
    [string]$CommandName,
    [string[]]$Arguments
  )

  Write-Host "Starting static server at http://localhost:$port"
  Push-Location $root
  try {
    & $CommandName @Arguments
  } finally {
    Pop-Location
  }
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  Start-PythonServer -CommandName "py" -Arguments @("-m", "http.server", "$port")
  exit 0
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  Start-PythonServer -CommandName "python" -Arguments @("-m", "http.server", "$port")
  exit 0
}

if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host "Starting static server at http://localhost:$port"
  Push-Location $root
  try {
    & node "scripts/server.js"
  } finally {
    Pop-Location
  }
  exit 0
}

Write-Error "Python or Node.js is not installed. Open index.html directly, or install one of them to use the local static server script."
