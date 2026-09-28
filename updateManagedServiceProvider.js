updateManagedServiceProvider();

//Update Managed Service Provider field for Servers.

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

            if (scheduleName.includes('Triple')) {
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