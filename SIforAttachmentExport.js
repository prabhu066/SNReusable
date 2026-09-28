var ExportPDF2MID = Class.create();
ExportPDF2MID.prototype = {
    initialize: function() {
        this.midName = gs.getProperty('pl4.expense4u.mid.agent.name');
    },
    _getFolderName: function(attTable, recID) {
        //Folder name to store the attachment
        var grAt = new GlideRecord(attTable);
        grAt.get(recID);

        if (grAt.declaration) {
            return grAt.declaration.number.getDisplayValue();
        }

        return grAt.number.getDisplayValue();
    },

    _generateXML4Payload: function(eccAttID, fldrName, tableName) {
        var at = new GlideRecord('sys_attachment');
        at.addQuery('table_name', 'ecc_agent_attachment');
        at.addQuery('table_sys_id', eccAttID);
        at.addQuery('content_type', 'application/pdf');
        if (tableName == 'x_pl4_declaration4_declaration') {
            at.addQuery('file_name', 'staging_pdf.pdf');
        }
        at.query();
        at.next();
        var xmlString = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<parameters>' +
            '<parameter name="stream_relay_response_topic" value="ExportSetResult"/>' +
            '<stream_relay_source attachment_sys_id="' + at.sys_id + '" type="AttachmentSource"/>' +
            '<stream_relay_transform attachment.table_sys_id="' + eccAttID + '" order="0" stream_relay_transfer_progress_interval="150" type="AttachmentProgressTransformer"/>' +
            '<stream_relay_sink path="/' + fldrName + '/' + at.file_name + '" type="FileSink"/>' +
            '</parameters>';

        // 		var xmlString = '<?xml version="1.0" encoding="UTF-8"?>' +
        //             '<parameters>' +
        //             '<parameter name=\"stream_relay_response_topic\" value=\"ExportSetResult\"/>' +
        //             '<stream_relay_source attachment_sys_id=\"' + at.sys_id + '\" type=\"AttachmentSource\"/>' +
        //             '<stream_relay_transform attachment.table_sys_id=\"' + eccAttID + '\" order=\"0\" stream_relay_transfer_progress_interval=\"150\" type=\"AttachmentProgressTransformer\"/>' +
        //             '<stream_relay_sink path="\/' + fldrName + '\/' + at.file_name + '" type=\"FileSink\"/>' +
        //             '</parameters>';
        return xmlString;
    },

    executeNodeScript: function() {

        var payload = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<parameters>' +
            '<parameter name="probe_name" value="Windows - Powershell"/>' +
            '<parameter name="script.ps1" value="cd pl4-expense4u;node index.js"/>' +
            '<parameter name="skip_sensor" value="true"/>' +
            '</parameters>';

        var gdtNow = new GlideDateTime(gs.nowDateTime());

        var grECC = new GlideRecord('ecc_queue');
        grECC.initialize();
        grECC.agent = 'mid.server.' + this.midName;
        grECC.topic = 'Powershell';
        grECC.name = 'Expense4U-Declaration| Run Node Script :' + gdtNow;
        grECC.source = '127.0.0.1';
        grECC.queue = 'output';
        grECC.payload = payload;
        var eccID = grECC.insert();

        gs.log('ECC Queue record to run the Node Script is created with Sys ID' + eccID, 'Expense4U');
    },

    handleDeclarations4Import: function() {
        var grDecl = new GlideRecord('x_pl4_declaration4_declaration');
        grDecl.addEncodedQuery('contains_pdf=true^state=3');
        grDecl.query();
        while (grDecl.next()) {
            if (this.containsStagingPDF(grDecl.getUniqueValue())) {
                this.convertMergedPDFtoBase64(grDecl.number);
            }
        }
    },

    convertMergedPDFtoBase64: function(decName) {
        var file_path = decName + "merge_complete";
        var payload = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<parameters>' +
            '<parameter name="probe_name" value="Windows - Powershell"/>' +
            '<parameter name="script.ps1" value="$fileName=\'export/' + decName +
            '_merge_complete/PL4EXPNS4UMERGED.pdf\';$fileContent = get-content -Raw $fileName;$fileContentBytes = [System.Text.Encoding]::Default.GetBytes($fileContent);$fileContentEncoded = [System.Convert]::ToBase64String($fileContentBytes);echo $fileContentEncoded;"/>' +
            '<parameter name="skip_sensor" value="true"/>' +
            '</parameters>';

        var grECC = new GlideRecord('ecc_queue');
        grECC.initialize();
        grECC.agent = 'mid.server.' + this.midName;
        grECC.topic = 'Powershell';
        grECC.name = 'Expense4U-Declaration-' + decName;
        grECC.source = '127.0.0.1';
        grECC.queue = 'output';
        grECC.payload = payload;
        var eccID = grECC.insert();

        gs.log('ECC Queue record to fetch the Base64 string of Declaration is created with Sys ID' + eccID, 'Expense4U');
    },
    getECCInputPayload: function(eccID) {
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
            var atData = gsa.getBytes(grAt);
            var at = String(Packages.java.lang.String(atData));
            return gs.getXMLText(at, "//output");
        }
    },

    containsStagingPDF: function(recordID) {
        var contStgPDF = false;
        var grAgg = new GlideAggregate("sys_attachment");
        grAgg.addAggregate('COUNT');
        grAgg.addQuery('table_sys_id', recordID);
        grAgg.addQuery('content_type', 'application/pdf');
        grAgg.addQuery('file_name', 'staging_pdf.pdf');
        grAgg.query();
        grAgg.next();

        if (grAgg.getAggregate('COUNT') == 1) {
            contStgPDF = true;
        }

        return contStgPDF;
    },

    export2MID: function(attached_table, attached_record, mid_name) {

        var ecc_att = new GlideRecord('ecc_agent_attachment');
        ecc_att.initialize();
        ecc_att.name = 'Export Set Attachment';
        ecc_att.short_description = 'Export attachment to MID Server : ' + attached_table;
        ecc_att.insert();

        // Copy attachments (OOB Function copies all attachments)
        GlideSysAttachment.copy(attached_table, attached_record, 'ecc_agent_attachment', ecc_att.sys_id);

        //Get name of root folder to store all the attachments

        var folderName = this._getFolderName(attached_table, attached_record);

        // Generate XML String for Payload

        var xmlStr = this._generateXML4Payload(ecc_att.sys_id, folderName, attached_table);

        if (xmlStr) {

            // Create ECC Record
            var eccQueue = new GlideRecord('ecc_queue');
            eccQueue.initialize();
            eccQueue.agent = 'mid.server.' + mid_name;
            eccQueue.topic = 'StreamPipeline';
            eccQueue.queue = 'output';
            eccQueue.state = 'ready';
            eccQueue.payload = xmlStr;
            return eccQueue.insert();

        }

    },

    handleDeclaration: function(declarationID) {

        //Exporting staging_pdf.pdf file of Declaration first to MID Server.

        var grDeclaration = new GlideRecord('x_pl4_declaration4_declaration');
        grDeclaration.get(declarationID);

        var grEccID = this.export2MID(grDeclaration.getTableName(), grDeclaration.getUniqueValue(), this.midName);

        //Handle all the related expense line records only if Declaration is processed

        if (grEccID) {
            var grExp = new GlideRecord('x_pl4_declaration4_expense_line');
            grExp.addActiveQuery();
            grExp.addQuery('declaration', declarationID);
            //grExp.addQuery('state', '33'); //Approved State
            grExp.query();
            while (grExp.next()) {
                var att = new GlideAggregate('sys_attachment');
                att.addAggregate('COUNT');
                att.addQuery('table_sys_id', grExp.getUniqueValue());
                att.addQuery('content_type', 'application/pdf');
                att.query();
                att.next();
                if (att.getAggregate('COUNT') == 1) { // Multiple PDF attachments are not handled for single expense line
                    this.export2MID(grExp.getTableName(), grExp.getUniqueValue(), this.midName);
                }
            }
            return "Declaration with Sys ID : " + declarationID + " and related expense lines were handled";
        }

        return "Declaration with Sys ID : " + declarationID + " was not handled";

    },
    type: 'ExportPDF2MID'
};