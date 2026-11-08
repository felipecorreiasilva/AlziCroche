import EfiPay from 'sdk-node-apis-efi';
import path from 'path';

const isSandbox = process.env.EFI_SANDBOX === 'true';

// Seleciona o arquivo do certificado dinamicamente
const certificateFileName = isSandbox 
  ? 'homologacao-562088-AlziCroche.p12' 
  : 'producao-562088-AlziCroche.p12';

const options = {
  sandbox: isSandbox,
  client_id: process.env.EFI_CLIENT_ID || '',
  client_secret: process.env.EFI_CLIENT_SECRET || '',
  // Aponta para a pasta certs na raiz do servidor
  certificate: path.resolve(__dirname, '../../certs', certificateFileName),
};

const efi = new EfiPay(options);

export default efi;