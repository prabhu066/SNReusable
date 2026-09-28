var HNKPowerAutomateService = Class.create();
HNKPowerAutomateService.prototype = {
    initialize: function() {
    },

    triggerRESTMessage: function (restMessageName, methodName, requestBody) {
        var rm = new sn_ws.RESTMessageV2(restMessageName, methodName);
        rm.setRequestHeader('Content-Type', 'application/json');
        rm.setRequestBody(JSON.stringify(requestBody));

        // Execute REST call
        var response = rm.execute();
        return response;

    },

    executeEazleWH: function(recID){
        var grTask = new GlideRecord('task');
        grTask.get(recID);

        if(gs.nil(grTask)){
            gs.error('Task Record does not exist with Sys ID : '+recID);
            return ;            
        }
        var reqObj = {};
        reqObj.number = String(grTask.number);
        reqObj.short_description = String(grTask.short_description);
        reqObj.description = String(grTask.description);
        gs.info(JSON.stringify(reqObj));
        var resp = this.triggerRESTMessage('Power Automate - Eazle','POST', reqObj);

        if(!gs.nil(resp)){
            grTask.comments = 'Power Automate Webhook trigger was attempted with Status Code : '+resp.getStatusCode();
            grTask.update();
        }
        
    },


    type: 'HNKPowerAutomateService'
};