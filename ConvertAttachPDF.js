(function executeRule(current, previous /*null when async*/ ) {

    var base64Str = new global.ExportPDF2MID().getECCInputPayload(current.getUniqueValue());
    var strUtil = GlideStringUtil;
    var attachment = new Attachment();
    var eccName = current.name.getDisplayValue();
    var declNum = eccName.slice(22);
    var grDecl = new GlideRecord('x_pl4_declaration4_declaration');
    grDecl.get('number', declNum);
    attachment.write(grDecl.getTableName(), grDecl.getUniqueValue(), grDecl.title + '.pdf', 'application/pdf', strUtil.base64DecodeAsBytes(base64Str));

    // Delete staging_pdf if it exists
    //     var attachmentGr = new GlideRecord('sys_attachment');
    //     attachmentGr.addEncodedQuery('table_sys_id='+ grDecl.getUniqueValue() +'^content_type=application/pdf^table_name=x_pl4_declaration4_declaration^file_nameLIKEstaging_pdf');
    // 	attachmentGr.query();
    // 	while(attachmentGr.next()){
    // 		attachmentGr.deleteRecord();
    // 	}

})(current, previous);


//---------------------------------------------------------------------------------------------------------------------------------------

function getECCInputPayload(eccID) {
    var base64Str = '';
    var grEcc = new GlideRecord('ecc_queue');
    grEcc.get(eccID);

    if (grEcc.payload != '<see_attachment/>') {
        return gs.getXMLText(grEcc.payload, "//output");
    }

    if (grEcc.payload == '<see_attachment/>') {
        var grAt = new GlideRecord('sys_attachment');
        grAt.get('table_sys_id', eccID);
        var gsa = new GlideSysAttachment();
        var atData = gsa.getBytes(attGr);
        var at = String(Packages.java.lang.String(attachmentData));
		return gs.getXMLText(at , "//output");
    }
}