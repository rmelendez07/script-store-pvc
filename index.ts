import { downloadFromAzureStorage } from "./src/azure-storage-file-share/download-file-share";
//import readline from 'readline'
import { userQuestion } from "./src/utils/ui";
require('dotenv').config()


/*var rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt(`Write the full path to donwload all the PVC of the environment? `);
rl.prompt();
rl.on('line', (path) => {
console.log(`Writting the PVC in: ${path}`);
rl.close();
downloadFromAzureStorage(path)
});*/

userQuestion('Write the full path to donwload all the PVC of the environment', downloadFromAzureStorage)