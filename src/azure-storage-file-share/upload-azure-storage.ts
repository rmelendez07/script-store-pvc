import urljoin from "url-join";
import { DefaultAzureCredential } from "@azure/identity";
import { printInformation, printSuccess } from "../utils/print-information";
import {
  BlobServiceClient,
  ContainerClient,
  ContainerSASPermissions,
  ContainerSASPermissionsLike,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

const generateUploadUrl = async (
  permissions: ContainerSASPermissionsLike = {
    create: true,
    write: true,
    read: true,
  }
): Promise<string> => {
  const containerName = process.env.CONTAINER_NAME;
  const account = process.env.AZ_STORAGE_ACCOUNT_NAME;

  if (!account) {
    throw new Error("Storage account name is not provided!");
  }

  const storageURL = `https://${account}.blob.core.windows.net`;
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(storageURL, credential);

  const containerClient = blobServiceClient.getContainerClient(containerName);

  const containerExists = await containerClient.exists();
  if (!containerExists) {
    const createContainerResponse = await containerClient.create();

    if (createContainerResponse.errorCode) {
      throw new Error("Could not create Azure Storage container");
    }
  }

  const sasTTL = 24 * 3600 * 1000;
  const startDate = new Date(new Date().valueOf() - 5 * 60 * 1000);
  const expireDate = new Date(new Date().valueOf() + sasTTL);

  const userDelegationKey = await blobServiceClient.getUserDelegationKey(
    startDate,
    expireDate
  );
  const containerSAS = generateBlobSASQueryParameters(
    {
      containerName: containerClient.containerName,
      permissions: ContainerSASPermissions.from(permissions),
      startsOn: startDate,
      expiresOn: expireDate,
    },
    userDelegationKey,
    account
  ).toString();

  return urljoin(storageURL, containerClient.containerName, `?${containerSAS}`);
};

export const uploadPVCToAzureStorage = async (
  blobName: string,
  file: Buffer
): Promise<void> => {
  const uploadUrl = await generateUploadUrl({
    create: false,
    write: true,
    read: false,
  });
  const containerClient = new ContainerClient(uploadUrl);
  if (!containerClient) throw new Error("File not uploaded.");

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  printInformation(`Uploading zip file called as ${blobName}`);
  await blockBlobClient.uploadData(file);
  printSuccess(`Uploaded the zip file successfully called as ${blobName}`);
};
