updateSerialNumber: function (xmlStr) {
    var responseObj1 = {
        error: "",
        serialList: "",
        requestXMLStr1: ""
    };
    var xmlDoc = new XMLDocument2();
    xmlDoc.parseXML(xmlStr);
    var node = xmlDoc.getNode('//ListOfReferenceCoded');
    var numberList = gs.xmlToJSON(node);
	var jstr = JSON.stringify(numberList);
	var checkTag = jstr.includes('AssetTag');
    var arrLength = numberList.ListOfReferenceCoded.ReferenceCoded.length;
	if(checkTag){
		for (var i = 0; i < arrLength; i += 2) {
        var serialNumber = numberList.ListOfReferenceCoded.ReferenceCoded[i].PrimaryReference.Reference.RefNum;
        var assetTag = numberList.ListOfReferenceCoded.ReferenceCoded[i + 1].PrimaryReference.Reference.RefNum;
        var grAsset = new GlideRecord('alm_hardware');
        if (assetTag == '') {
            responseObj1.serialList += serialNumber + ':';
        } else {

            var assetRecord = grAsset.get('asset_tag', assetTag);
            if (assetRecord && grAsset.serial_number == '') {
                grAsset.serial_number = serialNumber;
                grAsset.update();
            }

        }
    }
	}
	else{
		if (typeof(arrLength) == 'number'){
			for(var i = 0; i < arrLength; i ++){
			var serialNumber = numberList.ListOfReferenceCoded.ReferenceCoded[i].PrimaryReference.Reference.RefNum;
			responseObj1.serialList += serialNumber + '\n';
			}
			
		}else{
			serialNumber = numberList.ListOfReferenceCoded.ReferenceCoded.PrimaryReference.Reference.RefNum;
			responseObj1.serialList +=serialNumber+'\n';
		}
		
	}
    xmlDoc.createElementWithTextValue('MissingAssetTag', responseObj1.serialList.toString());
    responseObj1.requestXMLStr1 = xmlDoc + '';
    return responseObj1;
}