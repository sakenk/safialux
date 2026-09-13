"use client";

import Image, { type ImageProps } from "next/image";

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const match = src.match(CLOUDINARY_UPLOAD);
  if (!match) return src;
  const [, prefix, rest] = match;
  return `${prefix}f_auto,q_${quality ?? "auto"},c_limit,w_${width}/${rest}`;
}

/** Cloudinary отдаёт картинки сам (f_auto/q_auto), локальные — через оптимизатор Next. */
export default function SmartImage({ alt, ...props }: ImageProps) {
  const isCloudinary = typeof props.src === "string" && CLOUDINARY_UPLOAD.test(props.src);
  return <Image alt={alt} {...props} loader={isCloudinary ? cloudinaryLoader : undefined} />;
}
