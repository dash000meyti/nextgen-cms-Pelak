import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";

export class PermissionDeniedError extends Error {
  constructor(message = PERMISSION_DENIED) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}
