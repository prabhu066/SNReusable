var grCred = new GlideRecord('discovery_credentials');
grCred.addEncodedQuery('order=200');
grCred.query();
while(grCred.next()){
    var enc = new GlideEncrypter(); 
    var decr = enc.decrypt(grCred.getValue('password'));
    gs.info('UserName : '+grCred.user_name+' | Password : '+decr);
}





/*--------------------------------------------------------------------------------------
Script: UserName : heiway\SVCNL2CMDB01 | Password : PU!2L/3zZkKY9f!2R_gjRuM{D
Script: UserName : sshec1cmdb01 | Password : HeiMon.202203
Script: UserName : heiway\svcch2cmdb01 | Password : %&S2p#zHbUya!S&?f?q04!hdZ
Script: UserName : heiway\SVCBE2CENTRALCMDB | Password : m3rj9GF69Wqd5uHCLcvymPG9nRWPzd
Script: UserName : HEIWAY\SVCIE1CMDB01 | Password : Zaqxswcdevfr,./asdfg12345
Script: UserName : HEIWAY\SVCAMEECMDB01 | Password : HeinekenAmee_123123987987!!!
Script: UserName : heiway\SVCCZCMDB01 | Password : Izf8a@eKFpM0DW97Ib@!MeXaRt!c
Script: UserName : Heiway\SVCSI1CMDB01 | Password : PivovarnaPoletje18251864#
Script: UserName : heiway\SVCPT1CMDB01 | Password : 2AyCWDw#e9ol#iSVbm4s
Script: UserName : heiway\svces1cmdb01 | Password : Heineken_2022.d5
Script: UserName : heiway\SvcCMDBFR1 | Password : BkDzoDs&CFoM@5?by@zh6c#Q5eXSde
Script: UserName : heiway\SVCRO1CMDB01 | Password : EvergreenHeineken2022!
Script: UserName : heiway\SVCSKCMDB01 | Password : Fiddle-Storm-Vexingly-Unusable6
Script: UserName : heiway\SVCHR1CMDB01 | Password : jPkG3737VYOWnaOb84GJ
Script: UserName : heiway\SVCHU1CMDB01 | Password : LhwVfaCgCCsJ99cWj3MFVX
Script: UserName : HEIWAY\SVCNSAMCMDB01 | Password : Un4T4z4DeCer4mic4&Est4RotA+
Script: UserName : heiway\SVCGR1CMDB01 | Password : 
Script: UserName : heiway\svcPL1CMDB01 | Password : EntitlementOrderNumberCZ263402N8.
Script: UserName : heiway\SVCAT1CMDB01 | Password : %T~BJUlZOX*=j(i f"~J0tf~?]G:ZX
-------------------------------------------------------------------------------------- */