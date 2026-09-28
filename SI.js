var MigrationServiceUtils = Class.create();
MigrationServiceUtils.prototype = {
    initialize: function() {},
    createStgRec: function(recID) {
        var grC = new GlideRecord('cmdb_ci');
        grC.get(recID);
        if (grC) {
            var grStag = new GlideRecord('x_441145_csdm_migr_csdm_migration_staging');
            grStag.initialize();
            var fieldMapGR = new GlideRecord('x_441145_csdm_migr_field_mappings');
            fieldMapGR.addEncodedQuery("field_mapping_definition=" + grC.x_441145_csdm_migr_migration_definition);
            fieldMapGR.query();
            while (fieldMapGR.next()) {
                grStag[fieldMapGR.source_field.element] = grC.getValue(fieldMapGR.target_field.element);
            }
            var stgID = grStag.insert();

            grC.x_441145_csdm_migr_staging_record = stgID;
            grC.update();
        }
    },

    createStgRelRecParent: function(recID) {
        var grC = new GlideRecord('cmdb_ci');
        grC.get(recID);
        if (grC) {
            var grRel = new GlideRecord('cmdb_rel_ci');
            grRel.addEncodedQuery('parent=' + recID);
            grRel.query();
            while (grRel.next()) {
                var grStagRel = new GlideRecord('x_441145_csdm_migr_relationship_staging'); //x_441145_csdm_migr_relationship_staging            /           
                if ((grC.x_441145_csdm_migr_staging_record)) {
                    grStagRel.initialize();
                    grStagRel.parent = grC.x_441145_csdm_migr_staging_record;
                    grStagRel.child = grRel.child;
                    grStagRel.type = grRel.type;
                    grStagRel.insert();

                } else {
                    grStagRel.initialize();
                    grStagRel.parent = grRel.parent;
                    grStagRel.child = grRel.child;
                    grStagRel.type = grRel.type;
                    grStagRel.insert();

                }

            }

        }
    },

    createStgRelRecChild: function(recID) {
        var grC = new GlideRecord('cmdb_ci');
        grC.get(recID);
        if (grC) {
            var grRel = new GlideRecord('cmdb_rel_ci');
            grRel.addEncodedQuery('child=' + recID);
            grRel.query();
            while (grRel.next()) {
                var grStagRel = new GlideRecord('x_441145_csdm_migr_relationship_staging');
                if (grC.x_441145_csdm_migr_staging_record) {
                    grStagRel.initialize();
                    grStagRel.parent = grRel.parent;
                    grStagRel.child = grC.x_441145_csdm_migr_staging_record;
                    grStagRel.type = grRel.type;
                    grStagRel.insert();
                } else {
                    grStagRel.initialize();
                    grStagRel.parent = grRel.parent;
                    grStagRel.child = grRel.child;
                    grStagRel.type = grRel.type;
                    grStagRel.insert();
                }
            }
        }
    },
    type: 'MigrationServiceUtils'
};