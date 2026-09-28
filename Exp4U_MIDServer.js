function exportPDF2MID(tableName, recordID, decNum, midName) {
    // Create ECC attachment record used to send the file to the mid server
    var ecc_att = new GlideRecord('ecc_agent_attachment');
    ecc_att.initialize();
    ecc_att.name = 'Export Set Attachment';
    ecc_att.short_description = 'exportToMid: ' + tableName + " : " + recordID;
    var eccAttID = ecc_att.insert();

    // Copy attachments (OOB Function copies all attachments)
    GlideSysAttachment.copy(tableName, recordID, 'ecc_agent_attachment', ecc_att.sys_id);

    // Get details of newly created attachment

    var att = new GlideRecord('sys_attachment');
    att.addQuery('table_name', 'ecc_agent_attachment');
    att.addQuery('table_sys_id', ecc_att.sys_id);
    att.addQuery('content_type', 'application/pdf');
    att.query();
    if (att.hasNext()) { //First occuring PDF attachment is considered
        var export_folder = decNum;
		var attachment_name = att.file_name;
		
        // Create XML for ECC Payload
        var xmlString = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<parameters>' +
            '<parameter name=\"stream_relay_response_topic\" value=\"ExportSetResult\"/>' +
            '<stream_relay_source attachment_sys_id=\"' + att.sys_id + '\" type=\"AttachmentSource\"/>' +
            '<stream_relay_transform attachment.table_sys_id=\"' + eccAttID + '\" order=\"0\" stream_relay_transfer_progress_interval=\"150\" type=\"AttachmentProgressTransformer\"/>' +
            '<stream_relay_sink path="\/' + export_folder + '\/' + attachment_name + '" type=\"FileSink\"/>' +
            '</parameters>';

        // Create ECC Record
        var eccQueue = new GlideRecord('ecc_queue');
        eccQueue.initialize();
        eccQueue.agent = 'mid.server.' + midName;
        eccQueue.topic = 'StreamPipeline';
        eccQueue.queue = 'output';
        eccQueue.state = 'ready';
        eccQueue.payload = xmlString;
        eccQueue.insert();
    }
}
var handleDec = false;
var midServer = "Mid-ServerDev";
var grExp = new GlideRecord("x_pl4_declaration4_expense_line");
/* grExp.addQuery("declaration", current.sys_id);
grExp.addQuery( < check flag of contains PDF > );
grExp.query();
while (grExp.next()) { */
grExp.get("4fb92b3987d2a510ffe1ecec3fbb3591");
if(grExp)
	handleDec = true;
	this.exportPDF2MID(current.sys_class_name, current.sys_id, current.declaration.number, midServer);
}

if(handleDec){
	this.exportPDF2MID(current.declaration.sys_class_name, current.declaration, current.declaration.number, midServer);
}