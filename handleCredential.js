var currDate = new GlideDateTime();
var grCred = new GlideRecord('discovery_credentials');
grCred.addEncodedQuery('sys_updated_onRELATIVELT@dayofweek@ago@15^u_owned_by!=NULL^active=true^typeINsnmp,snmpv3,ssh,ssh_private_key,vmware,windows');
grCred.query();
while (grCred.next()) {
    if (!(hasCredAffinity(grCred))) {
        var updatedDate = new GlideDateTime(grCred.sys_updated_on);
        var dayDifference = currDate.getNumericValue() - updatedDate.getNumericValue();
        if (dayDifference < 60) {
            var membrs = getMembers(grCred.managed_by);
            var recpList = (membrs.indexOf(grCred.manager)== -1)?membrs.push(grCred.manager):membrs;
            gs.eventOut('discovery.unused.credential', grCred, String(recpList));
        } else {
            grCred.active = false;
            grCred.update();
        }

    }
}

function getMembers(groupID){
    var memberArr=[];
    var grMember = new GlideRecord('sys_user_grmember');
    grMember.addQuery('group',groupID);
    grMember.query();
    while(grMember.next()){
        memberArr.push(String(grMember.user.sys_id));
    }
    return memberArr;
}

function hasCredAffinity(cred) {
    var grCredAff = new GlideAggregate('dscy_credentials_affinity');
    grCredAff.addAggregate('COUNT');
    grCredAff.addQuery('credential_id', String(cred.sys_id));
    grCredAff.query();
    grCredAff.next();
    if ((grCredAff.getAggregate('COUNT') > 0)) {
        return true;
    }
    return false;
}