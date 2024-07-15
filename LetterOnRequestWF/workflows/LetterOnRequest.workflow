{
	"contents": {
		"06d033ef-6eb3-465e-a456-4faf21860734": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "com.apl.employee.letteronrequest",
			"subject": "LetterOnRequest",
			"name": "LetterOnRequest",
			"documentation": "Employee Letter on Request",
			"lastIds": "62d7f4ed-4063-4c44-af8b-39050bd44926",
			"events": {
				"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
					"name": "StartEvent1"
				},
				"2798f4e7-bc42-4fad-a248-159095a2f40a": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"4214332d-f9ae-4885-a7a5-480bcbd18785": {
					"name": "Employee request"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"69858106-7b24-44af-8986-7a1b6266d971": {
					"name": "SequenceFlow2"
				}
			},
			"diagrams": {
				"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {}
			}
		},
		"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "StartEvent1"
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"4214332d-f9ae-4885-a7a5-480bcbd18785": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.RequestType} letter request submitted by ${context.RequestData.EmpCode}",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"supportsForward": false,
			"userInterface": "sapui5://EmployeeLetterOnRequest.comsapasianpaintsLetterOnRequestTaskUI/com.sap.asianpaints.LetterOnRequestTaskUI",
			"recipientUsers": "amit.kumar.singh06@sap.com,pushpak.jha@sap.com",
			"id": "usertask1",
			"name": "Employee request"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "4214332d-f9ae-4885-a7a5-480bcbd18785"
		},
		"69858106-7b24-44af-8986-7a1b6266d971": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow2",
			"name": "SequenceFlow2",
			"sourceRef": "4214332d-f9ae-4885-a7a5-480bcbd18785",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"8a7ecc80-92b0-41ad-bec0-e5ebbe320e71": {},
				"15e604a6-55d6-4fa7-9a68-e52b1d25f5bc": {}
			}
		},
		"df898b52-91e1-4778-baad-2ad9a261d30e": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 100,
			"y": 100,
			"width": 32,
			"height": 32,
			"object": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3"
		},
		"53e54950-7757-4161-82c9-afa7e86cff2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 340,
			"y": 100,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "116,116.375 236.24147286593848,116.375",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "8a7ecc80-92b0-41ad-bec0-e5ebbe320e71",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"8a7ecc80-92b0-41ad-bec0-e5ebbe320e71": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 186.24147286593848,
			"y": 86.75,
			"width": 100,
			"height": 60,
			"object": "4214332d-f9ae-4885-a7a5-480bcbd18785"
		},
		"15e604a6-55d6-4fa7-9a68-e52b1d25f5bc": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "236.24147286593848,117.125 357.5,117.125",
			"sourceSymbol": "8a7ecc80-92b0-41ad-bec0-e5ebbe320e71",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "69858106-7b24-44af-8986-7a1b6266d971"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"sequenceflow": 2,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1
		}
	}
}