export function downloadBlob(
  data: Uint8Array,
  fileName: string,
  mimeType: string
) {
  let blob = new Blob([data], {
    type: mimeType
  });
  let url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
}

export function downloadURL(data: string, fileName: string) {
  const link = document.createElement("a");
  link.href = data;
  link.download = fileName;
  document.body.appendChild(link);
  link.style.display = "none";
  link.click();
  link.remove();
}
