/*
var v = new sn_pdfgeneratorutils.PDFGenerationAPI;

var gr = new GlideRecord("incident");
var html = '<p>Hello World!</p>';

var result = v.convertToPDF(html, "incident", "57af7aec73d423002728660c4cf6a71c", "myPDF");
gs.info(JSON.stringify(result));

*/


var grInc = new GlideRecord("incident");
grInc.get('57af7aec73d423002728660c4cf6a71c');
var imageURL = 'sys_attachment.do?sys_id=cab36c642feb111020d255272799b63c'
var html = 	'<p>Declaration Number: '+grInc.number+
			'<br />Caller : '+gs.getUserDisplayName(grInc.caller_id)+
			'<br />Currency: INR'+
			'<br />Total Amount: 1000.00'+
			'<br /><img src="'+imageURL+'" width="250px"/>'+
			'</p>';

var hfInfo = new Object();
hfInfo["HeaderImageAttachmentId"] = "b9a642102fa7111020d255272799b665";
hfInfo["HeaderImageAlignment"] = "left";
hfInfo["FooterImageAttachmentId"] = "";
hfInfo["FooterImageAlignment"] = "TOP_CENTER";
hfInfo["FooterText"] = "Sample Footer Message";
hfInfo["PageSize"] = "A4";
hfInfo["GeneratePageNumber"] = "false";
hfInfo["TopOrBottomMargin"] = "36";
hfInfo["LeftOrRightMargin"] = "24";

var v = new sn_pdfgeneratorutils.PDFGenerationAPI;
var result = v.convertToPDFWithHeaderFooter(html, "incident", "57af7aec73d423002728660c4cf6a71c", "myPDF3",hfInfo);
gs.info(JSON.stringify(result));