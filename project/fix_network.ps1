Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private
New-NetFirewallRule -DisplayName "Allow Node 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
