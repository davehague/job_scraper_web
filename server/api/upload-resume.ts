import { defineEventHandler, readMultipartFormData, createError } from "h3";
import type { H3Event } from "h3";
import { ImageAnnotatorClient, protos } from "@google-cloud/vision";
import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY || "", "base64").toString()
);

const visionClient = new ImageAnnotatorClient({
  credentials: credential,
});

const storage = new Storage({
  credentials: credential,
});

const bucketName = "job-scout";
const outputPrefix = "output";

async function uploadFileToGCS(filePath: string): Promise<string> {
  const destination = `pdfs/${path.basename(filePath)}`;
  await storage.bucket(bucketName).upload(filePath, { destination });
  return `gs://${bucketName}/${destination}`;
}

async function extractTextFromJson(jsonUri: string): Promise<string> {
  const [content] = await storage
    .bucket(bucketName)
    .file(jsonUri.replace(`gs://${bucketName}/`, ""))
    .download();
  const json = JSON.parse(content.toString());
  return json.responses[0].fullTextAnnotation.text;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const form = await readMultipartFormData(event);
    if (!form) {
      throw createError({
        statusCode: 400,
        statusMessage: "No file uploaded",
      });
    }

    const pdfFiles = form.filter(
      (part) => part.name === "pdfs" && part.filename
    );
    if (pdfFiles.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No PDF files found in the upload",
      });
    }

    const fileUploadPromises = pdfFiles.map(async (file) => {
      const tempPath = `/tmp/${file.filename}`;
      await fs.promises.writeFile(tempPath, file.data);
      const gcsUri = await uploadFileToGCS(tempPath);
      await fs.promises.unlink(tempPath);
      return gcsUri;
    });

    const fileUris = await Promise.all(fileUploadPromises);

    console.log("Files uploaded to GCS:", fileUris);

    const uniqueId = uuidv4();
    const requests: protos.google.cloud.vision.v1.IAsyncAnnotateFileRequest[] =
      fileUris.map((fileUri) => ({
        inputConfig: {
          mimeType: "application/pdf",
          gcsSource: { uri: fileUri },
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" as const }],
        outputConfig: {
          gcsDestination: {
            uri: `gs://${bucketName}/${outputPrefix}/${uniqueId}/`,
          },
          batchSize: 1,
        },
      }));

    const [operation] = await visionClient.asyncBatchAnnotateFiles({
      requests,
    });
    const [filesResponse] = await operation.promise();

    if (
      !filesResponse ||
      !filesResponse.responses ||
      filesResponse.responses.length === 0
    ) {
      throw createError({
        statusCode: 500,
        statusMessage: "No response received from OCR operation.",
      });
    }

    const firstResponse = filesResponse.responses[0];
    if (
      !firstResponse.outputConfig ||
      !firstResponse.outputConfig.gcsDestination
    ) {
      throw createError({
        statusCode: 500,
        statusMessage: "Output configuration missing in response.",
      });
    }

    const destinationUri = firstResponse.outputConfig.gcsDestination.uri;
    console.log("Json saved to: " + destinationUri);

    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: `${outputPrefix}/${uniqueId}/`,
    });
    console.log("Files found in output:", files);

    const textPromises = files.map((file) =>
      extractTextFromJson(`gs://${bucketName}/${file.name}`)
    );
    const texts = await Promise.all(textPromises);
    console.log("Text extracted from files:", texts);

    const fullText = texts.join("\n\n--- Page Break ---\n\n");

    await Promise.all(files.map((file) => file.delete()));
    console.log("Files deleted from output:", files);

    return {
      message: "File processed successfully",
      text: fullText,
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "An error occurred while processing your request.",
    });
  }
});
