const {readFileSync, rmSync, existsSync} = require('fs')
const { jsPDF } = require("jspdf");
const {join} = require("path");
const yaml = require("js-yaml");
const nodemailer = require("nodemailer");
const transliterate = require("cyrillic-to-translit-js");
require('dotenv').config({ path: join(process.cwd(), 'setup', '.env') })
require('./GoogleSans-normal');

const CERT_FILENAME = 'Certificate.pdf'
const mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.mail,
      pass: process.env.mail_pass,
    }
  });

const MAIL_TEXT = readFileSync('./setup/letter.txt', 'utf8');

async function generateCert(name) {
    if (existsSync(CERT_FILENAME)) {
        rmSync(CERT_FILENAME);
    }
    const img = readFileSync('setup/template.jpg');

    var doc = new jsPDF();
    doc.addImage(img,0, 0, 210, 297);

    doc.setFontSize(17);
    doc.setTextColor(136, 136, 136);
    doc.setFont('GoogleSans', 'normal');
    doc.text("DSC HSE NN", (doc.internal.pageSize.width / 2), 65, null, null, 'center');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('GoogleSans', 'normal');
    doc.text("ONLINE MEETUP #5", (doc.internal.pageSize.width / 2), 78.5, null, null, 'center');


    doc.setFontSize(28);
    doc.setTextColor(133, 135, 132);
    doc.setFont('GoogleSans', 'normal');
    doc.text("Dear", (doc.internal.pageSize.width / 2), 145, null, null, 'center');

    doc.setFontSize(36);
    doc.setTextColor(230, 58, 34);
    doc.setFont('GoogleSans', 'normal');
    doc.text(name, (doc.internal.pageSize.width / 2), 160, null, null, 'center');


    doc.setFontSize(16);
    doc.setTextColor(134, 133, 135);
    doc.setFont('GoogleSans', 'normal');
    doc.text("On behalf of DSC Nizhniy Novgorod, we would like \nto personally thank you for your participation in \n\n\nYour activity and enthusiasm helps us to grow \nand shows that the activities of our club are useful.\n\nContinue to be interested in the world of IT. \n\nSincerely,\nDSC HSE NN Team", 35, 170, null, null, 'left');

    doc.setFontSize(18);
    doc.setTextColor(230, 58, 34);
    doc.setFont('GoogleSans', 'normal');
    doc.text("Online Meetup #5 ",  (doc.internal.pageSize.width / 2), 187, null, null, 'center');


    doc.setFontSize(16);
    doc.setTextColor(163, 164, 168);
    doc.setFont('GoogleSans', 'normal');
    doc.text("17/02/2022", (doc.internal.pageSize.width - 27), 245, null, null, 'right');

    doc.save(CERT_FILENAME);
}

function getParticipants() {
    try {
        let fileContents = readFileSync('./setup/participants.yml', 'utf8');
        let data = yaml.load(fileContents);

        return data;
    } catch (e) {
        console.error('Error parsing paricipants: ' + e);

        return null;
    }
}

async function sendCert(address) {
    const mailOptions = {
        from: process.env.mail,
        to: address,
        subject: process.env.subject,
        text: MAIL_TEXT,
        attachments: [{
            filename: CERT_FILENAME,
            path: CERT_FILENAME,
        }]
      };

    try {
        await mail.sendMail(mailOptions);
        console.log('Sent email to ' + address);
    } catch (e) {
        console.error("Error sending email to " + address);
        console.error(e);
    }
}

async function main() {
    const participants = getParticipants();

    for (const {name, mail} of participants) {
        const transliteratedName = transliterate().transform(name);
        await generateCert(transliteratedName);

        await sendCert(mail);
    }
}

main()
