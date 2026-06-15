param(
  [string]$SampleRoot = "C:\RepAI\microsoft-graph-comms-samples\Samples",
  [string]$Domain = "repai-media.westeurope.cloudapp.azure.com"
)

$ErrorActionPreference = "Stop"

function Step($msg) {
  Write-Host ""
  Write-Host "=== $msg ===" -ForegroundColor Cyan
}

function Stop-ServiceHard($name) {
  Step "STOP SERVICE"
  sc.exe queryex $name
  $state = sc.exe queryex $name
  $pidLine = $state | Select-String "PID"
  $servicePid = ($pidLine -replace ".*PID\s+:\s+","").Trim()
  if ($servicePid -and $servicePid -ne "0") {
    Write-Host "Killing $name PID $servicePid" -ForegroundColor Yellow
    taskkill /PID $servicePid /F | Out-Host
    Start-Sleep -Seconds 4
  }
  sc.exe queryex $name
}

function Copy-BestAssembly($assemblyName, $version, $out) {
  $dllName = "$assemblyName.dll"
  $best = Get-ChildItem $SampleRoot -Recurse -Filter $dllName -ErrorAction SilentlyContinue |
    Where-Object {
      $_.FullName -notlike "*\obj\*" -and
      $_.FullName -notlike "*\monoandroid*" -and
      $_.FullName -notlike "*\xamarin*" -and
      $_.FullName -notlike "*\uap*" -and
      $_.FullName -notlike "*\ios*" -and
      $_.FullName -notlike "*\tvos*"
    } |
    ForEach-Object {
      try {
        $a = [Reflection.AssemblyName]::GetAssemblyName($_.FullName)
        if ($a.Name -eq $assemblyName -and $a.Version.ToString() -eq $version) {
          $score = 0
          if ($_.FullName -like "*\net472\*") { $score = 100 }
          elseif ($_.FullName -like "*\net471\*") { $score = 95 }
          elseif ($_.FullName -like "*\net462\*") { $score = 90 }
          elseif ($_.FullName -like "*\net461\*") { $score = 85 }
          elseif ($_.FullName -like "*\net45\*") { $score = 80 }
          [PSCustomObject]@{ File=$_.FullName; Score=$score }
        }
      } catch {}
    } |
    Sort-Object Score -Descending |
    Select-Object -First 1

  if (!$best) { throw "Could not find $assemblyName $version under $SampleRoot" }
  Copy-Item $best.File (Join-Path $out $dllName) -Force
  Write-Host "Copied $assemblyName $version" -ForegroundColor Green
}

$root = Join-Path $SampleRoot "V1.0Samples\LocalMediaSamples"
$project = Join-Path $root "AudioVideoPlaybackBot\AVPWindowsService\AVPWindowsService.csproj"
$source = Join-Path $root "AudioVideoPlaybackBot\AVPWindowsService\WindowsServiceConfiguration.cs"
$out = Join-Path $root "AudioVideoPlaybackBot\AVPWindowsService\bin\x64\Release"
$config = Join-Path $out "AVPWindowsService.exe.config"
$crashLog = "C:\RepAI\avp-service-crash.log"
$nuget = "C:\RepAI\nuget.exe"
$serviceName = "AudioVideoPlaybackService"

if (!(Test-Path $project)) { throw "Project not found: $project" }
if (!(Test-Path $source)) { throw "Source not found: $source" }
if (!(Test-Path $nuget)) { throw "NuGet not found: $nuget" }

Stop-ServiceHard $serviceName

Step "PATCH WILDCARD HTTP.SYS LISTENER"
$s = Get-Content $source -Raw
$s = $s.Replace(
  'controlListenUris.Add($"{BotInternalHostingProtocol}://{this.ServiceCname}:{BotCallingInternalPort}/");',
  'controlListenUris.Add($"{BotInternalHostingProtocol}://+:{BotCallingInternalPort}/");'
)
$s = $s.Replace(
  'controlListenUris.Add($"{BotInternalHostingProtocol}://{this.ServiceCname}:{BotInternalPort}/");',
  'controlListenUris.Add($"{BotInternalHostingProtocol}://+:{BotInternalPort}/");'
)
Set-Content $source $s

$patched = Select-String -Path $source -Pattern 'controlListenUris.Add'
$patched | Out-Host
if (($patched | Select-String '://\+:').Count -lt 2) {
  throw "Wildcard patch did not land. Stop here and send the PATCH output."
}

