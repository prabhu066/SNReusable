//Migrate field values from one company record to another.
function migrateCompanyData(oldID, newID) {
    var grCompanyOld = new GlideRecord('core_company');
    if (!grCompanyOld.get(oldID)) {
        return 'Invalid old company Sys ID';
    }

    var grCompanyNew = new GlideRecord('core_company');
    if (!grCompanyNew.get(newID)) {
        return 'Invalid new company Sys ID';
    }


    var fieldsToMigrate = [
        'u_cost_center',
        'u_l1_support_group',
        'u_spm_opco',
        'u_preferred_portal',
        'u_region',
        'country',
        'u_ml_solution',
        'parent',
        'u_service_management_group',
		'u_id',
		'u_ou',
		'u_company_type'
    ];

    fieldsToMigrate.forEach(function (field) {
        if (field === 'parent' && !grCompanyNew.parent) {
            grCompanyNew.setValue('parent', grCompanyOld.getValue('parent'));
        } else {
            grCompanyNew.setValue(field, grCompanyOld.getValue(field));
        }
    });

    grCompanyNew.setWorkflow(false);
    grCompanyNew.update();

    return 'Successfully migrated company data!';
}


//Migrate Service subscriptions from one company record to another.
function migrateServiceSubscriptions(oldID, newID) {
    var count = 0;
    var grServSub = new GlideRecord('service_subscribe_company');
    grServSub.addQuery('core_company', oldID);
    grServSub.query();

    while (grServSub.next()) {
        grServSub.setValue('core_company', newID);
        grServSub.update();
        count++;
    }

    return 'Total number of subscriptions migrated from ${0} to ${1} is: ${2}',oldID,newID,count;
}

function migrateUsers(oldSysID, newSysID){
    var count = 0;
    var grUser = new GlideRecord('sys_user');
    grUser.addEncodedQuery('company='+oldSysID);
    grUser.query();
    while(grUser.next()){
        count++;
        grUser.setValue('company', newSysID);
        grUser.setWorkflow(false);
        grUser.update();
    }
    return ('Total number of Users updated with new company value : {0}', count );
}

//Main function to call field value migration and service subscriptions migration
function migrateComp(oldSysID, newSysID) {
    var companyMigrationMessage = migrateCompanyData(oldSysID, newSysID);
    var subscriptionMigrationMessage = migrateServiceSubscriptions(oldSysID, newSysID);
    var migrateUsersMessage = migrateUsers(oldSysID, newSysID);

    gs.info(companyMigrationMessage);
    gs.info(subscriptionMigrationMessage);
    gs.info(migrateUsersMessage);
}

//Call required function to migrate data

migrateComp('c5e2df35dba5bf805f40118e3b961928', '1fcc1a991b20f9103708a6cee54bcba7'); //Validate SysIDs before executing!! 
