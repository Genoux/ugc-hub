/**
 * Uploads a blob directly to R2 using a presigned PUT URL.
 * Uses XHR to support upload progress. Returns ETag when present (for multipart).
 */
export async function putToR2(
  body: Blob | File,
  uploadUrl: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded, e.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag");
        resolve(etag?.replace(/"/g, ""));
      } else {
        reject(new Error(`R2 upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () =>
      reject(new Error("There was an error uploading your file. Please try again."));

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader(
      "Content-Type",
      body instanceof File ? body.type : "application/octet-stream",
    );
    xhr.send(body);
  });
}
