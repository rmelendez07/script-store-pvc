import path from "path";
import * as archiver from "archiver";
import { printSuccess } from "./print-information";
import fs from "fs";

export async function archiveFolder(
  folderToArchive: string,
  targetFilePath: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const targetZipPath = targetFilePath;
    const writeStream = fs.createWriteStream(targetZipPath);
    const archive = archiver.create("zip");
    try {
      writeStream.on("error", (error) => {
        reject(error.message);
      });

      archive.on("error", (error) => {
        reject(error.message);
      });

      writeStream.on("close", () => {
        resolve(targetZipPath);
      });

      archive.pipe(writeStream);

      fs.readdirSync(folderToArchive).forEach((element) => {
        const elementPath = path.resolve(folderToArchive, element);
        if (
          fs.statSync(elementPath).isFile() &&
          !path.extname(elementPath).includes("zip")
        ) {
          archive.file(elementPath, { name: element });
        } else if (fs.statSync(elementPath).isDirectory()) {
          archive.directory(elementPath, element);
        }
      });
    } finally {
      archive.finalize();
    }
  });
}

export const zipPVCDirectory = async (
  baseDir: string,
  PVCPath: string
): Promise<string> => {
  const fileName = `${path.basename(PVCPath)}.zip`;
  const archivePath = await archiveFolder(
    PVCPath,
    path.join(baseDir, fileName)
  );
  printSuccess(`Zipped successfully, the zip file was called: ${fileName}`);

  fs.rmSync(PVCPath, { recursive: true });

  return archivePath;
};
