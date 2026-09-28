var PL4Expense4uPdfGenerator = Class.create();
PL4Expense4uPdfGenerator.prototype = {
    initialize: function() {},

    getRequesterCompany: function(requesterId) {
        var grUser = new GlideRecord('sys_user');
        grUser.get(requesterId);
        return this.getRequesterDefaultCurrency(grUser.getValue('company'));
    },

    getRequesterDefaultCurrency: function(company) {
        var grReimburseEntity = new GlideRecord('x_pl4_declaration4_reimbursement_entities');
        grReimburseEntity.addEncodedQuery('company=' + company);
        grReimburseEntity.query();
        if (grReimburseEntity.next()) {
            return grReimburseEntity.getValue('currency');
        }
    },

    buildHTMLforPDF: function(decID, company) {
        var decHTML = '';
        var expenseHTML = '';
        var imageHTML = this.buildAttachmentHTML(decID);
        if (company == '4mation India') {
            decHTML = this.buildIndiaDeclarationHTML(decID);
            expenseHTML = this.buildIndiaTableExpense(decID);

        } else {
            decHTML = this.buildEuDeclarationHTML(decID);
            expenseHTML = this.buildEuTableExpense(decID);
        }
        return decHTML + expenseHTML + imageHTML;
    },

    buildIndiaDeclarationHTML: function(decSysID) {
        var dec = new GlideRecord('x_pl4_declaration4_declaration');
        dec.get(decSysID);
        var currencyValue = this.getRequesterCompany(dec.getValue('requester'));
        var declHTML = '<br /><h1>Declaration ' + dec.getValue('title') + '</h1><p>Declaration&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : <strong>' + dec.number + '</strong><br />Employee Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :<strong> ' + dec.requester.getDisplayValue() + '</strong><br />Employee Entity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :<strong>' + dec.requester.company.getDisplayValue() + '</strong></p><p>Amount to be paid : <strong>' + currencyValue + ' ' + dec.getValue('amount_total') + ' </strong><br /><hr><p style="font-size:12px">Total Amount (in EUR)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>' + dec.getValue('total_amount') + '</strong><br />';
        return declHTML;
    },



    buildIndiaTableExpense: function(decSysID) {
        var tableHTML = '<table style="border-collapse: collapse; height: 100%; width: 100%; color: #0f1635; background-color: #eef3fa;" border="1" cellspacing="0"><thead><tr style="height: 15.8px;"><td style="text-align: center; width: 10%; height: 15.8px;"><strong>Date</strong></td><td style="text-align: center; width: 10%; height: 15.8px;"><strong>Category</strong></td><td style="text-align: center; width: 10.%; height: 15.8px;"><strong>Requestor Name</strong></td><td style="text-align: center; width: 10%; height: 15.8px;"><strong>Invoice Number</strong></td><td style="text-align: center; width: 10%; height: 15.8px;"><strong>GSTIN</strong></td><td style="text-align: center; width: 10%; height: 15.8px;"><strong>Currency</strong></td><td style="text-align: center; width: 10%; height: 15.8px;"><strong>Invoice Amount</strong></td><td style="text-align: center; width: 10%; height: 15.8px;"><strong>In EUR</strong></td>';
        var grExp = new GlideRecord('x_pl4_declaration4_expense_line');
        grExp.addEncodedQuery('declaration=' + decSysID + '^state=33');
        grExp.query();
        while (grExp.next()) {
            tableHTML += '<tr><td style="text-align:center">' + grExp.getValue('invoice_date') + '</td><td style="text-align:center">' + grExp.category.getDisplayValue() + '</td><td style="text-align:center">' + grExp.requester.getDisplayValue() + '</td><td style="text-align:center">' + grExp.getValue('invoice_number') + '</td><td style="text-align:center">' + grExp.gstin.getDisplayValue() + '</td><td style="text-align:center">' + grExp.getValue('currency') + '</td><td style="text-align:center">' + grExp.amount_total.getDisplayValue() + '</td><td style="text-align:center">' + grExp.total_amount.getDisplayValue() + '</td></tr>';
        }
        var endHTML = '</tbody></table><p>&nbsp;</p><hr />';
        return tableHTML + endHTML;
    },

    buildEuDeclarationHTML: function(decSysID) {
        var dec = new GlideRecord('x_pl4_declaration4_declaration');
        dec.get(decSysID);
        var currencyValue = this.getRequesterCompany(dec.getValue('requester'));
        var declHTML = '<br /><h1>Declaration ' + dec.getValue('title') + '</h1><p>Declaration&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : <strong>' + dec.number + '</strong><br />Employee Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :<strong> ' + dec.requester.getDisplayValue() + '</strong><br />Employee Entity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : <strong>' + dec.requester.company.getDisplayValue() + '</strong></p><p><b>Amount to be paid</b> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : <strong>' + currencyValue + ' ' + dec.getValue('amount_total') + ' </strong><br /><hr><p style="font-size:12px;">Total Amount (in EUR)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>' + dec.getValue('total_amount') + '</strong><br />Total Amount (Excl. VAT)&nbsp; : ' + currencyValue + ' ' + dec.getValue('ex_vat') + ' </p><br />';
        return declHTML;
    },

    buildEuTableExpense: function(decSysID) {
        var tableHTML = '<table border="1" cellspacing="0" style="border-collapse:collapse; height:100%; width:100%; color:#0f1635; background-color:#eef3fa"><thead><tr><td style="text-align:center"><strong>Date</strong></td><td style="text-align:center"><strong>Category</strong></td><td style="text-align:center"><strong>Requester</strong></td><td style="text-align:center"><strong>Distance(KM)</strong></td><td style="text-align:center"><strong>Currency</strong></td><td style="text-align:center"><strong>Invoice Amount</strong></td><td style="text-align:center"><strong>VAT %</strong></td><td style="text-align:center"><strong>VAT Amount</strong></td><td style="text-align:center"><strong>In EUR</strong></td></tr></thead><tbody>';

        var grExp = new GlideRecord('x_pl4_declaration4_expense_line');
        grExp.addEncodedQuery('declaration=' + decSysID + '^state=33');
        grExp.query();
        while (grExp.next()) {
            tableHTML += '<tr><td style="text-align:center">' + grExp.getValue('invoice_date') + '</td><td style="text-align:center">' + grExp.category.getDisplayValue() + '</td><td style="text-align:center">' + grExp.requester.getDisplayValue() + '</td><td style="text-align:center">' + grExp.getValue('distance') + '</td><td style="text-align:center">' + grExp.getValue('currency') + '</td><td style="text-align:center">' + grExp.getValue('amount_total') + '</td><td style="text-align:center">' + grExp.vat.getDisplayValue() + '</td><td style="text-align:center">' + grExp.vat_amount.getDisplayValue() + '</td><td style="text-align:center">' + grExp.getValue('total_amount') + '</td></tr>';
        }
        var endHTML = '</tbody></table><p>&nbsp;</p><hr />';
        return tableHTML + endHTML;
    },

    buildAttachmentHTML: function(decSysID) {
        var htmlIMG = '<p><strong>Attachments:</strong><br /><br />&nbsp;</p>';
        var grExpLine = new GlideRecord('x_pl4_declaration4_expense_line');
        grExpLine.addEncodedQuery('active=true^declaration=' + decSysID + '^state=33');
        grExpLine.query();
        while (grExpLine.next()) {
            var grAttach = new GlideRecord('sys_attachment');
            grAttach.addEncodedQuery('content_typeLIKEimage^table_nameNOT LIKEZZ_YY^table_sys_id=' + grExpLine.getUniqueValue());
            grAttach.query();
            while (grAttach.next()) {
                htmlIMG += '<p><img alt="" align="middle" src="sys_attachment.do?sys_id=' + grAttach.getUniqueValue() + '" style="height:auto; max-width:500px" /></p>';
            }
        }
        return htmlIMG;
    },

    createAndAttachPdf: function(decRec) {
        var finalHTML = this.buildHTMLforPDF(decRec.getUniqueValue(), decRec.requester.company.getDisplayValue()); //Sys ID of Declaration record

        var hfInfo = new Object();
        hfInfo["HeaderImageAttachmentId"] = gs.getProperty('x_pl4_declaration4.plat4mation_logo');
        hfInfo["HeaderImageAlignment"] = "left";
        hfInfo["FooterImageAttachmentId"] = "";
        hfInfo["FooterImageAlignment"] = "TOP_CENTER";
        hfInfo["FooterText"] = "Plat4mation";
        hfInfo["HeaderImageHeight"] = "30";
        hfInfo["HeaderImageWidth"] = "30";
        hfInfo["PageSize"] = "A4";
        hfInfo["GeneratePageNumber"] = "true";
        hfInfo["TopOrBottomMargin"] = "48";
        hfInfo["LeftOrRightMargin"] = "24";

        var v = new sn_pdfgeneratorutils.PDFGenerationAPI;
		var pdfName = (decRec.contains_pdf)? "staging_pdf" : decRec.getValue('title') + " Expense PDF";
        var result = v.convertToPDFWithHeaderFooter(finalHTML, "x_pl4_declaration4_declaration", decRec.getUniqueValue(), pdfName, hfInfo);
    },

    type: 'PL4Expense4uPdfGenerator'
};