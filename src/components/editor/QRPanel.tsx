"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { CheckIcon, CopyIcon, DownloadIcon } from "@/components/icons";
import type { EditorMenu } from "./types";

export default function QRPanel({ menu, url }: { menu: EditorMenu; url: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function downloadPNG() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${menu.slug}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadSVG() {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `${menu.slug}-qr.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="label-eyebrow">QR Code</div>
      <h2 className="text-2xl font-semibold tracking-tighter2">Your menu is ready to share</h2>
      <p className="mt-1 text-sm text-muted">
        Print the QR, copy the link, or scan it now to open <span className="text-fg">{menu.name}</span>.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="card-elevated rounded-2xl p-6">
          <div
            ref={canvasRef}
            className="overflow-hidden rounded-xl bg-white p-4"
            style={{ width: 248, height: 248 }}
          >
            <QRCodeCanvas value={url} size={216} includeMargin={false} level="M" />
          </div>
          <div ref={svgRef} className="hidden">
            <QRCodeSVG value={url} size={216} includeMargin={false} level="M" />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div>
            <div className="label-eyebrow">Public URL</div>
            <div className="mt-1.5 flex gap-2">
              <input
                value={url}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                className="input font-mono text-xs"
              />
              <button onClick={copy} className="btn-secondary shrink-0" title="Copy link">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={downloadPNG} className="btn-primary">
              <DownloadIcon /> Download PNG
            </button>
            <button onClick={downloadSVG} className="btn-secondary">
              <DownloadIcon /> Download SVG
            </button>
            <a href={url} target="_blank" rel="noreferrer" className="btn-ghost">
              Open menu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
