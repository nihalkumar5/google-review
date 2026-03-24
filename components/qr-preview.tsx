"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrPreviewProps = {
  url: string;
  label: string;
  downloadName: string;
  downloadLabel?: string;
  compact?: boolean;
};

export function QrPreview({
  url,
  label,
  downloadName,
  downloadLabel = "Download QR",
  compact = false
}: QrPreviewProps) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let isActive = true;

    QRCode.toDataURL(url, {
      width: compact ? 180 : 320,
      margin: 1,
      color: {
        dark: "#13110f",
        light: "#f7f2e8"
      }
    }).then((result) => {
      if (isActive) {
        setDataUrl(result);
      }
    });

    return () => {
      isActive = false;
    };
  }, [compact, url]);

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-black/5 bg-[var(--color-paper)] p-4 ${
        compact ? "w-[140px]" : "w-full max-w-[280px]"
      }`}
    >
      {dataUrl ? (
        <>
          <Image
            src={dataUrl}
            alt={`QR code for ${label}`}
            width={compact ? 180 : 320}
            height={compact ? 180 : 320}
            className="h-auto w-full rounded-2xl"
            unoptimized
          />
          <a
            href={dataUrl}
            download={`${downloadName}.png`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            {downloadLabel}
          </a>
        </>
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-black/10 bg-black/5 text-sm text-black/50">
          Generating...
        </div>
      )}
    </div>
  );
}
