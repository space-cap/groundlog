/**
 * 클라이언트 단 모바일 사진 자동 압축 유틸리티
 * - 스마트폰 고화질 원본(5~25MB)을 최대 1600px, JPEG 80% 품질로 리사이징
 * - 안드로이드 카메라 직촬영 시 file.type이 ""이거나 application/octet-stream인 경우도 완벽 대응
 * - Vercel(4.5MB) 및 Server Action 본문 한도 초과 원천 차단
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8,
): Promise<File> {
  // GIF, SVG는 원본 유지
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // 200KB 이하의 이미 작은 파일은 이미지가 확실한 경우에만 스킵
  if (file.size <= 200 * 1024 && file.type.startsWith("image/")) {
    return file;
  }

  // 안드로이드 카메라 직촬영 시 file.type이 비어있거나 octet-stream인 경우가 많음
  // 이미지 처리를 위해 MIME 타입을 image/jpeg로 보정한 File 생성
  let workingFile = file;
  if (!file.type || !file.type.startsWith("image/")) {
    workingFile = new File([file], file.name || "camera_photo.jpg", {
      type: "image/jpeg",
      lastModified: file.lastModified || Date.now(),
    });
  }

  let objectUrlToRevoke: string | null = null;

  try {
    let width = 0;
    let height = 0;
    let source: ImageBitmap | HTMLImageElement | null = null;

    // 1. createImageBitmap 시도 (모바일 표준, EXIF 회전 지원)
    let bitmapLoaded = false;
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(workingFile);
        width = bitmap.width;
        height = bitmap.height;
        source = bitmap;
        bitmapLoaded = true;
      } catch (err) {
        console.warn("createImageBitmap 실패, Image 객체로 대체 시도:", err);
      }
    }

    // 2. createImageBitmap 실패 시 fallback (HTMLImageElement)
    if (!bitmapLoaded) {
      const { img, url } = await loadImageElement(workingFile);
      objectUrlToRevoke = url;
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      source = img;
    }

    if (!source || width === 0 || height === 0) {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      return file;
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
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      return file;
    }

    // 고품질 스무딩
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, width, height);

    if ("close" in source && typeof source.close === "function") {
      source.close();
    }
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
      objectUrlToRevoke = null;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    // 안전한 파일명 생성 (.jpg 보장)
    const rawName = file.name || "photo.jpg";
    const dotIndex = rawName.lastIndexOf(".");
    const baseName = dotIndex > 0 ? rawName.substring(0, dotIndex) : rawName;
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (err) {
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
    }
    console.error("이미지 자동 압축 중 예외 발생:", err);
    return file;
  }
}

function loadImageElement(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ img, url });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
