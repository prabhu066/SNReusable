var grC = new GlideRecord('discovery_credentials');
grC.addEncodedQuery('u_owned_by!=2d8034d31be3ac10d3bceb19b04bcbdf^u_owned_by!=NULL^mid_list=622ccb421bffa0947ee064e0b24bcbb2,dfa794e01bd76494d3bceb19b04bcb2b^u_owned_by!=9f0415191bfb64147ee064e0b24bcbb1^type=windows');
grC.query();
while(grC.next()){
	var grU = new GlideUpdateManager2();
	grU.saveRecord(grC);
}