// var recID = "e5b3d4cc1b95f450318f2f40ab4bcb15"doSomething("cee4b364b3d311d02c8d431acf076255")
function doSomething(recID) {
    var obj = {};
    var grC = new GlideRecord('cmdb_ci');
    grC.get(recID);
    // gs.info(grC.x_441145_csdm_migr_migration_definition)    
	if (grC) {
        //var grStag = new GlideRecord('x_441145_csdm_migr_csdm_staging');
        //grStag.initialize();
        var fieldMapGR = new GlideRecord('x_441145_csdm_migr_field_mappings');
        fieldMapGR.addEncodedQuery("field_mapping_definition=" + grC.x_441145_csdm_migr_migration_definition);
        fieldMapGR.query();
        while (fieldMapGR.next()) {
            gs.info(fieldMapGR.source_field.element);
            gs.info(fieldMapGR.target_field.element);
            obj[fieldMapGR.source_field.element] = grC.getValue(fieldMapGR.target_field.element);
		grStag[fieldMapGR.source_field.element] = grC.getValue(fieldMapGR.target_field.element);        }
        gs.info(JSON.stringify(obj))
        // grStag.insert();    }
}}