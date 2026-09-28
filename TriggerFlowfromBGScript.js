//fixInstanceLocation();

function fixInstanceLocation(){
	var grVM = new GlideRecord ('cmdb_ci_vm_instance');
	//grVM.addEncodedQuery('state!=terminated^location!=3305ed9d1bb4b018d3bceb19b04bcb68');
	grVM.addEncodedQuery('sys_idIN47816f921bbcb410047aea42604bcbe8,93b1eb9e1b383014d64b1f42b24bcb4e,116ce4be1bf8b014d64b1f42b24bcbb5');
	grVM.query();
	while(grVM.next()){
		var inputs = {};
    inputs['current'] = grVM;
    inputs['table_name'] = 'cmdb_ci_vm_instance';
	
	var cntxt = sn_fd.FlowAPI.startFlow('global.hnk__set_vm_location_field',inputs);
	gs.log('Set Location Flow is run for '+grVM.getDisplayValue()+ ' with Context Id: '+cntxt,'VM Instance Location Fix');
	
	}
}