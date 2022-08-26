import { downloadFromAzureStorage } from "./src/azure-storage-file-share/download-file-share";
import { userQuestion } from "./src/utils/ui";
require("dotenv").config();

userQuestion(
  "Write the full path to donwload all the PVC of the environment",
  downloadFromAzureStorage
);
