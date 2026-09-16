$proc = Start-Process -FilePath ".\dot-md.exe" -ArgumentList "sample.md" -PassThru
Start-Sleep -Seconds 2

$children = @(Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $proc.Id })
Write-Host "dot-md Process ID: $($proc.Id)"
Write-Host "Child processes count: $($children.Count)"

$hasNode = $false
foreach ($c in $children) {
    Write-Host "Child process: $($c.Name) (PID: $($c.ProcessId))"
    if ($c.Name -eq "node.exe") {
        $hasNode = $true
    }
}

Stop-Process -Id $proc.Id -Force

if ($hasNode) {
    Write-Error "FAIL: Found node.exe running as a child process of dot-md.exe!"
    exit 1
} else {
    Write-Host "SUCCESS: Pure native standalone app verified! Zero Node.js child processes."
    exit 0
}
