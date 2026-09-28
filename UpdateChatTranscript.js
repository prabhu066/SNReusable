var gdt = new GlideDateTime();
gdt.addDaysLocalTime(-1); // minus number indicate that number of previous days from which missing transcript needs to be generated for interactionsvar 
dummyPayload = '{"uiType":"ContextualAction","model":{"type":"task"},"hideControl":false,"uiMetadata":{"inputControls":[{"uiType":"Picker","model":{"type":"task"},"hideControl":false,"uiMetadata":{"options":[{"label":"Contact Support","value":"brb","displayText":"Contact Support","enabled":true},{"label":"New Conversation","value":"cancelTopic","displayText":"New Conversation","enabled":false},{"label":"","value":"executeSkill","displayText":"","enabled":true},{"label":"","value":"interruptAndReset","displayText":"","enabled":true}],"multiSelect":false,"autoSelect":false,"openByDefault":false,"maskType":"NONE","maxFileSize":0,"fileCount":0,"totalOptionsCount":0,"totalSearchResultsCount":0,"paginationBreak":0},"shouldSkipTranslation":false,"shouldForceTranslation":false}],"userContextDataMap":{}},"restartConversation":false,"userContextDataMap":{},"shouldSkipTranslation":false,"shouldForceTranslation":false}';
var gr = new GlideRecord('interaction');
gr.addQuery('state', 'IN', 'closed_complete,closed_abandoned');
gr.addQuery('transcript', 'Unable to generate transcript');
gr.addQuery('closed_at', '>=', gdt);
gr.addNotNullQuery('transcript');
gr.query();
while (gr.next()) {
    try {
        var conversationId = gr.getValue('channel_metadata_document'); // Repopulate empty message payloadsvar 
        sysGr = new GlideRecord('sys_cs_message');
        sysGr.addQuery('conversation', conversationId);
        sysGr.addQuery('direction', 'Inbound');
        sysGr.addQuery('payload', '');
        sysGr.setWorkflow(false);
        sysGr.query();
        while (sysGr.next()) {
            sysGr.setValue('payload', dummyPayload);
            sysGr.update();
        } // Regenerate transcript
        var transcript = sn_cs.VASystemObject.getTranscriptById(conversationId);
        if (transcript.length > 4000) {
            var attachment = new GlideSysAttachment();
            attachment.write(gr, 'chat_transcript', transcript);
            gr.setValue('transcript', 'See attached file.');
        } else if (transcript === '') { // Check if conversation never started
            var taskGr = new GlideRecord('sys_cs_conversation_task');
            taskGr.addEncodedQuery('topic_type=78ac1b170b2003000e83c71437673ae5^state=init^ORstate=canceled');
            taskGr.query();
            gr.setValue('transcript', taskGr.next() ? 'Conversation did not start' : 'Empty transcript');
        } else {
            gr.setValue('transcript', transcript);
        }
        gr.setValue('transcript_downloaded', false);
        gr.update();
    } catch (err) {
        gs.error('Transcript regeneration failed for interaction ' + gr.getValue('sys_id') + ': ' + err.message);
    }
}