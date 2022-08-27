import { downloadFromAzureStorage } from "./src/azure-storage-file-share/download-file-share";
import { userQuestion } from "./src/utils/ui";
require("dotenv").config();

userQuestion(
  "\n\nWrite the full path to donwload all the PVC of the environment, just ENTER if you want to download in a Temp folder",
  downloadFromAzureStorage
);
