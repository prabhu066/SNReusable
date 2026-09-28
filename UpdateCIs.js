PopulateOU();
PopulateCompany();
PopulateOwnedByManagedByComp();
PopulateOwnedByManagedByComm();

FindAssetforComp();
FindAssetforComm();

CreateAssetforComp();
CreateAssetforComm();


//Populate OU based on Company//
function PopulateOU() {
    var gr = new GlideRecord('cmdb_ci_computer');
    gr.addEncodedQuery("u_opcodeISEMPTY^discovery_sourceINInTune,LDAP,SCCM^company!=1d15eb94db8fdb40a19ef1c51d96195d^companyISNOTEMPTY");
    gr.setLimit(2000);
    gr.query();
    // gs.print("count>" + gr.getRowCount());
    while (gr.next()) {
        gr.u_opcode = gr.company.u_ou;
        gr.update();
    }
}

//Populate Company based on OU//
function PopulateCompany() {
    var ci = new GlideRecord('cmdb_ci_computer');
    ci.addEncodedQuery('u_opcodeISNOTEMPTY^companyISEMPTY');
    ci.setLimit(2000);
    ci.query();

    while (ci.next()) {
        ci.company = getCompany(ci.u_opcode);
        ci.update();
    }

    function getCompany(opcode) {
        var company = new GlideRecord('core_company');
        if (company.get('u_ou', opcode)) {
            return company.sys_id;
        }
    }
}

//update ownedBy and managed by on computer CIs//
function PopulateOwnedByManagedByComp() {
    var grcomp = new GlideRecord('cmdb_ci_computer');
    grcomp.addEncodedQuery("discovery_sourceINInTune,LDAP,SCCM^u_owned_byISEMPTY^company!=19152f94db8fdb40a19ef1c51d9619eb^company!=1d15eb94db8fdb40a19ef1c51d96195d^companyISNOTEMPTY");
    grcomp.setLimit(2000);
    grcomp.query();
    // gs.print("count>" + grcomp.getRowCount());
    while (grcomp.next()) {
        if (grcomp.company.u_assets_owned_by != '') {
            grcomp.u_owned_by = grcomp.company.u_assets_owned_by;
        }
        if (grcomp.company.u_assets_managed_by != '') {
            grcomp.managed_by_group = grcomp.company.u_assets_managed_by;
        }
        grcomp.update();
    }
}

//update ownedBy and managed by on comms CIs//
function PopulateOwnedByManagedByComm() {
    var grcomm = new GlideRecord('cmdb_ci_comm');
    grcomm.addEncodedQuery("u_owned_byISEMPTY^companyISNOTEMPTY");
    grcomm.setLimit(2000);
    grcomm.query();
    // gs.print("count>" + grcomm.getRowCount());
    while (grcomm.next()) {
        if (grcomm.company.u_assets_owned_by != '') {
            grcomm.u_owned_by = grcomm.company.u_assets_owned_by;
        }
        if (grcomm.company.u_assets_managed_by != '') {
            grcomm.managed_by_group = grcomm.company.u_assets_managed_by;
        }
        grcomm.update();
    }
}

//Find Assets for CI in the computer table and update CI with the right Asset//
function FindAssetforComp() {
    var comp = new GlideRecord('cmdb_ci_computer');
    comp.addEncodedQuery("discovery_sourceINInTune,LDAP,SCCM^serial_numberISNOTEMPTY^assetISEMPTY^companyISNOTEMPTY^company!=19152f94db8fdb40a19ef1c51d9619eb^company!=1d15eb94db8fdb40a19ef1c51d96195d");
    comp.setLimit(2000);
    comp.query();
    while (comp.next()) {
        comp.asset = FindOriginalAssetcomp(comp.serial_number);
        comp.update();
    }

    function FindOriginalAssetcomp(serialno) {
        var findOriginal = new GlideRecord('alm_hardware');
        findOriginal.addQuery('serial_number', serialno);
        findOriginal.query();
        if (findOriginal.next()) {
            var assetsysid = findOriginal.sys_id;
            findOriginal.ci = comp.sys_id;
            findOriginal.update();
            return assetsysid;

        }
    }
}

