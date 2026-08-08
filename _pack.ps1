param([string]$Root)

$stamp   = Get-Date -Format "yyyyMMdd-HHmm"
$zipName = "acervo-deploy-$stamp.zip"
$zipPath = Join-Path $Root $zipName

$excludeDirs  = @('node_modules','dist','.git','logs','coverage','.cache','.vitest','prisma\prisma')
$excludeFiles = @('*.db','*.db-shm','*.db-wal','*.log','*.tmp','*.bak','gerar-deploy.bat')
$excludePattern = 'acervo-deploy-.*\.zip$'

Write-Host ""
Write-Host "  ======================================================="
Write-Host "   LibraryHub - Pacote de Deploy"
Write-Host "  ======================================================="
Write-Host ""
Write-Host "  Raiz   : $Root"
Write-Host "  Arquivo: $zipName"
Write-Host ""

if (Test-Path $zipPath) {
    Write-Host "  [AVISO] Removendo versao anterior..."
    Remove-Item $zipPath -Force
}

Write-Host "  [1/3] Empacotando arquivos..."

Add-Type -Assembly 'System.IO.Compression.FileSystem'
$arc = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
$n   = 0

Get-ChildItem -Path $Root -Recurse -File | ForEach-Object {
    $rel   = $_.FullName.Substring($Root.Length + 1)
    $parts = $rel -split [regex]::Escape([IO.Path]::DirectorySeparatorChar)
    $skip  = $false

    foreach ($p in $parts) {
        if ($excludeDirs -contains $p) { $skip = $true; break }
    }
    if (-not $skip) {
        foreach ($pat in $excludeFiles) {
            if ($_.Name -like $pat) { $skip = $true; break }
        }
    }
    if (-not $skip -and $_.Name -match $excludePattern) { $skip = $true }

    if (-not $skip) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $arc, $_.FullName, $rel, 'Optimal') | Out-Null
        $n++
    }
}

$arc.Dispose()
Write-Host "  OK: $n arquivos adicionados."

Write-Host "  [2/3] Verificando integridade..."
$z = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$c = $z.Entries.Count
$z.Dispose()
Write-Host "  OK: $c entradas no ZIP."

$sz = (Get-Item $zipPath).Length
$mb = [math]::Round($sz / 1MB, 2)
$kb = [math]::Round($sz / 1KB, 0)

Write-Host ""
Write-Host "  [3/3] Concluido!"
Write-Host ""
Write-Host "  +------------------------------------------------------+"
Write-Host "  | Arquivo : $zipName"
Write-Host "  | Tamanho : $mb MB  ($kb KB)"
Write-Host "  | Local   : $Root"
Write-Host "  +------------------------------------------------------+"
Write-Host ""
Write-Host "  Incluido no ZIP:"
Write-Host "    backend\src\          codigo-fonte TypeScript"
Write-Host "    backend\prisma\       schema + migrations"
Write-Host "    backend\package*.json"
Write-Host "    frontend\src\         codigo-fonte React"
Write-Host "    frontend\index.html"
Write-Host "    frontend\package*.json / vite.config.ts"
Write-Host "    public\               assets estaticos"
Write-Host "    storage\              seed de livros e TCCs"
Write-Host "    Dockerfile / docker-compose.yml"
Write-Host "    docker-entrypoint.sh / .env.example"
Write-Host ""
Write-Host "  NAO incluido (gerado no servidor pelo Dockerfile):"
Write-Host "    node_modules\   (npm ci)"
Write-Host "    dist\           (build)"
Write-Host "    *.db / *.log    (dados locais)"
Write-Host ""
