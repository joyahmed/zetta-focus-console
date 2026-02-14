param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("PRO", "FOUNDER")]
    [string]$Tier
)

# --- CONFIG ---
$PrivateKeyPath = ".\private_key.pem"
$Product = "ZFC"

# --- Generate Payload ---
$IssuedAt = [int][double]::Parse((Get-Date -UFormat %s))
$LicenseId = [guid]::NewGuid().ToString()

$PayloadObject = @{
    product   = $Product
    tier      = $Tier
    issued_at = $IssuedAt
    license_id = $LicenseId
}

$PayloadJson = ($PayloadObject | ConvertTo-Json -Compress)

# --- Save payload to temp file ---
$PayloadFile = "payload.tmp"
[System.IO.File]::WriteAllText($PayloadFile, $PayloadJson)

# --- Sign payload using OpenSSL (Ed25519) ---
$SignatureFile = "signature.tmp"

# For Ed25519:
openssl pkeyutl -sign -inkey $PrivateKeyPath -rawin -in $PayloadFile -out $SignatureFile

# --- Base64 encode payload ---
$PayloadBytes = [System.Text.Encoding]::UTF8.GetBytes($PayloadJson)
$PayloadBase64 = [Convert]::ToBase64String($PayloadBytes)

# --- Base64 encode signature ---
$SignatureBytes = [System.IO.File]::ReadAllBytes($SignatureFile)
$SignatureBase64 = [Convert]::ToBase64String($SignatureBytes)

# --- Build final license string ---
$License = "$Product.$PayloadBase64.$SignatureBase64"

# --- Cleanup ---
Remove-Item $PayloadFile
Remove-Item $SignatureFile

# --- Output ---
Write-Host ""
Write-Host "Generated License:"
Write-Host ""
Write-Host $License
Write-Host ""


# .\generate-license.ps1 PRO
# .\generate-license.ps1 FOUNDER