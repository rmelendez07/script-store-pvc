import path from "path";
import fs from "fs";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
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
import { userQuestion } from "../utils/ui";

//const BASE_DIR = 'C:/Users/rmelendez/Desktop/Test PVC';

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
  baseDir: string
): Promise<void> => {
  try {
    const accountKey = process.env.ACCOUNT_KEY;
    const accountName = process.env.ACCOUNT_NAME;
    const storageURL = `https://${accountName}.file.core.windows.net`;

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const serviceClient = new ShareServiceClient(storageURL, credential);

    await iteratePVC(baseDir, serviceClient);

  } catch (error: unknown) {
    printError((error as Error).message, (error as Error).stack);
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

  printInformation(`Downloading file called ${fileName} in path ${downloadPath}`);
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
