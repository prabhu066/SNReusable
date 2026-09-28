var getFirstProp = JSON.parse(gs.getProperty('cmdb.duplicate_ci.class.indicator'));
var genericDuplicateCiIdentifier = 'discovery_source=LDAP^duplicate_of!=NULL^nameSAMEASduplicate_of.name^u_disable=FALSE^assetISEMPTY^sys_updated_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()';
var getWhitelistedTables = gs.getProperty('cmdb.duplicate_ci.attributes.table_whitelist').split(",");

var finalListOfWhitelistedTables = [];
var taskSummary = [];

getWhitelistedTables.forEach(function (item) {
    var getExtendedTables = new TableUtils(item);
    var getExtendedTablesWithExtensions = j2js(getExtendedTables.getAllExtensions());
    getExtendedTablesWithExtensions.forEach(function (subItem) {
        finalListOfWhitelistedTables.push(subItem);
    });
});


for (var ciClassData = 0; ciClassData < Object.keys(getFirstProp).length; ciClassData++) {
    var inClass = getFirstProp[ciClassData]["class"];
    var checkMaxRelationship = getFirstProp[ciClassData]["maxRelationship"].split(",");
    var checkMostRecentDiscovery = getFirstProp[ciClassData]["mostRecentDiscovery"].split(",");
    var checkMostAttributes = getFirstProp[ciClassData]["mostAttributes"].split(",");
    var dupIdentifier = getFirstProp[ciClassData]["duplicate_identifier"].split(",");
    var getDupServer = new GlideRecord(inClass);
    getDupServer.addEncodedQuery(genericDuplicateCiIdentifier);
    getDupServer.setLimit(5);
    getDupServer.query();
    var listCI = [];
    while (getDupServer.next()) {
        var serverObj = {};
        serverObj.name = getDupServer.getValue(dupIdentifier[0]);
        serverObj.duplicateOfRecordId = getDupServer.getValue('sys_id');
        serverObj.mainCiRecordId = getDupServer.getValue('duplicate_of');
        serverObj.className = inClass;
        listCI.push(serverObj);
        var duplicateCI = getDupServer.sys_id;
        var parentCI = getDupServer.duplicate_of;

        var refTableName = inClass;
        var refRecordId = duplicateCI;
        var refenceObjFilteredList = getAllReferenceList(refTableName, refRecordId);
        //loop through the referenced table results
        if (refenceObjFilteredList.length > 0) {
            serverObj.refenceObjFilteredList = refenceObjFilteredList;
        }
        for (p = 0; p < Object.keys(refenceObjFilteredList).length; p++) {
            var referencedTable = refenceObjFilteredList[p]["table"];
            var refQuery = refenceObjFilteredList[p]["query"];

            var matchClass = finalListOfWhitelistedTables.indexOf(referencedTable);
            if (matchClass == -1) {
                // gs.info("Replacing Duplicate CI Reference Record with Primary CI SysID: Referenced Table Name: " + referencedTable + " : Query " + refQuery + ": " + "Duplicate CI: " + duplicateCI + "*** Parent CI: " + parentCI);
            }
        }
        publishList(refenceObjFilteredList);

        // gs.log("Duplicate CI being delete from the Fix Script. Name: " + getDupServer.name + "|||sysID: " + duplicateCI);

    }
    taskSummary.push(listCI);
    var hasAllTotalRel = getCiRelCount(listCI);
    var ciDiscoInfo = getRecentDiscoDaysCount(listCI);
    var mostAttributes = getMostAttributesCountInfo(listCI);

    var remediationItems = createPayload(taskSummary, hasAllTotalRel, ciDiscoInfo, mostAttributes);
    var handleRemediationPayload = markCiAsDuplicate(remediationItems);
}

