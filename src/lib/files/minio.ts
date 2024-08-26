import { env } from "$env/dynamic/private";
import {
  PUBLIC_MINIO_ENDPOINT,
  PUBLIC_MINIO_PORT,
  PUBLIC_MINIO_USE_SSL,
} from "$env/static/public";
import { Client } from "minio";

const minio = new Client({
  endPoint: PUBLIC_MINIO_ENDPOINT || "localhost",
  port: Number.parseInt(PUBLIC_MINIO_PORT || "443", 10),
  useSSL: PUBLIC_MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ROOT_USER || "",
  secretKey: env.MINIO_ROOT_PASSWORD || "",
});

export { CopyConditions } from "minio";
export default minio;