// Find Assets for CI in the Comms table and update CI with the right Asset//
function FindAssetforComm() {
    var comm = new GlideRecord('cmdb_ci_comm');
    comm.addEncodedQuery("discovery_source=InTune^serial_numberISNOTEMPTY^assetISEMPTY^serial_number!=0^serial_number!=Defaultstring^companyISNOTEMPTY");

    comm.setLimit(2000);
    comm.query();
    while (comm.next()) {
        comm.asset = FindOriginalAssetcomm(comm.serial_number);
        comm.update();
    }

    function FindOriginalAssetcomm(serialno) {
        var findOriginal = new GlideRecord('alm_hardware');
        findOriginal.addQuery('serial_number', serialno);
        findOriginal.query();
        if (findOriginal.next()) {
            var assetsysid = findOriginal.sys_id;
            findOriginal.ci = comm.sys_id;
            findOriginal.update();
            return assetsysid;

        }
    }
}


//Create Assets for Comms CIs//
function CreateAssetforComm() {

    var device = new GlideRecord('cmdb_ci_comm');
    //device.addEncodedQuery("sys_id=17d80585db3bd05070d40474f396193c");
    device.addEncodedQuery("discovery_source=InTune^serial_numberISNOTEMPTY^assetISEMPTY^serial_number!=0^serial_number!=Defaultstring^companyISNOTEMPTY");
    device.setLimit(2000);
    device.query();

    while (device.next()) {
        var asset = new GlideRecord('alm_asset');
        asset.addQuery('serial_number', device.serial_number);
        asset.setLimit(1);
        asset.query();

        if (!asset.hasNext()) {

            device.asset_tag = device.company.u_ou + '_' + device.serial_number;
            if (device.company == '7cf5f7fcdbf7c7007d4e2ded0b96198e') {
                device.asset_tag = 'FR1_' + device.serial_number;
            }

            //device.sys_mod_count = device.sys_mod_count + 1;
            var ca = new AssetandCI();
            ca.createAssetByPass(device, true);
            device.update();

            var assetupdate = new GlideRecord('alm_asset');
            assetupdate.addQuery('sys_id', device.asset);
            assetupdate.setLimit(1);
            assetupdate.query();

            if (assetupdate.next()) {
                assetupdate.assigned_to = device.assigned_to;
                assetupdate.u_name = assetupdate.asset_tag;
                assetupdate.model = device.model_id;
                assetupdate.u_category = "Handheld Device";
                assetupdate.u_subcategory = device.model_id.u_model_subcategory;
                assetupdate.u_imei = device.u_imei;
                if (assetupdate.managed_by == '' && device.company.u_assets_managed_by != '' && device.company.u_assets_managed_by != undefined) {
                    assetupdate.managed_by = device.company.u_assets_managed_by;
                }
                if (assetupdate.owned_by == '' && device.company.u_assets_owned_by != '' && device.company.u_assets_owned_by != undefined) {
                    assetupdate.owned_by = device.company.u_assets_owned_by;
                }
                assetupdate.update();
            }
        }
    }
}