Step "BUILD"
$env:MSBuildSDKsPath = "C:\Program Files\dotnet\sdk\8.0.422\Sdks"
$env:MSBUILDENABLEWORKLOADRESOLVER = "false"
$msbuild = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
& $msbuild $project /m /p:Configuration=Release /p:Platform=x64 /p:RestoreProjectStyle=PackageReference /p:NuGetAudit=false /p:TreatWarningsAsErrors=false /p:MSBuildEnableWorkloadResolver=false
if ($LASTEXITCODE -ne 0) { throw "Build failed." }

Step "POST-BUILD DLL REPAIR"
Remove-Item $crashLog -Force -ErrorAction SilentlyContinue
Remove-Item "$out\System.Net.Http.dll" -Force -ErrorAction SilentlyContinue

& $nuget install Owin -Version 1.0.0 -OutputDirectory "$SampleRoot\packages" | Out-Null
& $nuget install Microsoft.Owin -Version 4.2.0 -OutputDirectory "$SampleRoot\packages" | Out-Null
& $nuget install Microsoft.Owin.Hosting -Version 4.2.0 -OutputDirectory "$SampleRoot\packages" | Out-Null
& $nuget install Microsoft.Owin.Host.HttpListener -Version 4.2.0 -OutputDirectory "$SampleRoot\packages" | Out-Null
& $nuget install Newtonsoft.Json -Version 13.0.3 -OutputDirectory "$SampleRoot\packages" | Out-Null

Copy-Item "$SampleRoot\packages\Owin.1.0\lib\net40\Owin.dll" "$out\Owin.dll" -Force
Copy-Item "$SampleRoot\packages\Microsoft.Owin.4.2.0\lib\net45\Microsoft.Owin.dll" "$out\Microsoft.Owin.dll" -Force
Copy-Item "$SampleRoot\packages\Microsoft.Owin.Hosting.4.2.0\lib\net45\Microsoft.Owin.Hosting.dll" "$out\Microsoft.Owin.Hosting.dll" -Force
Copy-Item "$SampleRoot\packages\Microsoft.Owin.Host.HttpListener.4.2.0\lib\net45\Microsoft.Owin.Host.HttpListener.dll" "$out\Microsoft.Owin.Host.HttpListener.dll" -Force
Copy-Item "$SampleRoot\packages\Newtonsoft.Json.13.0.3\lib\net45\Newtonsoft.Json.dll" "$out\Newtonsoft.Json.dll" -Force

Copy-BestAssembly "Microsoft.Graph.Communications.Common" "1.2.0.7270" $out
Copy-BestAssembly "Microsoft.Graph.Core" "2.0.13.0" $out
Copy-BestAssembly "System.Text.Json" "6.0.0.6" $out

Step "WRITE BINDING REDIRECTS"
$redirects = Get-ChildItem $out -Filter "*.dll" | Where-Object { $_.Name -ne "System.Net.Http.dll" } | ForEach-Object {
  try {
    $a = [Reflection.AssemblyName]::GetAssemblyName($_.FullName)
    $pkt = (($a.GetPublicKeyToken() | ForEach-Object { $_.ToString("x2") }) -join "")
    if ($pkt) {
@"
      <dependentAssembly>
        <assemblyIdentity name="$($a.Name)" publicKeyToken="$pkt" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-$($a.Version)" newVersion="$($a.Version)" />
      </dependentAssembly>
"@
    }
  } catch {}
}

@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.7.2" />
  </startup>
  <runtime>
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
$($redirects -join "`r`n")
      <dependentAssembly>
        <assemblyIdentity name="System.Net.Http" publicKeyToken="b03f5f7f11d50a3a" culture="neutral" />
        <bindingRedirect oldVersion="0.0.0.0-4.2.0.0" newVersion="4.0.0.0" />
      </dependentAssembly>
    </assemblyBinding>
  </runtime>
</configuration>
"@ | Set-Content $config -Encoding UTF8

Step "START SERVICE"
Start-Service $serviceName
Start-Sleep -Seconds 12
sc.exe queryex $serviceName

Step "LATEST APP EVENTS"
Get-EventLog -LogName Application -Newest 60 |
  Where-Object { $_.Source -eq "AudioVideoPlaybackService" } |
  Select-Object TimeGenerated, EntryType, Message |
  Format-List

Step "CURL /api/calling"
curl.exe -k -v -H "Content-Type: application/json" -d "{}" "https://$Domain`:9441/api/calling"

Step "HTTPERR TAIL"
Get-ChildItem C:\Windows\System32\LogFiles\HTTPERR -Filter *.log |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 |
  ForEach-Object { Get-Content $_.FullName -Tail 30 }
