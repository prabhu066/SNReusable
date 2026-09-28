var dec_name = "DEC0006441"
var file_path = dec_name+"merge_complete";
var payload = '<?xml version="1.0" encoding="UTF-8"?>' +
'<parameters>' +
'<parameter name="probe_name" value="Windows - Powershell"/>'+
'<parameter name="script.ps1" value="$fileName=\'export/'+dec_name+
'merge_complete/merge_complete.pdf\';$fileContent = get-content -Raw $fileName;$fileContentBytes = [System.Text.Encoding]::Default.GetBytes($fileContent);$fileContentEncoded = [System.Convert]::ToBase64String($fileContentBytes);echo $fileContentEncoded;"/>'+
'<parameter name="skip_sensor" value="true"/>'+
'</parameters>';
 
var sysid = '';
 
var grECC = new GlideRecord('ecc_queue');
grECC.initialize();
grECC.agent = 'mid.server.Mid-ServerDev';
grECC.topic = 'Powershell';
grECC.name = 'Windows - PowerShell';
grECC.source = '127.0.0.1';
grECC.queue = 'output';
grECC.payload = payload;
sysid = grECC.insert();
gs.info(payload);