function createPayload(taskSummary, hasAllTotalRel, ciDiscoInfo, mostAttributes) {
    var overallSummary = [];

    for (var taskGroupIndex = 0; taskGroupIndex < taskSummary.length; taskGroupIndex++) {
        var taskGroup = taskSummary[taskGroupIndex];

        for (var ciSummaryIndex = 0; ciSummaryIndex < taskGroup.length; ciSummaryIndex++) {
            var ciSummary = taskGroup[ciSummaryIndex];
            var relData = null;
            var discoData = null;
            var attributeData = null;

            // Find matching relationship data
            for (var relIndex = 0; relIndex < hasAllTotalRel.length; relIndex++) {
                var rel = hasAllTotalRel[relIndex];
                if (
                    rel.mainCiRelInfo.sysId === ciSummary.mainCiRecordId ||
                    rel.duplicateRelInfo.sysId === ciSummary.duplicateOfRecordId
                ) {
                    relData = rel;
                    break;
                }
            }

            // Find matching discovery data
            for (var discoIndex = 0; discoIndex < ciDiscoInfo.length; discoIndex++) {
                var disco = ciDiscoInfo[discoIndex];
                if (
                    disco.mainCiDiscoInfo.sysId === ciSummary.mainCiRecordId ||
                    disco.duplicateDiscoInfo.sysId === ciSummary.duplicateOfRecordId
                ) {
                    discoData = disco;
                    break;
                }
            }

            // Find matching attribute data
            for (var attrIndex = 0; attrIndex < mostAttributes.length; attrIndex++) {
                var attr = mostAttributes[attrIndex];
                if (
                    attr.mainCiAttributeInfo.sysId === ciSummary.mainCiRecordId ||
                    attr.duplicateCiAttributeInfo.sysId === ciSummary.duplicateOfRecordId
                ) {
                    attributeData = attr;
                    break;
                }
            }

            if (relData && discoData && attributeData) {
                overallSummary.push({
                    name: ciSummary.name,
                    className: ciSummary.className,
                    refenceObjFilteredList: relData.refenceObjFilteredList,
                    mainCiInfo: relData.mainCiRelInfo,
                    mainCiDiscoInfo: discoData.mainCiDiscoInfo,
                    mainCiAttributeInfo: attributeData.mainCiAttributeInfo,
                    duplicateCiInfo: relData.duplicateRelInfo,
                    duplicateCiDiscoInfo: discoData.duplicateDiscoInfo,
                    duplicateCiAttributeInfo: attributeData.duplicateCiAttributeInfo,
                });
            }
        }
    }

    return overallSummary;
}


function getCiRelCount(listCI) {
    return listCI.map(function (dupCiRec) {
        return {
            ciName: dupCiRec.name,
            className: dupCiRec.className,
            mainCiRelInfo: getMaxReltionshipSum(dupCiRec.mainCiRecordId),
            duplicateRelInfo: getMaxReltionshipSum(dupCiRec.duplicateOfRecordId),
            refenceObjFilteredList: dupCiRec.refenceObjFilteredList
        }
    });
}

function getRecentDiscoDaysCount(listCI) {
    // gs.info(JSON.stringify(listCI, null, 2));

    return listCI.map(function (dupCiRec) {
        return {
            mainCiDiscoInfo: {
                daysInfo: getRecentDiscoveryDays(dupCiRec.mainCiRecordId, dupCiRec.className),
                sysId: dupCiRec.mainCiRecordId
            },
            duplicateDiscoInfo: {
                daysInfo: getRecentDiscoveryDays(dupCiRec.duplicateOfRecordId, dupCiRec.className),
                sysId: dupCiRec.duplicateOfRecordId
            }
        }
    });
}


function getMostAttributesCountInfo(listCI) {
    return listCI.map(function (dupCiRec) {
        return {
            mainCiAttributeInfo: {
                countOfAttributes: getMostAttributesCount(dupCiRec.mainCiRecordId, dupCiRec.className),
                sysId: dupCiRec.mainCiRecordId
            },
            duplicateCiAttributeInfo: {
                countOfAttributes: getMostAttributesCount(dupCiRec.duplicateOfRecordId, dupCiRec.className),
                sysId: dupCiRec.duplicateOfRecordId
            }
        }
    });
}

function getMaxReltionshipSum(sysID) {
    var checkParentRel = new GlideRecord('cmdb_rel_ci');
    checkParentRel.addEncodedQuery('parent.sys_id=' + sysID + '^type!=281d7566f1571100a92eb60da2bce50d^ORtype=NULL');
    checkParentRel.query();
    var checkChildRel = new GlideRecord('cmdb_rel_ci');
    checkChildRel.addEncodedQuery('child.sys_id=' + sysID + '^type!=281d7566f1571100a92eb60da2bce50d^ORtype=NULL');
    checkChildRel.query();
    return {
        childRel: checkChildRel.getRowCount(),
        parentRel: checkParentRel.getRowCount(),
        relSum: Number(checkChildRel.getRowCount()) + Number(checkParentRel.getRowCount()),
        sysId: sysID,
    };
}

