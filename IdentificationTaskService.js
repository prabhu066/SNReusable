var IdentificationTaskService = Class.create();
IdentificationTaskService.prototype = {
    initialize: function() {},

    handleTaskRecords: function() {
        var grIdentiTask = new GlideRecord('x_frca_unclass_ci_task');
        grIdentiTask.addEncodedQuery('state!=3^ire_payloadISNOTEMPTY');
        grIdentiTask.query();
        while (grIdentiTask.next()) {
            var msg = this.handleIdentificationTask(grIdentiTask.getUniqueValue());
            grIdentiTask.work_notes = msg;
            grIdentiTask.update();

        }
    },

    handleIdentificationTask: function(taskSysID) {
        var grTask = new GlideRecord('x_frca_unclass_ci_task');
        grTask.get(taskSysID);
        var taskCI = grTask.configuration_item.getRefRecord();
        if (!(taskCI)) {
            return "Configuraiotn Item is missing. This task cannot be handled";
        }

        if (gs.nil(grTask.ire_payload)) {
            return "IRE Payload is missing. Please select attributes to classify the Discovered item";
        }

        var irePayload = JSON.parse(grTask.ire_payload.getDisplayValue());
        if (irePayload.items[0].values.name) {
            taskCI.name = irePayload.items[0].values.name;
        }

        if (irePayload.items[0].values.serial_number) {
            taskCI.serial_number = irePayload.items[0].values.serial_number;
        }
        taskCI.sys_class_name = irePayload.items[0].className;
        var upd = taskCI.update();
        if (upd) {
            var ireOutput = JSON.parse(this.processIREPayload(grTask.ire_payload.getDisplayValue()));
            grTask.ire_output = JSON.stringify(ireOutput);
            grTask.update();
            return "Identification Task is processed and IRE output is written on the task.";
        }

    },

    processIREPayload: function(payload) {
        return sn_cmdb.IdentificationEngine.createOrUpdateCIEnhanced('ServiceNow', payload, {});
    },

    getClassCriterionAttributes: function(className) {
        var Identifiers = '';
        var getIdentifierEntries = new GlideRecord('cmdb_identifier_entry');
        getIdentifierEntries.addActiveQuery();
        getIdentifierEntries.addQuery('table', className);
        getIdentifierEntries.query();
        while (getIdentifierEntries.next()) {
            Identifiers = Identifiers + ',' + getIdentifierEntries.getValue('attributes');
        }
        return Identifiers;
    },
    generateIREPayload: function(taskID) {

        var obj = JSON.stringify({
            "items": [{
                "className": "",
                "lookup": [],
                "values": {},
                "internal_id": "primary_ci_id"
            }],
            "relations": [],
            "referenceItems": []
        });
        var objJSON = JSON.parse(obj);
        var valuesObj = {};
        var idTask = new GlideRecord('x_frca_unclass_ci_task');
        idTask.get(taskID);
        var selectAttribute = idTask.select_attributes.getDisplayValue();
        var selectAttributeArr = selectAttribute.split('^');
        selectAttributeArr.pop();
        for (i in selectAttributeArr) {
            var ele = selectAttributeArr[i].split('=');
            var eleKey = String(ele[0]);
            var eleValue = String(ele[1]);
            valuesObj[eleKey] = eleValue;

        }
        objJSON.items[0].className = idTask.select_class.getDisplayValue();
        objJSON.items[0].values = (valuesObj);


        if (objJSON.items[0].values.ip_address) {
            var ipObj = JSON.stringify({
                "className": "cmdb_ci_ip_address",
                "lookup": [],
                "values": {
                    "ip_address": objJSON.items[0].values.ip_address,
                    "netmask": "255.255.255.0",
                    "network_partition_identifier": ""
                },
                "internal_id": "ip_address_id"
            });
            var ipRelObj = '{"type": "Owns::Owned by","parent_id": "primary_ci_id","child_id": "ip_address_id"}';

            objJSON.items.push(JSON.parse(ipObj));
            objJSON.relations.push(global.JSON.parse(ipRelObj));
        }

        if (objJSON.items[0].values.mac_address) {
            var macObj = JSON.stringify({
                "className": "cmdb_ci_network_adapter",
                "lookup": [],
                "values": {
                    "mac_address": objJSON.items[0].values.mac_address,
                    "name": objJSON.items[0].values.mac_address
                },
                "internal_id": "network_adapter_id"
            });
            var macRelObj = '{"type": "Owns::Owned by","parent_id": "primary_ci_id","child_id": "network_adapter_id"}';
            var macRefObj = '{"referenceField": "cmdb_ci","referenced": "primary_ci_id","referencedBy": "network_adapter_id"}';

            objJSON.items.push(JSON.parse(macObj));

            objJSON.relations.push(global.JSON.parse(macRelObj));
            objJSON.referenceItems.push(global.JSON.parse(macRefObj));
        }

        if (objJSON.items[0].values.ip_address && objJSON.items[0].values.mac_address) {
            var ipRefObj = '{"referenceField": "nic","referenced": "network_adapter_id","referencedBy": "ip_address_id"}';
            objJSON.referenceItems.push(global.JSON.parse(ipRefObj));
        }
        // gs.info( JSON.stringify(objJSON))
        idTask.ire_payload = JSON.stringify(objJSON);
        idTask.update();
    },

    type: 'IdentificationTaskService'
};