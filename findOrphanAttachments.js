/**
 * ADMTERANP02@heiway.net
 *
 * Run this in: Scripts - Background (System Definition > Scripts - Background)
 * 
 */

(function findOrphanAttachments() {

    var MAX_RECORDS = 5000;     // Safety cap — increase if needed
    var orphanList = [];
    var processedCount = 0;
    var orphanCount = 0;
	var totalSizeBytes = 0;

    // Tables to skip — these are meta/system tables where parent lookup isn't meaningful
    var SKIP_TABLES = [
        'sys_attachment',
        'sys_attachment_doc',
        'ZZ_YY',        // Placeholder/temp records
        ''              // Blank table names
    ];

    gs.info('=== Orphan Attachment Scan Started ===');

    var attGR = new GlideRecord('sys_attachment');
	attGR.addEncodedQuery('table_nameNOT LIKEZZ_YY');
	attGR.orderByDesc('size_bytes')
    attGR.setLimit(MAX_RECORDS);
    attGR.query();

    while (attGR.next()) {
        processedCount++;

        var tableName = attGR.getValue('table_name');
        var tableSysId = attGR.getValue('table_sys_id');
        var attachSysId = attGR.getValue('sys_id');
        var fileName = attGR.getValue('file_name');
        var contentType = attGR.getValue('content_type');
        var sizeBytes = attGR.getValue('size_bytes');
        var createdOn = attGR.getValue('sys_created_on');

        // Skip system/meta tables
        if (SKIP_TABLES.indexOf(tableName) !== -1) {
            continue;
        }

        // Skip if table_sys_id is blank or a known placeholder
        if (!tableSysId || tableSysId === '0' || tableSysId.length !== 32) {
            orphanList.push({
                sys_id: attachSysId,
                file_name: fileName,
                table_name: tableName,
                table_sys_id: tableSysId,
                content_type: contentType,
                size_bytes: sizeBytes,
                created_on: createdOn,
                reason: 'Invalid or blank table_sys_id'
            });
            orphanCount++;
            continue;
        }

        // Check if the parent table exists as a valid table in the dictionary
        var tableCheck = new GlideRecord('sys_db_object');
        tableCheck.addQuery('name', tableName);
        tableCheck.setLimit(1);
        tableCheck.query();

        if (!tableCheck.next()) {
            // The table itself doesn't exist anymore
            orphanList.push({
                sys_id: attachSysId,
                file_name: fileName,
                table_name: tableName,
                table_sys_id: tableSysId,
                content_type: contentType,
                size_bytes: sizeBytes,
                created_on: createdOn,
                reason: 'Parent table does not exist: ' + tableName
            });
            orphanCount++;
            continue;
        }

        // Check if the parent record exists
        try {
            var parentGR = new GlideRecord(tableName);
            if (!parentGR.get(tableSysId)) {
                orphanList.push({
                    sys_id: attachSysId,
                    file_name: fileName,
                    table_name: tableName,
                    table_sys_id: tableSysId,
                    content_type: contentType,
                    size_bytes: sizeBytes,
                    created_on: createdOn,
                    reason: 'Parent record not found in ' + tableName
                });
                orphanCount++;
            }
        } catch (e) {
            gs.warn('Could not query table [' + tableName + ']: ' + e.message);
        }
    }

    // Output results
    gs.info('Script Execution Complete');
    gs.info('Total attachments scanned : ' + processedCount);
    gs.info('Orphan attachments found  : ' + orphanCount);
    // gs.info('');

   if (orphanList.length > 0) {
        for (var i = 0; i < orphanList.length; i++) {
            if (orphanList[i].size_bytes) {
    
                totalSizeBytes += Number(orphanList[i].size_bytes);
            }
        }
        gs.info('--- Orphan Attachment Details ---');
        gs.info(JSON.stringify(orphanList));
        gs.info('Total Size of the orphan attachments in the list: '+(totalSizeBytes/1000000000)+' GBs');

    } else {
        gs.info('No orphan attachments found within the scanned range.');
    }

    
})();