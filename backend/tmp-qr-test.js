const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const qrImageService = require('./userapi/services/qrImageService');

(async () => {
  const tmp = path.join(__dirname, 'tmp-qr-test.png');
  await QRCode.toFile(tmp, 'SWS-TEST-12345');
  const res = await qrImageService.extractQRFromImage(tmp);
  console.log(res);
  await fs.promises.unlink(tmp);
})();
