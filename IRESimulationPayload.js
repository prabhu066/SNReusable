var payload = {
  "items": [
    {
      "className": "cmdb_ci_computer",
      "values": {
        "company": "aa408cbf1b24f0d0a1c81069b04bcbc2",
        "install_status": "6",
        "ip_address": "10.20.30.40",
        "location": "aa408cbf1b24f0d0a1c81069b04bcbc2",
        "mac_address": "ABCD1234",
        "manufacturer": "0c43c22bc611227500002515e25bf079",
        "model_id": "4431c26b37913000158bbfc8bcbe5d0d",
        "name": "*Dup* HP EliteBook 745 G4- IRE",
        "operational_status": "1",
        "ram": "2048",
        "serial_number": "TEST789987"
      },
      "internal_id":"primary_ci"
    },
    {
      "className":"cmdb_ci_ip_address",
      "values": {
        "ip_address": "10.20.30.40",
        "ip_version":"IPv4",
        "netmask":"255.255.255.0"
      },
      "internal_id":"ip_address_id"
    }
  ],
  "relations":[
    {
      "child_id": "ip_address_id",
      "parent_id": "primary_ci_id",
      "sys_rel_source_info": {Object},
      "type": "String"
    }
  ]
};


//var payload = {"items":[{"className":"cmdb_ci_win_server","values":{"company":"86c1f3193790200044e0bfc8bcbe5d95","install_status":"1","ip_address":"10.20.30.40","location":"a63c49b037d0200044e0bfc8bcbe5dd9","mac_address":"ABCD1234","manufacturer":"0c43c22bc611227500002515e25bf079","model_id":"4431c26b37913000158bbfc8bcbe5d0d","name":"SNCTest Win Server 100","operational_status":"1","ram":"2048","serial_number":"SNC123456789"}}]};

var discoverySource = "ServiceWatch";
//gs.trace(true);
var output = SNC.IdentificationEngineScriptableApi.createOrUpdateCI(discoverySource, JSON.stringify(payload));
//gs.trace(false);
gs.print(output);