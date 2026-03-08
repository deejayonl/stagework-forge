export class ValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateString(value: any, fieldName: string, required = true): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ValidationError(`Field '${fieldName}' is required and cannot be empty.`);
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`Field '${fieldName}' must be a string.`);
  }
  return value;
}

export function validateArray(value: any, fieldName: string, required = true): any[] | undefined {
  if (value === undefined || value === null) {
    if (required) throw new ValidationError(`Field '${fieldName}' is required.`);
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new ValidationError(`Field '${fieldName}' must be an array.`);
  }
  return value;
}
