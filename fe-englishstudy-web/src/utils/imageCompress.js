/**
 * Nén ảnh thành data URL nhỏ gọn bằng canvas.
 * Resize về maxSize x maxSize và chuyển sang JPEG chất lượng thấp.
 * @param {File} file - File ảnh từ input
 * @param {number} maxSize - Kích thước tối đa (px), mặc định 128
 * @param {number} quality - Chất lượng JPEG (0-1), mặc định 0.6
 * @returns {Promise<string>} data URL dạng "data:image/jpeg;base64,..."
 */
export function compressImageToDataUrl(file, maxSize = 128, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Giữ tỉ lệ, resize theo cạnh lớn nhất
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
