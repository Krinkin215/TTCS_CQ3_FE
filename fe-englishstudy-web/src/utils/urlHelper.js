export function getFullImageUrl(url) {
  if (!url) return null;

  // Lọc blob URL (chỉ hoạt động trong session hiện tại, không load lại được)
  if (url.startsWith('blob:')) return null;

  // Nếu đã là link đầy đủ (Cloudinary, etc.) hoặc data base64 → dùng trực tiếp
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }

  // Các giá trị chỉ là filename đơn giản (seeded data như animals_icon.png)
  // không phải URL hợp lệ → trả về null để fallback
  return null;
}
