var hfInfo = new Object();
hfInfo["HeaderImageAttachmentId"] = "86dc49e397ab1dd0d948fb27f053af60";
hfInfo["HeaderImageAlignment"] = "left";
hfInfo["FooterImageAttachmentId"] = "";
hfInfo["FooterImageAlignment"] = "TOP_CENTER";
hfInfo["FooterText"] = "Sample Footer Message";
hfInfo["PageSize"] = "A4";
hfInfo["GeneratePageNumber"] = "true";
hfInfo["TopOrBottomMargin"] = "48";
hfInfo["LeftOrRightMargin"] = "24";

var v = new sn_pdfgeneratorutils.PDFGenerationAPI;
var result = v.convertToPDFWithHeaderFooter(buildHTMLforPDF('3fdd0cf8876395d0ffe1ecec3fbb354a') /* Pass Sys ID of Declaratn record*/ , "x_pl4_declaration4_declaration", "3fdd0cf8876395d0ffe1ecec3fbb354a", "Declaration - 3fdd0cf8876395d0ffe1ecec3fbb354a", hfInfo);
gs.info(JSON.stringify(result));

function buildHTMLforPDF(decID) {
    var decHTML = buildDeclarationHTML(decID);
    var expenseHTML = buildTableExpense(decID);
    var imageHTML = buildAttachmentHTML(decID);

    return decHTML + expenseHTML + imageHTML;
}

function buildDeclarationHTML(decSysID) {
    var dec = new GlideRecord('x_pl4_declaration4_declaration');
    dec.get(decSysID);
    var declHTML = '<br /><h1>Declaration ' + dec.title + '</h1><p>Declaration&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : <strong>' + dec.number + '</strong><br />Employee Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :<strong> ' + dec.requester.getDisplayValue() + '</strong><br />Employee Entity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : <strong>' + dec.requester.company.getDisplayValue() + '</strong></p><p>Total Amount &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : <strong>' + dec.total_amount + ' INR</strong><br />Total VAT&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; : 0<br />Total Amount (Excl. VAT)&nbsp; : ' + dec.ex_vat + ' INR</p><br />';

    return declHTML;

}

function buildTableExpense(decSysID) {
    var tableHTML = '<table border="1" cellspacing="0" style="border-collapse:collapse; height:200px; width:100%">	<thead>		<tr>			<td style="text-align:center"><strong>Date</strong></td>			<td style="text-align:center"><strong>Category</strong></td>			<td style="text-align:center"><strong>Name</strong></td>			<td style="text-align:center"><strong>Invoice Number</strong></td>			<td style="text-align:center"><strong>Distance(KM)</strong></td>			<td style="text-align:center"><strong>Total Amount</strong></td>			<td style="text-align:center"><strong>VAT</strong></td>			<td style="text-align:center"><strong>VAT Amount</strong></td>			<td style="text-align:center"><strong>Total Amount(Ex. VAT)</strong></td>			<td style="text-align:center"><strong>Currency</strong></td>		</tr>	</thead>	<tbody>	';

    var grExp = new GlideRecord('x_pl4_declaration4_expense_line');
    grExp.addEncodedQuery('declaration=' + decSysID);
    grExp.query();
    while (grExp.next()) {
        tableHTML += '<tr>			<td style="text-align:center">' + grExp.invoice_date + '</td>			<td style="text-align:center">' + grExp.category.getDisplayValue() + '</td>			<td style="text-align:center">' + grExp.requester.getDisplayValue() + '</td>			<td style="text-align:center">' + grExp.invoice_number + '</td>			<td style="text-align:center">' + grExp.distance + '</td>			<td style="text-align:center">' + grExp.total_amount + '</td>			<td style="text-align:center">' + grExp.vat.getDisplayValue() + '</td>			<td style="text-align:center">' + grExp.vat_amount + '</td>			<td style="text-align:center">' + grExp.ex_vat + '</td>			<td style="text-align:center">INR</td>		</tr>';
    }

    var endHTML = '</tbody></table><p>&nbsp;</p><hr />';

    return tableHTML + endHTML;

}

function buildAttachmentHTML(decSysID) {
    var htmlIMG = '<p><strong>Attachments:</strong><br /><br />&nbsp;</p>';
    var grExpLine = new GlideRecord('x_pl4_declaration4_expense_line');
    grExpLine.addEncodedQuery('active=true^declaration=' + decSysID);
    grExpLine.query();
    while (grExpLine.next()) {
        var grAttach = new GlideRecord('sys_attachment');
        grAttach.addEncodedQuery('content_typeLIKEimage^table_nameNOT LIKEZZ_YY^table_sys_id=' + grExpLine.getUniqueValue());
        grAttach.query();
        while (grAttach.next()) {
            htmlIMG += '<p><img alt="" align="middle" src="sys_attachment.do?sys_id=' + grAttach.getUniqueValue() + '" style="height:350px; width:300px" /></p>'
        }

    }

    return htmlIMG;
}