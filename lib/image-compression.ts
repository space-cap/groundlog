/**
 * 클라이언트 단 모바일 사진 자동 압축 유틸리티
 * - 스마트폰 고화질 원본(5~15MB)을 최대 1600px, JPEG 80% 품질로 리사이징
 * - 용량을 200~400KB로 95% 이상 압축하여 Server Action 페이로드 제한(4.5MB) 및 통신 지연 방지
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8,
): Promise<File> {
  // 이미지가 아니거나 GIF, SVG인 경우 원본 유지
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  // 200KB 이하의 작은 이미지는 굳이 압축하지 않음
  if (file.size <= 200 * 1024) {
    return file;
  }

  try {
    let width = 0;
    let height = 0;
    let source: ImageBitmap | HTMLImageElement;

    // 모바일 브라우저 표준: createImageBitmap (EXIF 회전 자동 처리 지원)
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(file);
        width = bitmap.width;
        height = bitmap.height;
        source = bitmap;
      } catch {
        // createImageBitmap 실패 시 fallback (일부 특이 포맷)
        source = await loadImageElement(file);
        width = source.width;
        height = source.height;
      }
    } else {
      source = await loadImageElement(file);
      width = source.width;
      height = source.height;
    }

    // 축소 비율 계산 (가로세로 비율 유지)
    if (width > maxWidth || height > maxHeight) {
      if (width / height > maxWidth / maxHeight) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    // 고품질 이미지 스무딩 적용
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, width, height);

    if ("close" in source && typeof source.close === "function") {
      source.close(); // ImageBitmap 메모리 해제
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    // 파일 이름 확장자를 .jpg로 정리
    const baseName =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("이미지 자동 압축 실패, 원본 파일 사용:", err);
    return file;
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
