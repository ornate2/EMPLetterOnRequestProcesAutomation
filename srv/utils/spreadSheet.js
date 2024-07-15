const writeXlsxFile = require('write-excel-file/node');

const elcSchema = [
    {
        column: 'Emp Code',
        type: String,
        value: elc => elc.empCode
    },
    {
        column: 'Title',
        type: String,
        value: elc => elc.title
    },
    {
        column: 'Full Name',
        type: String,
        value: elc => elc.fullName
    },
    {
        column: 'Event Reason',
        type: String,
        value: elc => elc.eventReason
    },
    {
        column: 'Effective Date',
        type: String,
        value: elc => elc.effectiveDate
    }
]


async function generateELCSpreadSheet(elcWorkflows) {
    let sheet = await writeXlsxFile(elcWorkflows, { schema: elcSchema, buffer: true });
    return sheet;
}

module.exports = {
    generateELCSpreadSheet
}