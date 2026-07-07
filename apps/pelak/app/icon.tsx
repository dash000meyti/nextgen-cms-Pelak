import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import { headers } from "next/headers";
import { ImageResponse } from "next/og";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Icon() {
  const siteConfig = await getSiteConfig();
  const rawLogoUrl = siteConfig.logo?.trim() || "/images/hokmran-logo.svg";
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";
  const logoUrl = rawLogoUrl.startsWith("http")
    ? rawLogoUrl
    : new URL(rawLogoUrl, baseUrl).toString();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <svg
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <title>Site logo</title>
        <image
          href={logoUrl}
          x="0"
          y="0"
          width="256"
          height="256"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </div>,
    size,
  );
}
