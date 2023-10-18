// import { css } from "@/styled-system/css";
// import Image from "next/image";
//
// export type LinkCardProps = {
//   title: string;
//   href: string;
//   description?: string;
//   image_href?: string;
// };
//
// const container_style = css({
//   display: "block",
//   padding: 4,
//   width: "full",
//   border: "3px solid",
//   borderRadius: "xl",
//   transitionDuration: "0.2s",
//   transitionTimingFunction: "ease-out",
//   backgroundColor: {
//     base: "white",
//     _hover: "gray.200",
//   },
// });
//
// const title_style = css({
//   fontSize: "4xl",
//   fontWeight: "bold",
// });
//
// const description_style = css({
//   marginTop: 2,
//   fontSize: "lg",
//   fontWeight: "semibold",
//   color: "gray.600",
// });
//
// export const LinkCard = ({
//   title,
//   href,
//   description,
//   image_href,
// }: LinkCardProps) => {
//   return (
//     <a
//       href={href}
//       className={container_style}
//       target="_blank"
//       rel="noopener noreferrer"
//     >
//       <div>
//         <div className={title_style}>{title}</div>
//         <div className={description_style}>{description}</div>
//       </div>
//       {image_href && (
//         <Image src={image_href} alt={title} width={400} height={200} />
//       )}
//     </a>
//   );
// };
