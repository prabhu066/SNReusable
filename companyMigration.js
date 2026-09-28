function migrateCompanyData(oldID, newID) {
    var grCompanyOld = new GlideRecord('core_company');
    grCompanyOld.get(oldID);
    var grCompanyNew = new GlideRecord('core_company');
    grCompanyNew.get(newID);
    if (!(grCompanyNew && grCompanyOld)) {
        return 'Invalid company Sys ID';

    }

    grCompanyNew.setValue('u_cost_center', String(grCompanyOld.u_cost_center));
    grCompanyNew.setValue('u_l1_support_group', String(grCompanyOld.u_l1_support_group));
    grCompanyNew.setValue('u_spm_opco', String(grCompanyOld.u_spm_opco));
    grCompanyNew.setValue('u_preferred_portal', String(grCompanyOld.u_preferred_portal));
    grCompanyNew.setValue('u_region', String(grCompanyOld.u_region));
    grCompanyNew.setValue('country', String(grCompanyOld.country));
    grCompanyNew.setValue('u_ml_solution', String(grCompanyOld.u_ml_solution));
    if(gs.nil(grCompanyNew.parent)){
        grCompanyNew.setValue('parent', String(grCompanyOld.parent));
    }
    grCompanyNew.setValue('parent', String(grCompanyOld.parent));
    grCompanyNew.setValue('u_service_management_group', String(grCompanyOld.u_service_management_group));
    grCompanyNew.setWorkflow(false);
    grCompanyNew.update();

    return 'Successfully migrated!';
}

function migrateServiceSubscriptions(oldID, newID) {
    var count = 0;
    var grservSub = new GlideRecord("service_subscribe_company");
    grservSub.addEncodedQuery('core_company=' + oldID);
    grservSub.query();
    while (grservSub.next()) {
        grservSub.setValue('core_company', newID);
        grservSub.update();
        count++;
    }

    return ('Total number of Subscriptions migrated from {0} to {1} is : {2}', oldID, newID, count);
}

function migrateComp(oldSysID, newSysID) {
    gs.info(migrateCompanyData(oldSysID, newSysID));
    gs.info(migrateServiceSubscriptions(oldSysID, newSysID));

}

migrateComp('c5e2df35dba5bf805f40118e3b961928','1fcc1a991b20f9103708a6cee54bcba7');