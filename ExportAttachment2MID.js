/* exportToMid - Function to export a *specific* attachment to a mid servers
*  export folder. 
*
*  Usage: exportToMid("my_file_to_export.pdf", "incident", "12345678910111213", "MIDSERVER001")
*
*  @param attachment_name {string} - Specific attachment file name
*  @param attached_table {string} - Table the file is attached
*  @param attached_record {sys_id} - SYS_ID of the record the file is attached
*  @param mid_name {string} - MID Server name
*  @return {null}
*/

/* var attachment_name = "staging_pdf";
var attached_table = "x_pl4_declaration4_declaration";
var attached_record = "3c07e37587d2a510ffe1ecec3fbb35a3";
var mid_name = "Mid-ServerDev"; */

function exportToMid(attachment_name, attached_table, attached_record, mid_name) {
	/** TODO: Add Error Control and validation **/
	
	// Create ECC attachment record used to send the file to the mid server
	var ecc_att = new GlideRecord('ecc_agent_attachment');
	ecc_att.initialize();
	ecc_att.name = 'Export Set Attachment';
	ecc_att.short_description = 'exportToMid: ' + attachment_name;
	ecc_att.insert();

	// Copy attachments (OOB Function copies all attachments)
	GlideSysAttachment.copy(attached_table,attached_record,'ecc_agent_attachment',ecc_att.sys_id);

	// Get the SYS_ID of the exact attachment file to be exported and used in ECC Payload
	var at = new GlideRecord('sys_attachment');
	at.addQuery('table_name', 'ecc_agent_attachment');
	at.addQuery('table_sys_id', ecc_att.sys_id);
	at.addQuery('file_name', attachment_name);
	at.query();
	at.next();

	var export_folder = 'declarations';
	// Create XML for ECC Payload
	var xmlString = '<?xml version="1.0" encoding="UTF-8"?>' + 
					'<parameters>' +
					'<parameter name=\"stream_relay_response_topic\" value=\"ExportSetResult\"/>' +
					'<stream_relay_source attachment_sys_id=\"' + at.sys_id + '\" type=\"AttachmentSource\"/>' +
					'<stream_relay_transform attachment.table_sys_id=\"' + ecc_att.sys_id + '\" order=\"0\" stream_relay_transfer_progress_interval=\"150\" type=\"AttachmentProgressTransformer\"/>' +
					'<stream_relay_sink path="\/' + export_folder + '\/' + attachment_name + '" type=\"FileSink\"/>' +
					'<stream_relay_source attachment_sys_id=\"' + at.sys_id + '\" type=\"AttachmentSource\"/>' +
					'<stream_relay_transform attachment.table_sys_id=\"' + ecc_att.sys_id + '\" order=\"0\" stream_relay_transfer_progress_interval=\"150\" type=\"AttachmentProgressTransformer\"/>' +
					'<stream_relay_sink path="\/' + export_folder + '\/' + attachment_name + '" type=\"FileSink\"/>' +
					'</parameters>';
					
	
	// Create ECC Record
	var eccQueue = new GlideRecord('ecc_queue');
	eccQueue.initialize();
	eccQueue.agent = 'mid.server.' + mid_name;
	eccQueue.topic = 'StreamPipeline';
	eccQueue.queue = 'output';
	eccQueue.state = 'ready';
	eccQueue.payload = xmlString;
	eccQueue.insert();
}
exportToMid("staging_pdf.pdf", "x_pl4_declaration4_declaration", "3c07e37587d2a510ffe1ecec3fbb35a3", "Mid-ServerDev");