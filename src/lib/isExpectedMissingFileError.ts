interface BlobReadErrorLike {
  code?: string;
  message?: string;
}

const MISSING_FILE_CODES = new Set(['ENOENT', 'EISDIR', 'ENOTFOUND']);

const hasMissingFileMessage = (message?: string): boolean => {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes('no such file') ||
    normalized.includes('could not be opened') ||
    normalized.includes('not found')
  );
};

const isExpectedMissingFileError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') {
    return false;
  }

  const candidate = err as BlobReadErrorLike;
  if (candidate.code && MISSING_FILE_CODES.has(candidate.code)) {
    return true;
  }

  return hasMissingFileMessage(candidate.message);
};

export default isExpectedMissingFileError;
