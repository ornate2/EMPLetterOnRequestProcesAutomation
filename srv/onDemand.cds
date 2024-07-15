using asianpaints.sf.ondemand as ondemand from '../db/data-model';
using { ECWorkflow as external } from './external/ECWorkflow';

@requires : 'authenticated-user'


service ondemandService {

    entity SigningAuthority as projection on ondemand.SigningAuthority;
    entity CompanyAddress as projection on ondemand.CompanyAddress;

    entity EmployeeRequest as projection on ondemand.EmployeeRequest;
    //entity RequestDetails as projection on ondemand.RequestDetails;
    //entity Approvers as projection on ondemand.Approvers;

    type Bonafide {
        EmpCode                     : String;
        CompanyCode                 : String;
        LetterTemplate              : String;
        LetterDate                  : String;
        Title                       : String;
        FullName                    : String;
        DateOfJoining               : String;
        FirstName                   : String;
        Designation                 : String;
        Location                    : String;
        Division                    : String;
        Content                     : String;
        SigningAuthorityName        : String;
        SigningAuthorityDesignation : String;
    }

    type pdfFile {
        fileName    : String;
        fileContent : String;
    }

    action reviewBonafidePDF(bonafide : Bonafide, xdpTemplate : String) returns array of pdfFile;

    type CTCComponent {
        Component : String;
        PerMonth  : String;
        PerAnnum  : String;
    }

    type CTC {
        EmpCode                     : String;
        CompanyCode                 : String;
        LetterTemplate              : String;
        LetterDate                  : String;
        Title                       : String;
        FullName                    : String;
        DateOfJoining               : String;
        FirstName                   : String;
        Designation                 : String;
        Location                    : String;
        Division                    : String;
        FinancialYear               : String;
        RequestPurpose              : String;
        IssuePurpose                : String;
        Content                     : String;
        SigningAuthorityName        : String;
        SigningAuthorityDesignation : String;
        CTCComponents               : array of CTCComponent;
    }

    action reviewCTCPDF(ctc : CTC, xdpTemplate : String) returns array of pdfFile;

    @readonly
    define entity SF_ELC: ondemand.ELCWorkflow{};
    entity ELCWorkflow as projection on ondemand.ELCWorkflow;
    //function dumpSFWorkflow() returns String;
    /*type ELC {
        EmpCode                 : String;
        CompanyCode             : String;
        LetterTemplate          : String;
        LetterDate              : String;
        Title                   : String;
        FullName                : String;
        NewFunction             : String;
        NewLocation             : String;
        appointment_letter_date : String;
        probation_period        : String;
        confirmation_date       : String;
        cal_probation_period    : String;
        effective_date          : String;
        new_paygrade            : String;
        new_designation         : String;
        revised_basic           : String;
        new_vertical            : String;
        new_department          : String;
        SigningAuthorityEmail   : String;
    }*/

    action previewELCPDF(wfRequestId:String) returns array of pdfFile;

    function sendELCReleaseNotification() returns  { status: String };
    function holdELCLetter(wfRequestId:String) returns array of { status: String };
    function holdAllELCLetters() returns array of { status: String };
    function releaseAllELCLetters() returns array of { status: String };
    function rejectELCLetter(wfRequestId:String, remarks: String) returns array of { status: String };
    function triggerELCLettersViaScheduler() returns  { status: String };
    action triggerELCLettersManually(wfRequestIds: array of String) returns  { status: String };


    action uploadELCLettersToFileNet(wfRequestIds: array of String) returns { status: String };
    action uploadELCLettersToEP(wfRequestIds: array of String) returns { status: String };
}
