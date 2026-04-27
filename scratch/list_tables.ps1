
$files = Get-ChildItem -Path . -Filter "*.sql" -Recurse | Where-Object { $_.FullName -like "*src\main\resources\db\migration*" }
foreach ($file in $files) {
    Write-Host "--- File: $($file.FullName) ---"
    Get-Content $file.FullName | Select-String "CREATE TABLE"
}
