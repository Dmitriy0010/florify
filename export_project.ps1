# ==================================================
# LLM-OPTIMIZED PROJECT EXPORT (FULL CONTEXT)
# Includes Source, Tests, and Configs
# Excludes Binaries, Build Artifacts, and Hidden Noisy Dirs
# ==================================================

$projectPath = Get-Location
$outputFile  = "$projectPath\LLM_CONTEXT.txt"
$maxFileSizeKB = 500

# --- Directories to STRICTLY exclude ---
# УБРАЛ "out" и "bin", чтобы не ломать гексагональную архитектуру (adapter/out, port/out)
$excludeDirs = @(
    ".git", ".idea", ".gradle", ".vscode", "node_modules", 
    "build", "target", "obj",
    "__pycache__", ".pytest_cache", ".venv", "venv", "env"
)

# --- Binary/Junk extensions to exclude ---
$excludeExtensions = @(
    ".exe", ".dll", ".jar", ".war", ".ear", ".zip", ".7z", ".rar", ".tar", ".gz",
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".ico", ".webp",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".pyc", ".class", ".o", ".a", ".so", ".dylib",
    ".db", ".sqlite", ".bin", ".dat"
)

# StringBuilder for performance
$sb = New-Object System.Text.StringBuilder

# ================= HEADER =================
[void]$sb.AppendLine("### PROJECT CONTEXT FOR LLM (FULL)")
[void]$sb.AppendLine("### Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine("### Root: $projectPath")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("### Notes for LLM:")
[void]$sb.AppendLine("- Includes Source code, Tests (src/test), and Configuration files")
[void]$sb.AppendLine("- Build artifacts (build, target, bin) and Dependencies (node_modules) are excluded")
[void]$sb.AppendLine("- Binary files (images, jars) are excluded")
[void]$sb.AppendLine("- Files larger than $($maxFileSizeKB)KB have their content skipped for brevity")
[void]$sb.AppendLine("- Paths are relative to project root")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("==================================================")
[void]$sb.AppendLine("")

# Helper function to check if a path should be excluded based on directory names
function Is-ExcludedDir($path) {
    foreach ($dir in $excludeDirs) {
        # Match directory name exactly as a component of the path
        if ($path -match "(^|\\)$([regex]::Escape($dir))(\\|$)") {
            return $true
        }
    }
    return $false
}

# ================= PROJECT TREE =================
[void]$sb.AppendLine("SECTION: PROJECT TREE")
[void]$sb.AppendLine("--------------------------------------------------")

$allItems = Get-ChildItem $projectPath -Recurse | Where-Object {
    $relativePath = $_.FullName.Substring($projectPath.Path.Length)
    if (Is-ExcludedDir $relativePath) { return $false }
    return $true
} | Sort-Object FullName

foreach ($item in $allItems) {
    if ($_.FullName -eq $outputFile) { continue }
    $relative = $item.FullName.Substring($projectPath.Path.Length).TrimStart('\')
    if ($item.PSIsContainer) {
        [void]$sb.AppendLine("DIR:  $relative")
    } else {
        if ($excludeExtensions -contains $item.Extension.ToLower()) {
            [void]$sb.AppendLine("BIN:  $relative")
        } else {
            [void]$sb.AppendLine("FILE: $relative")
        }
    }
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("==================================================")
[void]$sb.AppendLine("")

# ================= SOURCE FILES =================
[void]$sb.AppendLine("SECTION: SOURCE FILES")
[void]$sb.AppendLine("--------------------------------------------------")

$sourceFiles = $allItems | Where-Object {
    if ($_.PSIsContainer) { return $false }
    if ($_.FullName -eq $outputFile) { return $false }
    if ($excludeExtensions -contains $_.Extension.ToLower()) { return $false }
    return $true
}

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Substring($projectPath.Path.Length).TrimStart('\')
    $fileType = $file.Extension.Trim('.')
    if ([string]::IsNullOrEmpty($fileType)) {
        $fileType = $file.Name
    }

    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("<<<FILE path=""$relativePath"" type=""$fileType"">>>")
    [void]$sb.AppendLine("")

    if ($file.Length -gt ($maxFileSizeKB * 1024)) {
        [void]$sb.AppendLine("// WARNING: File content skipped (Size: $([math]::Round($file.Length/1KB, 1)) KB > $($maxFileSizeKB)KB) //")
    } else {
        try {
            # Try to read with UTF8, fallback to default if needed
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            [void]$sb.AppendLine($content)
        } catch {
            [void]$sb.AppendLine("// ERROR: Could not read file content ($($_.Exception.Message)) //")
        }
    }

    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("<<<END FILE>>>")
}

# ================= WRITE TO FILE =================
Remove-Item $outputFile -ErrorAction SilentlyContinue
Set-Content -Path $outputFile -Value $sb.ToString() -Encoding UTF8

Write-Host ""
Write-Host "✅ DONE"
Write-Host "Full LLM context created:"
Write-Host "  $outputFile"