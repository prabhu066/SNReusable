pattern {
	metadata {
		id = "670e55a4db702200c06776231f961942"
		name = "Windows OS - Servers"
		description = ""
		citype = "cmdb_ci_win_server"
	}
	identification {
		name = "discovery"
		entry_point {type = "*"}
		find_process_strategy {strategy = NONE}
		step {
			name = "Get Data Set By Windows - Classify"
			ref {refid = "656886d6dbc12200c06776231f961930"}
		}
		step {
			name = "Windows - Hardware Information"
			ref {refid = "2ba886d6dbc12200c06776231f96194b"}
		}
		step {
			name = "Insert chassis_type to cmdb_ci_win_server"
			if {
				condition = all {
					is_not_empty {get_attr {"Win32_SystemEnclosure[1].ChassisTypes"}}
					not_contains {
						get_attr {"Win32_SystemEnclosure[1].ChassisTypes"}
						"null"
					}
					not_contains {
						get_attr {"Win32_SystemEnclosure[1].ChassisTypes"}
						"None"
					}
				}
				on_true = transform {
					src_table_name = "cmdb_ci_win_server"
					target_table_name = "cmdb_ci_win_server"
					operation {set_field {
							field_name = "chassis_type"
							value = eval {"javascript:var rtrn = \"\";
    var chassisType = ${Win32_SystemEnclosure[1].ChassisTypes};
    var types = [\"Other\", \"Unknown\", \"Desktop\", \"Low Profile Desktop\", \"Pizza Box\", 
                     \"Mini Tower\", \"Tower\", \"Portable\", \"Laptop\", \"Notebook\", \"Hand Held\", 
                     \"Docking Station\", \"All in One\", \"Sub Notebook\", \"Space-Saving\", 
                     \"Lunch Box\", \"Main System Chassis\", \"Expansion Chassis\", \"SubChassis\", 
                     \"Bus Expansion Chassis\", \"Peripheral Chassis\", \"Storage Chassis\", 
                     \"Rack Mount Chassis\", \"Sealed-Case PC\"];
    rtrn = types[chassisType-1] || null;
"}
						}}
				}
				on_false = nop {}
			}
		}
		step {
			name = "Trim cmdb_serial_number Table"
			transform {
				src_table_name = "cmdb_serial_number"
				target_table_name = "cmdb_serial_number"
				operation {set_field {
						field_name = "serial_number"
						value = eval {"javascript: var rtn = \"\";
var sn = \"\";

if (${cmdb_serial_number} && ${cmdb_serial_number[].serial_number})
	sn  = ${cmdb_serial_number[].serial_number}.trim();
rtn = sn;"}
					}}
			}
		}
		step {
			name = "Insert serial number to cmdb_ci_win_server"
			comment = "Set serial number to main CI"
			transform {
				src_table_name = "cmdb_ci_win_server"
				target_table_name = "cmdb_ci_win_server"
				operation {set_field {
						field_name = "serial_number"
						value = get_attr {"cmdb_serial_number[1].serial_number"}
					}}
			}
		}
		step {
			name = "Reference between serial number to windows server"
			comment = ""
			relation_reference {
				table1_name = "cmdb_serial_number"
				table2_name = "cmdb_ci_win_server"
				result_table_name = "serial_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				ref_direction = parentToChild
				ref_field_name = "non_ci"
			}
		}
		step {
			name = "Windows - OS Information"
			ref {refid = "554ec5589fbc32001d753758442e70ba"}
		}
		step {
			name = "Windows - CPU And Memory"
			ref {refid = "189e4d589fbc32001d753758442e7057"}
		}
		step {
			name = "Insert System, OS and CPU data to cmdb_ci_win_server"
			comment = "Add System, OS and CPU address width to main CI
cpu_core_count calculated using Win32_Processor.NumberOfCores
cpu_core_thread is calculated using Win32_Processor.NumberOfLogicalProcessors & Win32_Processor.NumberOfCores
fqnd calculated using computer_system.primaryHostname & TcpIpParameters.Domain
cpu_count calculated using Win32_Processor"
			transform {
				src_table_name = "cmdb_ci_win_server"
				target_table_name = "cmdb_ci_win_server"
				operation {
					set_field {
						field_name = "os_version"
						value = get_attr {"osInfo[1].Version"}
					}
					set_field {
						field_name = "os_service_pack"
						value = get_attr {"osInfo[1].CSDVersion"}
					}
					set_field {
						field_name = "manufacturer"
						value = get_attr {"computerInfo[1].Manufacturer"}
					}
					set_field {
						field_name = "model_id"
						value = get_attr {"computerInfo[1].Model"}
					}
					set_field {
						field_name = "short_description"
						value = get_attr {"osInfo[1].Description"}
					}
					set_field {
						field_name = "os_address_width"
						value = get_attr {"osAddressWidth[1].AddressWidth"}
					}
					set_field {
						field_name = "assigned_to"
						value = get_attr {"computerInfo[1].UserName"}
					}
					set_field {
						field_name = "cpu_name"
						value = get_attr {"Win32_Processor[1].Name"}
					}
					set_field {
						field_name = "cpu_speed"
						value = get_attr {"Win32_Processor[1].MaxClockSpeed"}
					}
					set_field {
						field_name = "cpu_type"
						value = get_attr {"Win32_Processor[1].Manufacturer"}
					}
					set_field {
						field_name = "cpu_core_count"
						value = eval {"javascript:var rtrn = '';rtrn = (${Win32_Processor.NumberOfCores})>0?${Win32_Processor.NumberOfCores}:\"\";"}
					}
					set_field {
						field_name = "cpu_core_thread"
						value = eval {"javascript:var rtrn = 0;if (JSUtil.notNil(${Win32_Processor.NumberOfCores}) && (${Win32_Processor.NumberOfCores} > 0)){ rtrn = (${Win32_Processor.NumberOfLogicalProcessors})/(${Win32_Processor.NumberOfCores});}"}
					}
					set_field {
						field_name = "ip_address"
						value = get_attr {"computer_system.managementIP"}
					}
					set_field {
						field_name = "host_name"
						value = get_attr {"newHostname"}
					}
					set_field {
						field_name = "fqdn"
						value = get_attr {"fqdn"}
					}
					set_field {
						field_name = "os_domain"
						value = get_attr {"domainName"}
					}
					set_field {
						field_name = "name"
						value = get_attr {"formattedHostname"}
					}
					set_field {
						field_name = "cpu_count"
						value = eval {"javascript:var rtrn = '';var processorsTable = ${Win32_Processor};rtrn = (processorsTable)?processorsTable.size():\"\";"}
					}
					set_field {
						field_name = "os"
						value = get_attr {"computer_system.osName"}
					}
				}
			}
		}
		step {
			name = "Insert ram to cmdb_ci_win_server"
			comment = "Sum all memory modules to calculate total RAM"
			if {
				condition = is_not_empty {get_attr {"Win32_PhysicalMemory[*].Capacity"}}
				on_true = set_attr {
					"cmdb_ci_win_server[*].ram"
					concat {eval {"javascript:
var rtrn = '';
var totalRam = 0;
var modulesCapacities = ${Win32_PhysicalMemory[*].Capacity};
 for (var i=0; i < modulesCapacities.size(); i++) {
   totalRam += modulesCapacities.get(i) / (1048576);
 }
rtrn = totalRam;
"}}
				}
				on_false = nop {}
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_memory_module and cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_memory_module"
				result_table_name = "memory_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "cmdb_ci"
			}
		}
		step {
			name = "Network ARP Table"
			ref {refid = "21f94ed6dbc12200c06776231f9619b2"}
		}
		step {
			name = "Reference between discovery_net_arp_table to cmdb_ci_win_server"
			relation_reference {
				table1_name = "discovery_net_arp_table"
				table2_name = "cmdb_ci_win_server"
				result_table_name = "arp_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				ref_direction = parentToChild
				ref_field_name = "non_ci"
			}
		}
		step {
			name = "Windows - Printers"
			ref {refid = "4ff41edadbc12200c06776231f9619dd"}
		}
		step {
			name = "Windows - Cluster"
			ref {refid = "c03a461adbc12200c06776231f961900"}
		}
		step {
			name = "Reference and relation between cmdb_ci_win_cluster_node to cmdb_ci_win_server"
			comment = "Match each node to the main CI by name"
			if {
				condition = all {
					eq {
						get_attr {"isNode"}
						"true"
					}
					eq {
						get_attr {"shouldRunClusterOnOsType"}
						"true"
					}
				}
				on_true = relation_reference {
					table1_name = "cmdb_ci_win_cluster_node"
					table2_name = "cmdb_ci_win_server"
					result_table_name = "cluster_node_win_server"
					unmatched_lines = remove
					condition = any {
						eq {
							get_attr {"cmdb_ci_win_cluster_node[].name"}
							get_attr {"cmdb_ci_win_server[].host_name"}
						}
						eq {
							get_attr {"cmdb_ci_win_cluster_node[].name"}
							get_attr {"cmdb_ci_win_server[].name"}
						}
					}
					relation_type = "Hosted on::Hosts"
					ref_direction = parentToChild
					ref_field_name = "server"
				}
				on_false = nop {}
			}
		}
		step {
			name = "Relation between cmdb_ci_win_cluster to cmdb_ci_win_server"
			if {
				condition = all {
					eq {
						get_attr {"isNode"}
						"true"
					}
					eq {
						get_attr {"shouldRunClusterOnOsType"}
						"true"
					}
				}
				on_true = relation_reference {
					table1_name = "cmdb_ci_win_cluster"
					table2_name = "cmdb_ci_win_server"
					result_table_name = "cluster_win_server"
					unmatched_lines = remove
					condition = is_not_empty {get_attr {"cmdb_ci_win_cluster[].PartComponent"}}
					relation_type = "Hosted on::Hosts"
					ref_direction = parentToChild
					ref_field_name = ""
				}
				on_false = nop {}
			}
		}
		step {
			name = "Windows - Network"
			ref {refid = "7dc49adadbc12200c06776231f96197d"}
		}
		step {
			name = "Reference and relation between dscy_router_interface to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "dscy_router_interface"
				result_table_name = "router_interface_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Uses::Used by"
				ref_direction = childToParent
				ref_field_name = "cmdb_ci"
			}
		}
		step {
			name = "Reference and relation between dscy_route_interface to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "dscy_route_interface"
				result_table_name = "route_interface_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Uses::Used by"
				ref_direction = childToParent
				ref_field_name = "cmdb_ci"
			}
		}
		step {
			name = "Reference and relation between dscy_route_next_hop to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "dscy_route_next_hop"
				result_table_name = "gateway_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Uses::Used by"
				ref_direction = childToParent
				ref_field_name = "cmdb_ci"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_network_adapter to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_network_adapter"
				result_table_name = "network_adapter_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Owns::Owned by"
				ref_direction = childToParent
				ref_field_name = "cmdb_ci"
			}
		}
		step {
			name = "Relation between cmdb_ci_ip_address to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_ip_address"
				result_table_name = "ip_win_server"
				unmatched_lines = remove
				condition = contains {
					"1"
					"1"
				}
				relation_type = "Owns::Owned by"
				ref_direction = parentToChild
				ref_field_name = ""
			}
		}
		step {
			name = "Set server's default gateway"
			comment = "Find the first NIC with default route, and set this route in the main CI"
			transform {
				src_table_name = "cmdb_ci_win_server"
				target_table_name = "cmdb_ci_win_server"
				operation {set_field {
						field_name = "default_gateway"
						value = concat {eval {"javascript:
var rtrn = '';
var networkAdaptersTable = ${ValidNetworkAdapters};
var networkAdapter;
var networkAdapterGateway;
if(networkAdaptersTable){
for(var i = 0; i < networkAdaptersTable.size(); i++)
{
networkAdapter = networkAdaptersTable.get(i);
networkAdapterGateway = networkAdapter.get(\"DefaultIPGateway\");
if(networkAdapterGateway)
{
rtrn = networkAdapterGateway;
break;
}
}
}
"}}
					}}
			}
		}
		step {
			name = "DNS"
			ref {refid = "ede27fe5db652200868a7c841f961984"}
		}
		step {
			name = "Windows - Storage"
			ref {refid = "87e5921edbc12200c06776231f96190a"}
		}
		step {
			name = "Insert total disk space of the server"
			comment = "Sum all disks size for total disk space"
			set_attr {
				"cmdb_ci_win_server[*].disk_space"
				concat {eval {"javascript:
var rtrn = '';
var disksSizeColumn = ${PhysicalDisks[*].Size};
//disksSize = disksSize + \"\";
//disksSize = JSON.parse(disksSize);
//var total = 0;
var totalDiskSize = 0;
//if (disksSize instanceof Array) {
 //for (var i=0; i < disksSize.length; i++) {
for (var i=0; i < disksSizeColumn.size(); i++) {
   //total += disksSize[i];
totalDiskSize += disksSizeColumn.get(i) / (1073741824);
 }
//}
//rtrn = (total / (1073741824)) | 0;
//rtrn = (totalDiskSize / (1073741824)) | 0;
rtrn = totalDiskSize;
"}}
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_disk to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_disk"
				result_table_name = "disk_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_storage_device to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_storage_device"
				result_table_name = "storage_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_fc_disk to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_fc_disk"
				result_table_name = "fc_disk_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_iscsi_disk to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_iscsi_disk"
				result_table_name = "iscsi_disk_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_disk_partition to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_disk_partition"
				result_table_name = "partition_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_storage_hba and cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_storage_hba"
				result_table_name = "hba_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Owns::Owned by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_fc_port to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_fc_port"
				result_table_name = "fc_port_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Owns::Owned by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_nas_file_system to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_nas_file_system"
				result_table_name = "nas_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Reference and relation between cmdb_ci_file_system to cmdb_ci_win_server"
			relation_reference {
				table1_name = "cmdb_ci_win_server"
				table2_name = "cmdb_ci_file_system"
				result_table_name = "file_system_win_server"
				unmatched_lines = remove
				condition = eq {
					"1"
					"1"
				}
				relation_type = "Contains::Contained by"
				ref_direction = childToParent
				ref_field_name = "computer"
			}
		}
		step {
			name = "Insert data to cmdb_ci_hyper_v_server"
			comment = "NameForCluster used for matching hyper-v cluster"
			if {
				condition = eq {
					get_attr {"isHyperV"}
					"true"
				}
				on_true = transform {
					src_table_name = "cmdb_ci_win_server"
					target_table_name = "cmdb_ci_hyper_v_server"
					operation {
						set_field {
							field_name = "name"
							value = get_attr {"cmdb_ci_win_server[].name"}
						}
						set_field {
							field_name = "os_service_pack"
							value = get_attr {"cmdb_ci_win_server[].os_service_pack"}
						}
						set_field {
							field_name = "manufacturer"
							value = get_attr {"cmdb_ci_win_server[].manufacturer"}
						}
						set_field {
							field_name = "model_id"
							value = get_attr {"cmdb_ci_win_server[].model_id"}
						}
						set_field {
							field_name = "short_description"
							value = get_attr {"cmdb_ci_win_server[].short_description"}
						}
						set_field {
							field_name = "os_address_width"
							value = get_attr {"cmdb_ci_win_server[].os_address_width"}
						}
						set_field {
							field_name = "os"
							value = get_attr {"cmdb_ci_win_server[].os"}
						}
						set_field {
							field_name = "host_name"
							value = get_attr {"cmdb_ci_win_server[].host_name"}
						}
						set_field {
							field_name = "ip_address"
							value = get_attr {"cmdb_ci_win_server[].ip_address"}
						}
						set_field {
							field_name = "chassis_type"
							value = get_attr {"cmdb_ci_win_server[].chassis_type"}
						}
						set_field {
							field_name = "os_version"
							value = get_attr {"cmdb_ci_win_server[].os_version"}
						}
						set_field {
							field_name = "assigned_to"
							value = get_attr {"cmdb_ci_win_server[].assigned_to"}
						}
						set_field {
							field_name = "virtual"
							value = "true"
						}
						set_field {
							field_name = "NameForCluster"
							value = eval {"javascript:var rtrn = '';rtrn = WindowsDiscoveryUtil.extractFirstMatchWithRegex(${cmdb_ci_win_server[].name},/([^\\.]*)\\.?.*/);"}
						}
					}
				}
				on_false = nop {}
			}
		}
		step {
			name = "Windows - Hyper-V"
			ref {refid = "4386161edbc12200c06776231f961939"}
		}
		step {
			name = "Reference and relation between cmdb_ci_hyper_v_server and cmdb_ci_win_server"
			if {
				condition = eq {
					get_attr {"isHyperV"}
					"true"
				}
				on_true = relation_reference {
					table1_name = "cmdb_ci_hyper_v_server"
					table2_name = "cmdb_ci_win_server"
					result_table_name = "hyper_v_win_server"
					unmatched_lines = remove
					condition = eq {
						"1"
						"1"
					}
					relation_type = "Runs on::Runs"
					ref_direction = parentToChild
					ref_field_name = "windows_host"
				}
				on_false = nop {}
			}
		}
		step {
			name = "Windows - Cloud"
			ref {refid = "b65be7cedb093200c12ef9361d9619f3"}
		}
		step {
			name = "If AWS, set AWS object_id on host"
			if {
				condition = all {
					eq {
						get_attr {"shouldDiscoverAmazon"}
						"true"
					}
					eq {
						get_attr {"isEc2"}
						"true"
					}
					is_not_empty {get_attr {"awsData[*].instance_id"}}
				}
				on_true = set_attr {
					"cmdb_ci_win_server[*].object_id"
					get_attr {"awsData[1].instance_id"}
				}
				on_false = nop {}
			}
		}
		step {
			name = "If Azure, set Azure object_id on host"
			if {
				condition = all {
					eq {
						get_attr {"isAzure"}
						"true"
					}
					is_not_empty {get_attr {"uuidSerial"}}
					eq {
						get_attr {"shouldDiscoverAzure"}
						"true"
					}
				}
				on_true = set_attr {
					"cmdb_ci_win_server[*].object_id"
					get_attr {"uuidSerial"}
				}
				on_false = nop {}
			}
		}
		step {
			name = "If host discovered by cloud discovery, set it as virtual"
			if {
				condition = any {
					eq {
						get_attr {"isAzure"}
						"true"
					}
					eq {
						get_attr {"isEc2"}
						"true"
					}
				}
				on_true = set_attr {
					"cmdb_ci_win_server[*].virtual"
					"true"
				}
				on_false = nop {}
			}
		}
	}
}
