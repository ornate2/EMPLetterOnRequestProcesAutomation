namespace asianpaints.sf.ondemand;

using {
  Currency,
  managed,
  sap.common.CodeList
} from '@sap/cds/common';


entity EmployeeRequest : managed {
  key ID            : UUID @(Core.Computed : true);
      purpose       : String;
      details       : String;
      RequestStatus : Integer default 0;
      Type          : String;
}

entity CompanyAddress : managed {
    key CompanyCode : String;
        CompanyName : String;
        Address1    : String;
        Address2    : String;
        Address3    : String;
        Address4    : String;
        Telephone1  : String;
        Telephone2  : String;
        Website     : String;
        FooterImage : LargeBinary;
        TemplateGroup: String;
        @Core.MediaType: mediaType
        Logo         : LargeBinary;
        @Core.IsMediaType: true
        mediaType    : String;
        url          : String;
}

entity TemplateMaster : managed {
  key TemplateCode : Int16;
      EventReason  : String;
      CompanyCode  : String;
      Description  : String;
      MailSubject  : String;
      MailBody     : String;
}

entity TemplateParagraph : managed {
    TemplateCode : Association to TemplateMaster;
    ParagraphNo  : String(2);
    Text         : String;
}

entity ELCExclusions : managed {
    key CompanyCode: String(8);
    key PayGrade: String(25);
}

entity ELCPromoExclusions : managed {
    key CompanyCode: String(8);
    key PayGrade: String(25);
}

entity SigningAuthority {
    key CompanyCode : String;
    key SignGrp : String;
    LoginId : String;
    Name    : String;
    @Core.MediaType: mediaType
    sign : LargeBinary ;
    @Core.IsMediaType: true
    mediaType : String;
    url: String;
    designation: String;
}

entity ELCWorkflow : managed {
  key wfRequestId      : Int64;
      empCode          : String(255);
      title            : String(255);
      fullName         : String(255);
      email            : String(255);
      lastModifiedOn   : Date;
      empWfRequestId   : Int64;
      eventReason      : String(255);
      eventReasonDescription : String(255);
      subjectId        : String(255);
      effectiveDate    : Date;
      company          : String(255);
      appointmentDate  : String(255);
      confirmationDate : String(255);
      payGrade         : String(255);
      revisedBasic     : String(255);
      IsManager : Boolean;
      LetterTemplate    : Int16;
      LetterTemplateDescription: String(255);
      HREmail: String(255);
      SignGrp: String(15);
      //SigningAuthEmail: String(255);
      CommunicationStatus: String(255) default 'PENDING';
      CommunicationRemarks: String;
      IsFileNetUploaded:  Boolean default false;
      IsEPUploaded: Boolean default false;
      FileNetResponse: LargeString;
      EPResponse: LargeString;
      MailResponse: LargeString;
}

/*
entity RequestDetails : managed {
  key ID                : UUID @(Core.Computed : true);
      EmployeeRequestID : Association to EmployeeRequest;
      
      letterContent     : String;
      generatedPDF      : LargeBinary;
}

entity Approvers : managed {
  key ID                : UUID @(Core.Computed : true);
      EmployeeRequestID : Association to EmployeeRequest;
      Level             : Integer default 0;
      Designation       : String;
      Name              : String;
      EmployeeID        : String;
      Email             : String;
      Status            : Integer default 0;
};
*/