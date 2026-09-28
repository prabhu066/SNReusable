(function executeRule(current, previous /*null when async*/ ) {
    if (current.table_name == 'sc_req_item') {
        var gr = new GlideRecord("sc_task");
        gr.addQuery("request_item", current.table_sys_id);
        gr.query();
        while (gr.next()) {
            gs.info(gr.number);
            var attachmentThere = new GlideSysAttachment().getAttachments(gr.getTableName(), gr.getUniqueValue());
            attachmentThere.next();
            do {
                if (current.getValue('file_name') == attachmentThere.getValue('file_name')) {
                    gs.log("iffffff");
                } else {
                    gs.log("copy");
                    var deleteAtt = new GlideSysAttachment();
                    deleteAtt.deleteAll(gr);
                    new GlideSysAttachment.copy('sc_req_item', gr.getValue('request_item'), gr.getTableName(), gr.getUniqueValue());
                    deleteDuplicate(gr.getUniqueValue());
                }
            }
            while (attachmentThere.next());
        }
    } else if (current.table_name == 'sc_task') {
        var gr2 = new GlideRecord("sc_task");
        gr2.addQuery("sys_id", current.table_sys_id);
        gr2.query();
        if (gr2.next()) {
            var attachmentThere2 = new GlideSysAttachment().getAttachments(gr2.request_item.sys_class_name, gr2.getValue('request_item'));
            attachmentThere2.next();
            do {
                if (current.getValue('file_name') == attachmentThere2.getValue('file_name')) {
                    gs.log("if");
                } else {
                    gs.log("copy");
                    // var deleteAtt = new GlideSysAttachment();
                    // deleteAtt.deleteAttachment(attachmentThere2.getUniqueValue());
                    new GlideSysAttachment.copy("sc_task", gr2.getUniqueValue(), gr2.request_item.sys_class_name, gr2.getValue('request_item'));
                    deleteDuplicate(gr2.getValue('request_item'));
                }
            }
            while (attachmentThere2.next());
        }
    }
    function deleteDuplicate(tableSysId) {
        var dupRecords = [];
        var gaDupCheck1 = new GlideAggregate('sys_attachment');
        gaDupCheck1.addEncodedQuery("table_sys_id=" + tableSysId);
        gaDupCheck1.addAggregate('COUNT', 'file_name');
        gaDupCheck1.groupBy('file_name');
        gaDupCheck1.addHaving('COUNT', '>', 1);
        gaDupCheck1.query();
        while (gaDupCheck1.next()) {
            dupRecords.push(gaDupCheck1.getValue('file_name'));
        }
        for (var item in dupRecords) {
            gs.print(dupRecords[item]);
            var grSA = new GlideRecord('sys_attachment');
            grSA.addEncodedQuery("table_sys_id=" + tableSysId + "^file_name=" + dupRecords[item]);
            grSA.query();
            if (grSA.next()) {
                grSA.deleteRecord();
            }
        }
    }
})(current, previous);





