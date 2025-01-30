import { ContentfulStatusCode } from "hono/utils/http-status";

export interface AppwriteErrorException {
  message: string;
  code: ContentfulStatusCode;
  response: {
    message: string;
    code: number;
    type: string;
    version: string;
  };
  type: string;
}
