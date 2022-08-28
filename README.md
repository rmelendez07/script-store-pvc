
Steps
==============

1. Type **yarn install**
2. Add the **.env** file
3. Uncomment the content in the env file in the environment you like
3. Open a Comand Line and type the following command
    3.1. **yarn ts-node index.ts**
4. Script will ask you where would you like to store the pvc, type a valid path, example **C:/Users/rmelendez/Desktop/Test PVC** or ENTER and it will do it in a Temp folder


# Important

- Carefull when the script is downloading heavy files, and if the **server/computer** that is running it, **and that has a lot of others proccess running (Browser, Testing project locally, etc), the script could fails**.
- **AKS_PVC_NAMESPACE** environment variable value will be in a comment in the **PBI related with the script**.
- In Azure Storage the PVC will be stored inside the container specified in .env as the following format **{userId}/{projectId}/{pvc-name}**