//Create Assets for computer CIs//
function CreateAssetforComp() {
    var devicecomp = new GlideRecord('cmdb_ci_computer');
    devicecomp.addEncodedQuery("discovery_sourceINInTune,LDAP,SCCM^serial_numberISNOTEMPTY^assetISEMPTY^companyISNOTEMPTY^company!=19152f94db8fdb40a19ef1c51d9619eb^company!=1d15eb94db8fdb40a19ef1c51d96195d^serial_number!=0^serial_number!=Defaultstring");
    //devicecomp.addEncodedQuery("serial_numberIN8CC9421SN2");
    devicecomp.setLimit(2000);
    devicecomp.query();

    while (devicecomp.next()) {
        var asset = new GlideRecord('alm_asset');
        asset.addQuery('serial_number', devicecomp.serial_number);
        asset.setLimit(1);
        asset.query();

        if (!asset.hasNext()) {
            devicecomp.asset_tag = devicecomp.u_opcode + '_' + devicecomp.serial_number;
            devicecomp.sys_mod_count = devicecomp.sys_mod_count + 1;
            var ca = new AssetandCI();
            ca.createAssetByPass(devicecomp, true);
            devicecomp.update();

            var assetupdate = new GlideRecord('alm_asset');
            assetupdate.addQuery('sys_id', devicecomp.asset);
            assetupdate.setLimit(1);
            assetupdate.query();

            if (assetupdate.next()) {
                assetupdate.assigned_to = devicecomp.assigned_to;
                assetupdate.u_name = assetupdate.asset_tag;
                assetupdate.model = devicecomp.model_id;

                assetupdate.u_hostname = devicecomp.u_windows_name;
                assetupdate.u_disabled = devicecomp.u_disable;
                assetupdate.company = devicecomp.company;


                assetupdate.model_category = '81feb9c137101000deeabfc8bcbe5dc4';
                assetupdate.u_category = 'Workplace';
                var ciname = assetupdate.ci.name;
                var subCategory = '';
                var subCatCode = ciname.substring(3, 4);
                if (subCatCode == 'D') {
                    subCategory = 'Desktop';
                } else if (subCatCode == 'N') {
                    subCategory = 'Laptop';
                } else if (subCatCode == 'S') {
                    subCategory = 'Server';
                } else if (subCatCode == 'T') {
                    subCategory = 'Thin Client';
                } else if (subCatCode == 'V') {
                    subCategory = 'Virtual Desktop';
                }
                assetupdate.u_subcategory = subCategory;

                if (devicecomp.u_allocated_to != '') {
                    assetupdate.u_allocated_to = devicecomp.u_allocated_to;
                }
                if (assetupdate.managed_by == '' && devicecomp.company.u_assets_managed_by != '' && devicecomp.company.u_assets_managed_by != undefined) {
                    assetupdate.managed_by = devicecomp.company.u_assets_managed_by;
                }
                if (assetupdate.owned_by == '' && devicecomp.company.u_assets_owned_by != '' && devicecomp.company.u_assets_owned_by != undefined) {
                    assetupdate.owned_by = devicecomp.company.u_assets_owned_by;
                }
                assetupdate.update();
            }
        }
    }
}

// Update Managed Service Provider field on Server record


function updateManagedServiceProvider() {
    var grServer = new GlideRecord('cmdb_ci_server');
    grServer.addEncodedQuery('install_status!=7^ORinstall_status=^u_managed_service_provider=');
    grServer.query();
    while (grServer.next()) {
        if (grServer.u_opcode == 'XP4') {
            grServer.u_managed_service_provider = 'tsystems';
            grServer.update();
            continue;
        }
        var scheduleName = _containsDiscoveryDevice(String(grServer.sys_id));
        if (scheduleName) {
            if (scheduleName.includes('Lemongrass')) {
                grServer.u_managed_service_provider = 'lemongrass';
                grServer.update();
                continue;
            }

            if (scheduleName.includes('Triple')){
                grServer.u_managed_service_provider = 'triple';
                grServer.update();
                continue;
            }
            
            grServer.u_managed_service_provider = 'local_onprem';
            grServer.update();
            continue;

        }
    }
}

function _containsDiscoveryDevice(serverID) {
    var grD = new GlideRecord('discovery_device_history');
    grD.addEncodedQuery('cmdb_ci=' + serverID);
    grD.query();
    if (grD.next()) {
        return grD.status.dscheduler.getDisplayValue();
    }
}


