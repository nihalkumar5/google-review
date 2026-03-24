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
  size?: "default" | "compact" | "showcase";
};

export function QrPreview({
  url,
  label,
  downloadName,
  downloadLabel = "Download QR",
  compact = false,
  size = "default"
}: QrPreviewProps) {
  const [dataUrl, setDataUrl] = useState("");
  const resolvedSize = compact ? "compact" : size;
  const qrWidth =
    resolvedSize === "compact" ? 180 : resolvedSize === "showcase" ? 280 : 320;

  useEffect(() => {
    let isActive = true;

    QRCode.toDataURL(url, {
      width: qrWidth,
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
  }, [qrWidth, url]);

  return (
    <div
      className={`overflow-hidden rounded-[28px] border border-black/5 bg-[var(--color-paper)] ${
        resolvedSize === "compact"
          ? "w-[140px] p-4"
          : resolvedSize === "showcase"
            ? "w-full max-w-[312px] p-4 shadow-halo"
            : "w-full max-w-[280px] p-4"
      }`}
    >
      {dataUrl ? (
        <>
          <Image
            src={dataUrl}
            alt={`QR code for ${label}`}
            width={qrWidth}
            height={qrWidth}
            className="h-auto w-full rounded-2xl"
            unoptimized
          />
          {resolvedSize === "showcase" ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                Scan-ready QR
              </p>
              <p className="mt-2 font-display text-lg font-semibold leading-tight text-[var(--color-ink)]">
                {label}
              </p>
            </div>
          ) : null}
          <a
            href={dataUrl}
            download={`${downloadName}.png`}
            className={`mt-3 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-4 font-semibold text-white transition hover:bg-black ${
              resolvedSize === "showcase" ? "py-3 text-sm" : "py-2 text-sm"
            }`}
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
