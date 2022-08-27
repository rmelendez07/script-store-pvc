import path from "path";
import fs from "fs";
import * as os from "os"
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { zipPVCDirectory } from "../utils/utils";
import { uploadPVCToAzureStorage } from "./upload-azure-storage";
import {
  printSeparator,
  printInformation,
  printSuccess,
  printError,
} from "../utils/print-information";
import {
  ShareServiceClient,
  StorageSharedKeyCredential,
  DirectoryItem,
  FileItem,
  DirectoryListFilesAndDirectoriesSegmentResponse,
  ShareDirectoryClient,
} from "@azure/storage-file-share";

const BASE_DIR = path.join(os.tmpdir(), 'pvc-storage-two');

type FileDirListType = PagedAsyncIterableIterator<
| ({
    kind: "file";
  } & FileItem)
| ({
    kind: "directory";
  } & DirectoryItem),
DirectoryListFilesAndDirectoriesSegmentResponse
>;

export const downloadFromAzureStorage = async (
  baseDir?: string
): Promise<void> => {
  const baseDirPath = baseDir != '' ? baseDir : BASE_DIR;
  
  try {
    const accountKey = process.env.ACCOUNT_KEY;
    const accountName = process.env.ACCOUNT_NAME;
    const storageURL = `https://${accountName}.file.core.windows.net`;

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const serviceClient = new ShareServiceClient(storageURL, credential);

    createFolderIfTemp(baseDirPath)
    await iteratePVC(baseDirPath, serviceClient);

  } catch (error: unknown) {
    printError((error as Error).message, (error as Error).stack);
  } finally {
    if(baseDirPath === BASE_DIR) {
      fs.rmSync(baseDirPath, { recursive: true })
    }
  }
};

const iteratePVC = async (
  baseDir: string,
  serviceClient: ShareServiceClient
): Promise<void> => {

  let shareIter = serviceClient.listShares();
  let i = 1;

  for await (const share of shareIter) {
    printSeparator();
    printInformation(`Share #${i}: ${share.name}`);

    const downloadPath = path.join(baseDir, share.name);
    const directoryClient = serviceClient.getShareClient(
      share.name
    ).rootDirectoryClient;
    const fileDir = directoryClient.listFilesAndDirectories();

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }

    await iterateFilesAndDirectory(downloadPath, directoryClient, fileDir);
    i++;

    const zipFile = await zipPVCDirectory(baseDir, downloadPath)
    await uploadPVCToAzureStorage(share.name, fs.readFileSync(zipFile))
    fs.rmSync(zipFile, { recursive: true })

    printSeparator(false);
  }
  printSuccess(`Total PVC downloaded: ${i}`);
};

const iterateFilesAndDirectory = async (
  downloadPath: string,
  directoryClient: ShareDirectoryClient,
  fileDirList: FileDirListType
): Promise<void> => {
  for await (const fileDir of fileDirList) {
    fileDir.kind === "file"
      ? await downloadFile(fileDir, downloadPath, directoryClient)
      : await downloadDirectory(fileDir, downloadPath, directoryClient);
  }
};

const downloadFile = async (
  file: { kind: "file" } & FileItem,
  downloadPath: string,
  directoryClient: ShareDirectoryClient
) => {
  const fileName = path.join(downloadPath, file.name);

  printInformation(`Downloading file called ${file.name} in path ${fileName}`);
  await directoryClient.getFileClient(file.name).downloadToFile(fileName);
  
  if (fs.existsSync(downloadPath)) {
    printSuccess(`Downloaded successfully the file was called: ${fileName}`);
  } else {
    printError(`Failed while downloading the file was called: ${fileName}`);
  }
};

const downloadDirectory = async (
  directory: { kind: "directory" } & DirectoryItem,
  downloadPath: string,
  directoryClient: ShareDirectoryClient
) => {
  const directoryPathName = path.join(downloadPath, directory.name);
  
  if (!fs.existsSync(directoryPathName)) {
    fs.mkdirSync(directoryPathName);
    printInformation(`Creating directory called ${directory.name} in path ${directoryPathName}`);
  }

  const subDirectoryClient = directoryClient.getDirectoryClient(directory.name);
  const fileDir = subDirectoryClient.listFilesAndDirectories();
  await iterateFilesAndDirectory(
    directoryPathName,
    subDirectoryClient,
    fileDir
  );
};

const createFolderIfTemp = (baseDirPath: string) => {
  if(baseDirPath === BASE_DIR) fs.mkdirSync(baseDirPath)
}