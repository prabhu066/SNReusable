var NBMessageQueueService = Class.create();
NBMessageQueueService.prototype = {
  initialize: function () {
    this.nbintutils = new global.NBIntegrationUtils();
    this.genericEndpoint = "https://graph.microsoft.com/v1.0/";
  },

  generateToken: function () {
    var tokenRequest = new sn_auth.GlideOAuthClientRequest();
    tokenRequest.setParameter('oauth_requestor_context', "script_include");
    tokenRequest.setParameter('oauth_requestor', "-1");
    tokenRequest.setParameter('oauth_provider_profile', gs.getProperty('oauth.entity.profile.id'));
    tokenRequest.setParameter('oauth_provider_id', "");

    var oAuthClient = new sn_auth.GlideOAuthClient();
    var tokenResponse = oAuthClient.requestTokenByRequest(null, tokenRequest);
    var errorMsg = tokenResponse.getErrorMessage();
    var token = tokenResponse.getToken();
    if(errorMsg){
      gs.info('Token generation error :'+errorMsg);
      return;
    }
    return token
  },

  handleMessageQueue: function (messageQueueID) {
    var messageQueueRec = new GlideRecord('u_messaging_queue');
    if (!messageQueueRec.get(messageQueueID)) {
      gs.info('Message Queue with Sys ID : ' + messageQueueID + ' not found!', 'NBMessageQueueService');
      return;
    }

    if (JSUtil.nil(messageQueueRec.u_action_type)) {
      gs.info('Message Queue with Sys ID : ' + messageQueueID + ' does not have Action Type defined', 'NBMessageQueueService');
      return;
    }

    if (messageQueueRec.u_action_type.getValue() == 'cleanWindowsDevice') {
      var response = this.cleanWindowsDevice(messageQueueRec);
      this.handleResponse(response);
      return;
    }
  },


  cleanWindowsDevice: function (rec) {

    var cleanWindowEndPoint = genericEndpoint + '/' + deviceID + '/cleanWindowsDevice';
    var token = this.generateToken();
    if (messageQueueRec) {

    }

  },

  type: 'NBMessageQueueService'
};