function getRecentDiscoveryDays(sysID, className) {
    var glideCIRecord = new GlideRecord(className);
    if (glideCIRecord.get(sysID)) {
        var lastDiscovered = glideCIRecord.last_discovered;
        daysDifference = 0;
        if (lastDiscovered) {
            var todayDate = new GlideDateTime();
            var lastDiscoveredDate = new GlideDateTime(lastDiscovered);
            daysDifference = GlideDateTime.subtract(todayDate, lastDiscoveredDate).getDayPart();
        }
        return daysDifference;
    }
}

function getMostAttributesCount(sysID, inClass) {
    //get list of attributes that needs to be checked for mostAttributes score calculation from property 'Attributes Check For Duplicate CIs'
    var callProperty = gs.getProperty('cmdb.duplicate_ci.attributes.check');
    attributeList = callProperty.split(",");
    //glide record the input sysID to get the value of inout attribute
    var glideCIRecord = new GlideRecord(inClass);
    if (glideCIRecord.get(sysID)) {
        attributesCount = 0;
        //loop through all the attributes list in the property
        for (k = 0; k < attributeList.length; k++) {
            var tempAttribute = attributeList[k];
            var glideCIAttributeResult = glideCIRecord.getElement(tempAttribute);
            //gs.info(glideCIAttributeResult);
            if (glideCIAttributeResult) {
                attributesCount++;
            }
        }
        return attributesCount;
    }
}



function getAllReferenceList(refTableName, refRecordId) {
    var refenceObjList = []
    var dictionaryEntryGr = getDictionaryEntryForRfTbl(refTableName);
    while (dictionaryEntryGr.next()) {
        var referenceObj = getReferenceObj(dictionaryEntryGr, refRecordId);
        refenceObjList.push(referenceObj);
    }
    var refenceObjFilteredList = getValidReferenceObjList(refenceObjList);
    // gs.info(JSON.stringify(refenceObjFilteredList, null, 4)); // here revant

    return refenceObjFilteredList;
}

function getReferenceObj(dictionaryEntryGr, refRecordId) {
    //gs.info('>>>> getReferenceObj');
    var referenceObj = {};
    referenceObj.table = dictionaryEntryGr.getValue('name');
    referenceObj.query = dictionaryEntryGr.getValue('element') + '=' + refRecordId;

    return referenceObj;
}

function getValidReferenceObjList(refenceObjList) {
    var filteredList = refenceObjList.filter(function (refenceObj) {
        var recordGr = getRecords(refenceObj.table, refenceObj.query);
        return recordGr && recordGr.hasNext();
    });
    return filteredList;
}

function publishList(refenceObjFilteredList) {
    //gs.info('>>>> publishList');
    refenceQueryList = refenceObjFilteredList.map(function (refenceObj) {
        return gs.getProperty('glide.servlet.uri') + refenceObj.table + '_list.do?sysparm_query=' + refenceObj.query;
    });

    //gs.info(refenceQueryList.join('\n'));
}

function getDictionaryEntryForRfTbl(refTableName) {
    //gs.info('>>>> getDictionaryEntryForRfTbl');
    var defaultQuery = getDefaultQuery();
    var query = defaultQuery + '^reference=' + refTableName;
    return getRecords('sys_dictionary', query, true);
}

function getRecords(table, query, stopWhenFailed) {
    //gs.info('>>>> getRecords');
    var tableGr = new GlideRecord(table);
    if (!tableGr.isValid()) {
        throw "Invalid table name: " + table;
    }

    tableGr.addEncodedQuery(query);
    tableGr.query();

    if (!tableGr.hasNext() && stopWhenFailed) {
        throw "No reference found.";
    }

    return tableGr;
}

function getDefaultQuery() {
    return 'active=true^internal_type=reference^ORinternal_type=glide_list^nameNOT LIKEvar_';
}


function markCiAsDuplicate(remediationItems) {
    var remediationPayload = remediationItems.map(function (item) {
        var score = 0;
        if (
            item.duplicateCiAttributeInfo.countOfAttributes >
            item.mainCiAttributeInfo.countOfAttributes
        ) {
            score += 1;
        }

        if (item.duplicateCiInfo.relSum > item.mainCiInfo.relSum) {
            score += 1;
        }

        if (item.refenceObjFilteredList) {
            score += 1;
        }

        item.rank = score;
        return item;
    });
    gs.info(JSON.stringify(remediationPayload, null, 4));
}