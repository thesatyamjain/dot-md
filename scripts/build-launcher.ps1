# Build dot md Windows Zero-Console Native Launcher (.exe)
$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$cscPaths = @(
    "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$csc = $cscPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $csc) {
    Write-Host "[ERROR] csc.exe (.NET Framework C# compiler) not found." -ForegroundColor Red
    exit 1
}

$iconPath = Join-Path $rootDir "favicon.ico"
$outExe = Join-Path $rootDir "bin\dotmd.exe"
$src = Join-Path $rootDir "src-launcher\Program.cs"

Write-Host "Compiling native zero-terminal launcher: $outExe" -ForegroundColor Cyan
& $csc /target:winexe /optimize+ /win32icon:"$iconPath" /out:"$outExe" "$src"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] dotmd.exe compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Compilation failed." -ForegroundColor Red
    exit 1
}
