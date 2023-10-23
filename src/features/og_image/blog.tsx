import { ImageResponse } from "next/server";
import { get_post } from "@/features/blog";

export async function BlogOGPImage({ params }: { params: { slug: string } }) {
  const { meta } = await get_post(params.slug);
  // const noto_sans_jp = fetch(
  //   new URL("./noto_sans_jp.woff2", import.meta.url),
  // ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          backgroundColor: "#f2f2f2",
          display: "grid",
          placeItems: "center",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div
          style={{
            border: "2px solid #222",
            borderTop: "4rem",
          }}
        >
          {meta.title}
        </div>
      </div>
    ),
    {
      // fonts: [
      //   {
      //     name: "Noto Sans JP",
      //     data: await noto_sans_jp,
      //     style: "normal",
      //     weight: 900,
      //   },
      // ],
      width: 1280,
      height: 720,
    },
  );
}
