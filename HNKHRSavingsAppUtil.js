var HNKHRSavingsAppUtil = Class.create();
HNKHRSavingsAppUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /* Description : The function checks if the user has accepted the privacy statement
    Inputs: userid
    Output:  return true if accepted ; return false if not accepted*/

    isPrivacyStmtAccepted: function (userid) {
        var isPrivacyAccepted = false;
        var ur_name = new GlideRecord('sys_user');
        ur_name.addQuery('sys_id', userid);
        ur_name.query();
        while (ur_name.next()) {
            if (ur_name.u_savings_priv_stmt == true) {
                isPrivacyAccepted = true;
            } else {
                isPrivacyAccepted = false;
            }
        }
        return isPrivacyAccepted;
    },

    /* Description : The function checks if the user has the Savings App Enabled
        Inputs: userid
        Output:  return true if Savings App is Enabled ; return false if not Enabled*/

    isSavingsAppEnabled: function (userid) {
        var isSavingsAppEnabled = true;
        var hr_name = new GlideRecord('sys_user');
        hr_name.addQuery('sys_id', userid);
        hr_name.query();
        while (hr_name.next()) {
            var comp = psa.company;
            var comp_name = new GlideRecord('core_company');
            comp_name.addQuery('sys_id', comp);
            comp_name.query();
            if (comp_name.next()) {
                if (comp_name.u_savings_app_on_comp == true) {
                    isSavingsAppEnabled = true;
                } else {
                    isSavingsAppEnabled = false;
                }
            }
        }

        return isSavingsAppEnabled;
    },
    /* Description : The function update User Privacy Agreement
    Inputs: userid
    Output:  update User Privacy Agreement as true*/
    updateUserPrivacyAgreement: function (userid) {
        var up_name = new GlideRecord('sys_user');
        up_name.addQuery('sys_id', userid);
        up_name.query();
        while (up_name.next()) {
            if (up_name.u_savings_priv_stmt == false) {
                up_name.setValue('u_savings_priv_stmt', true);
                up_name.update();
            }

        }
    },
    /* Description : The function to get Employee data
    Inputs: userid
    Output: Response of employee */
    getEmployeeData: function (userid) {
        try {
            // var gdt = new GlideDateTime(); 


            if (userid == '' || userid == undefined) {
                userid = this.getParameter('sysparm_user_name');
            }
            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'getEmployeeDataV2');
            //below code for APIM migration
            //var endpoint = this._getEndpoint('employeedata');
            //r.setStringParameterNoEscape('baseURL', endpoint);
            var details = this._getURLSecret();
            r.setStringParameterNoEscape('baseURL', details.savingsURL);
            var empe_id = this.getEmployeeId(userid);

            r.setStringParameterNoEscape('employee_id', empe_id);
            //below line for APIM migration
            r.setStringParameterNoEscape('savingsecret', details.savingssecret);
            r.setHttpTimeout(30000);

            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();

            if (httpStatus != '200' || responseBody == null || responseBody == undefined) {
                var errorCode = gs.getProperty('hnk.hrsavings.error');
                return errorCode;
            }

        } catch (ex) {
            var message = ex.message;
            errorCode = gs.getProperty('hnk.hrsavings.error');
            return errorCode;
        }

        return responseBody;
    },

    /* Description : The function to get employee data based on start and end date submitted
    Inputs: userid,statedate,enddate
    Output: Transactions of users based on provided details-- default 10 transactions */

    getEmployeeDataRange: function (userid, statedate, enddate) {
        try {
            //  var gdt = new GlideDateTime(); 


            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'getEmployeeDataV2');
            var empe_id = this.getEmployeeId(userid);
            //below code for APIM migration
            //var endpoint = this._getEndpoint('employeedata');
            //r.setStringParameterNoEscape('baseURL', endpoint);
            var details = this._getURLSecret();
            r.setStringParameterNoEscape('baseURL', details.savingsURL);

            var f_startDate = this.getFormattedDate(statedate);
            var f_endDate = this.getFormattedDate(enddate);
            r.setStringParameterNoEscape('employee_id', empe_id);
            r.setStringParameterNoEscape('t_startdate', f_startDate);
            r.setStringParameterNoEscape('t_enddate', f_endDate);
            //below line for APIM migration
            r.setStringParameterNoEscape('savingsecret', details.savingssecret);
            r.setHttpTimeout(30000);
            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();

            if (httpStatus != '200' || responseBody == null || responseBody == undefined) {
                var errorCode = gs.getProperty('hnk.hrsavings.error');
                return errorCode;
            }

        } catch (ex) {
            var message = ex.message;
            errorCode = gs.getProperty('hnk.hrsavings.error');
            return errorCode;
        }
        return responseBody;
    },

    /* Description : The function to get employee data of all time
    Inputs: userid
    Output: Transactions of users of all time */
    getEmployeeDataOfAllRange: function (userid) {
        try {
            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'getEmployeeDataV2');
            var empe_id = this.getEmployeeId(userid);

            //below code for APIM migration
            //var endpoint = this._getEndpoint('employeedata');
            //r.setStringParameterNoEscape('baseURL', endpoint);
            var details = this._getURLSecret();
            r.setStringParameterNoEscape('baseURL', details.savingsURL);

            r.setStringParameterNoEscape('employee_id', empe_id);
            r.setStringParameterNoEscape('t_indicator', 'X');
            //below line for APIM migration
            r.setStringParameterNoEscape('savingsecret', details.savingssecret);
            r.setHttpTimeout(30000);
            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();

            if (httpStatus != '200' || responseBody == null || responseBody == undefined) {
                var errorCode = gs.getProperty('hnk.hrsavings.error');
                return errorCode;
            }

        } catch (ex) {
            var message = ex.message;
            errorCode = gs.getProperty('hnk.hrsavings.error');
            return errorCode;
        }
        return responseBody;
    },


    /* Description : The function to change monthly savings amount
    Inputs: userid,savingsAmount,savingsStartDate,sessionToken
    Output: changes monthly savings amount as per user request */

    changeSavingsAmount: function (userid, savingsAmount, savingsStartDate, sessionToken) {
        try {
            // var starttimechange = new GlideTime();
            //var gdt = new GlideDateTime(); 


            var errorCode = gs.getProperty('hnk.hrsavings.error');
            if (userid == '' || userid == undefined) {
                userid = this.getParameter('sysparm_userid');
            }
            if (savingsAmount == '' || savingsAmount == undefined) {
                savingsAmount = this.getParameter('sysparm_savingsAmount');
            }
            if (savingsStartDate == '' || savingsStartDate == undefined) {
                savingsStartDate = this.getParameter('sysparm_startDate');
            }
            if (sessionToken == '' || sessionToken == undefined) {
                sessionToken = this.getParameter('sysparm_sessionToken');
            }
            var emplo_id = this.getEmployeeId(userid);
            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'changeSavingsAmount');
            //below code for APIM migration
            //var endpoint = this._getEndpoint('employeedata');
            //r.setStringParameterNoEscape('baseURL', endpoint);
            var details = this._getURLSecret();
            r.setStringParameterNoEscape('baseURL', details.savingsURL);
            r.setStringParameterNoEscape('employeeId', emplo_id);
            //below line for APIM migration
            r.setStringParameterNoEscape('savingsecret', details.savingssecret);
            //var savingsAmountInt =savingsAmount;
            var savingsAmountInt = parseInt(savingsAmount);
            var payload = {};
            payload.savingsStartDate = savingsStartDate;
            payload.savingsAmount = savingsAmount;
            payload.sessionToken = sessionToken;
            var json = new JSON();
            var payload1 = JSON.stringify(payload);
            r.setRequestBody(payload1);
            r.setHttpTimeout(30000);
            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();
            var obj = {};
            obj.responseBody = responseBody;
            obj.httpStatus = httpStatus;
            var data = json.encode(obj); //JSON formatted string    
        } catch (ex) {
            var message = ex.message;
            errorCode = gs.getProperty('hnk.hrsavings.error');
            return errorCode;
        }


        return data;
    },

    /* Description : The function to withdraw the amount
    Inputs: userid,wthdrawAmt,withdrawalDate,sessionToken
    Output: Withdraws amount as per user request */

    withdrawAmount: function (userid, wthdrawAmt, withdrawalDate, sessionToken) {

        //var gdt = new GlideDateTime(); 



        if (wthdrawAmt == '' || wthdrawAmt == undefined) {
            wthdrawAmt = this.getParameter('sysparm_wthdrawAmt');

        }
        if (withdrawalDate == '' || withdrawalDate == undefined) {
            withdrawalDate = this.getParameter('sysparm_withdrawalDate');

        }
        if (sessionToken == '' || sessionToken == undefined) {
            sessionToken = this.getParameter('sysparm_sessionToken');

        }
        if (userid == '' || userid == undefined) {
            userid = this.getParameter('sysparm_user_name');

        }
        try {
            var emplo_id = this.getEmployeeId(userid);


            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'requestWithdrawal');
            //below code for APIM migration
            //var endpoint = this._getEndpoint('employeedata');
            //r.setStringParameterNoEscape('baseURL', endpoint);
            var details = this._getURLSecret();
            r.setStringParameterNoEscape('baseURL', details.savingsURL);
            r.setStringParameterNoEscape('employeeId', emplo_id);
            //below line for APIM migration
            r.setStringParameterNoEscape('savingsecret', details.savingssecret);
            var wthdrawAmtInt = parseInt(wthdrawAmt);
            var payload = {};
            payload.withdrawalDate = withdrawalDate;
            payload.withdrawalAmount = wthdrawAmt;
            payload.sessionToken = sessionToken;
            var json = new JSON();
            payload = JSON.stringify(payload);


            r.setRequestBody(payload);
            r.setHttpTimeout(30000);
            var response = r.execute();
            var responseBody = response.getBody();

            var httpStatus = response.getStatusCode();
            //To send email to users, on success withdraw transaction by admin
            /*var emailID = "";
            var gr = new GlideRecord('sys_user');
            gr.addQuery('sys_id', userid);
            gr.query();
            if (gr.next()) {
                emailID = gr.getValue('email');
            }

    	
            if (httpStatus == '200') {
                gs.eventQueue('hr.withdraw.event', current, emailID);
            	
            	
          
            }*/
            //  gs.eventQueue('hr.withdraw.event', current, emailID);

            var obj = {};
            obj.responseBody = responseBody;
            obj.httpStatus = httpStatus;
            var data = json.encode(obj); //JSON formatted string    



        } catch (ex) {
            var message = ex.message;
            errorCode = gs.getProperty('hnk.hrsavings.error');

            return errorCode;
        }
        return data;
    },

    /* Description : The function to get Employee number
    Inputs: userid
    Output: returns employee number */

    getEmployeeId: function (userid) {
        var ur_name = new GlideRecord('sys_user');
        ur_name.addQuery('sys_id', userid);
        ur_name.query();
        var emp_id = "";
        while (ur_name.next()) {
            emp_id = ur_name.getValue('employee_number');

        }
        return emp_id;
    },

    /* Description : The function to format date
    Inputs: datestr
    Output: returns date in yyyy-mm-dd format */

    getFormattedDate: function (datestr) {

        if (datestr != '' && datestr != null && datestr != 'undefined') {
            var d = new Date(datestr);
            var dat = d.getUTCDate();
            var month = d.getUTCMonth();
            var year = d.getUTCFullYear();
            var twoDigitDate = ("0" + dat).slice(-2);
            var twoDigitMonth = ("0" + (month + 1)).slice(-2);
            var newDate = year + "-" + twoDigitMonth + "-" + twoDigitDate;

        }
        return newDate;
    },

    sendNotificationOnWithdraw: function (to, subject, body) {

        try {
            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'sendNotificationOnWithdraw');
            r.setRequestBody(body);

            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();

        } catch (ex) {
            var message = ex.message;
        }
        return httpStatus;
    },

    /* Description : The function to send Email (for HR)
        Inputs: body
        Output: Email sent to the users by HR */
    sendEmail: function (body) {
        if (body == '' || body == undefined) {
            body = this.getParameter('sysparm_email');

        }
        try {
            var r = new sn_ws.RESTMessageV2('HNK HR Savings App', 'SendEmail');
            r.setRequestBody(body);

            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();

        } catch (ex) {
            var message = ex.message;
        }
        return httpStatus;
    },
    /* Description : The function to send Email (for HR)
    Inputs: body
    Output: Email sent to the users by HR */
    sendEmailsThroughEvents: function () {
        var receivedData = this.getParameter('sysparm_email');

        var modifiedData = JSON.parse(receivedData);

        var to = modifiedData.to;

        var box = [];
        for (var i = 0; i < to.length; i++) {

            var grUser = new GlideRecord("sys_user");
            grUser.addQuery("sys_id", to[i]);
            grUser.query();
            if (grUser.next()) {
                box.push(grUser.getValue("email"));
            }
        }
        //below code was added as part of scan findings while updating 'GSD-8576' story
        var boxToString = String(box);
        gs.eventQueue('hr.sendEmails', current, box, receivedData);

        return "Email is Sent";
    },

    /* Description : The function checks if the savings app pin is set to true or false
    Inputs: userid
    Output:  return true if empty ; return false if not empty*/

    isSavingsAppPinReset: function (userid) {
        var isSavingsAppPinReset = true;
        var name = new GlideRecord('sys_user');
        name.addQuery('sys_id', userid);
        name.query();
        while (name.next()) {
            if (name.u_reset_savings_app_pin == true) {
                isSavingsAppPinReset = true;
            } else {
                isSavingsAppPinReset = false;
            }
        }
        return isSavingsAppPinReset;
    },
    /* Description : The function checks if the user has savings app Pin is empty
    Inputs: userid
    Output:  return true if empty ; return false if not empty*/
    isSavingAppPinEmpty: function (userid) {
        var isSavingAppPinEmpty = true;
        var name = new GlideRecord('sys_user');
        name.addQuery('sys_id', userid);
        name.query();
        while (name.next()) {
            if (name.u_savings_acc_pin == "") {
                isSavingAppPinEmpty = true;
            } else {
                isSavingAppPinEmpty = false;
            }
        }
        return isSavingAppPinEmpty;
    },

    /* Description : The function update Reset Saving App PIN
    Inputs: userid,PIN
    Output:  update Reset Saving App PIN as false if Savings App PIN is empty or Reset Savings PIN is True */
    // updateSavingsAppPin: function(userid, pin) {
    //     var Encrypter = new GlideEncrypter();
    //     var encrypted = Encrypter.encrypt(pin);
    //     var up_name = new GlideRecord('sys_user');
    //     up_name.addQuery('sys_id', userid);
    //     up_name.query();
    //     while (up_name.next()) {
    //         if (up_name.u_savings_acc_pin == "" || up_name.u_reset_savings_app_pin == true) {
    //             up_name.u_savings_acc_pin = encrypted;
    //             up_name.setValue('u_reset_savings_app_pin', false);
    //             up_name.update();
    //         }
    //     }
    // },

    updateSavingsAppPin: function (userID, pin) {
        var digest = new GlideDigest();
        var encrypted = digest.getMD5Base64(pin);
        var grUser = new GlideRecord('sys_user');
        grUser.get(userID);
        if (!gs.nil(grUser)) {
            if (gs.nil(grUser.u_savings_acc_pin) || grUser.getValue('u_reset_savings_app_pin') == true) {
                grUser.setValue('u_savings_acc_pin', encrypted);
                grUser.setValue('u_reset_savings_app_pin', false);
                grUser.update();
            }
        }
    },

    /* Description : The function is used to validate PIN
    Inputs: userid,pin
    Output:  returns true if PIN same based on PIN entered by user*/
    // validatePIN: function (userid, pin) {
    //     var isValidPin = false;
    //     var pin_no = new GlideRecord('sys_user');
    //     pin_no.addQuery('sys_id', userid);
    //     pin_no.query();

    //     var Encrypter = new GlideEncrypter();
    //     var encrypteduserPIN = Encrypter.encrypt(pin);

    //     while (pin_no.next()) {
    //         var pinvalue = pin_no.u_savings_acc_pin;

    //         if (pinvalue == encrypteduserPIN) {
    //             isValidPin = true;

    //         } else {

    //             isValidPin = false;
    //         }
    //         //return pin;
    //     }

    //     return isValidPin;
    // },

    validatePIN: function (userID, pin) {
        var isValidPin = false;
        var usrGR = new GlideRecord('sys_user');
        usrGR.get(userID);

        var digest = new GlideDigest();
        var encryptedPINGD = digest.getMD5Base64(pin);

        var Encrypter = new GlideEncrypter();
        var encryptedPINGE = Encrypter.encrypt(pin);

        if (gs.nil(usrGR)) {
            return false;
        }

        if (usrGR.getValue('u_savings_acc_pin') == encryptedPINGD || usrGR.getValue('u_savings_acc_pin') == encryptedPINGE) {
            return true;
        }

        return false;
    },



    //below code is commented as part of APIM migration
    // _getEndpoint: function(functioname) {
    //     var instance = gs.getProperty('instance_name');
    //     var endpoint = '';
    //     if (instance != 'nextgen') {
    //         endpoint = gs.getProperty('hnk.savingsaccount.test');
    //     } else if (instance == 'nextgen') {
    //         endpoint = gs.getProperty('hnk.savingsaccount.prod');
    //     }
    //     return endpoint;
    // },

    /* Description : The function update Reset Saving App PIN
    Inputs: userid
    Output:  update Reset Saving App PIN as true*/
    updateSavingsAppRestPin: function () {
        var userid = this.getParameter("sysparm_user_name");

        var up_name = new GlideRecord('sys_user');
        up_name.addQuery('sys_id', userid);
        up_name.query();
        while (up_name.next()) {
            up_name.setValue('u_reset_savings_app_pin', true);
            up_name.update();

        }
    },

    //below function created as part of APIM upgrade's
    _getURLSecret: function () {
        var instanceType = gs.getProperty('instance_name');
        var detailsObj = {};
        var details = JSON.parse(gs.getProperty('hnk.hr_savingsapp'));
        if (instanceType == 'nextgen') {
            detailsObj.savingsURL = details.prodURL;
            detailsObj.savingssecret = details.prodSecret;
        } else if (instanceType == 'nextgentest') {
            detailsObj.savingsURL = details.testURL;
            detailsObj.savingssecret = details.testSecret;
        } else {
            detailsObj.savingsURL = details.devURL;
            detailsObj.savingssecret = details.devSecret;
        }
        return detailsObj;

    },
    type: 'HNKHRSavingsAppUtil'
});