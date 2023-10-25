import with_export_images from "next-export-optimize-images";

/** @type {import('next').NextConfig} */
const next_config = {
  output: "export",
  experimental: {
    scrollRestoration: true,
  },
};

export default with_export_images(next_config);
