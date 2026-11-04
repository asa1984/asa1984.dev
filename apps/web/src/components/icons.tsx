import type { ComponentProps } from "react";
import { BiInfoCircle, BiPen } from "react-icons/bi";
import { MdKeyboardArrowDown, MdKeyboardArrowLeft } from "react-icons/md";
import {
  SiGithub,
  SiNixos,
  SiReact,
  SiRust,
  SiScrapbox,
  SiTypescript,
  SiX,
  SiZenn,
} from "react-icons/si";

export const IconGitHub = (props: ComponentProps<typeof SiGithub>) => <SiGithub {...props} />;
export const IconNixOS = (props: ComponentProps<typeof SiNixos>) => <SiNixos {...props} />;
export const IconScrapbox = (props: ComponentProps<typeof SiScrapbox>) => <SiScrapbox {...props} />;
export const IconX = (props: ComponentProps<typeof SiX>) => <SiX {...props} />;
export const IconZenn = (props: ComponentProps<typeof SiZenn>) => <SiZenn {...props} />;
export const IconRust = (props: ComponentProps<typeof SiRust>) => <SiRust {...props} />;
export const IconTypescript = (props: ComponentProps<typeof SiTypescript>) => (
  <SiTypescript {...props} />
);
export const IconReact = (props: ComponentProps<typeof SiReact>) => <SiReact {...props} />;
export const IconInfo = (props: ComponentProps<typeof BiInfoCircle>) => <BiInfoCircle {...props} />;
export const IconPen = (props: ComponentProps<typeof BiPen>) => <BiPen {...props} />;
export const IconArrowDown = (props: ComponentProps<typeof MdKeyboardArrowDown>) => (
  <MdKeyboardArrowDown {...props} />
);
export const IconArrowLeft = (props: ComponentProps<typeof MdKeyboardArrowLeft>) => (
  <MdKeyboardArrowLeft {...props} />
);
