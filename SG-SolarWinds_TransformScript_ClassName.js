(function(batch, output) {
    for (var i = 0; i < batch.length; i++) {
        var input = batch[i];
        var className = 'cmdb_ci_hardware';
        if (gs.nil(input))
            className = 'cmdb_ci_hardware';
        else {
            if (input.u_category == "0") { // Other
                className = 'cmdb_ci_hardware';
                if (input.u_machinetype == "Hyper-V Server")
                    className = 'cmdb_ci_hyper_v_server';
                // TODO more subclassing
            } else if (input.u_category == "1") { // Network
                className = 'cmdb_ci_netgear';
                // TODO subclass
            } else if (input.u_category == "2") { // Server
                className = 'cmdb_ci_computer';
                var isServer = input.u_isserver;
                var vendor = gs.nil(input.u_vendor) ? '' : input.u_vendor.toLowerCase();
                if (isServer) {
                    className = 'cmdb_ci_server';
                    if (vendor.includes('windows')) {
                        className = 'cmdb_ci_win_server';
                    } else if (vendor.includes('linux')) {
                        className = 'cmdb_ci_linux_server';
                    } else if (vendor.includes('aix')) {
                        className = 'cmdb_ci_aix_server';
                    } else if (vendor.includes('unix')) {
                        className = 'cmdb_ci_unix_server';
                    } else if (vendor.includes('solaris')) {
                        className = 'cmdb_ci_solaris_server';
                    }
                }
            }
        }
        output[i] = className;
    }
})(batch, output);