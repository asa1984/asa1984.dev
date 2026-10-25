import type { ComponentProps } from "react";
import { BiCopy, BiInfoCircle, BiPen } from "react-icons/bi";
import { MdKeyboardArrowDown, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  SiDiscord,
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
export const IconDiscord = (props: ComponentProps<typeof SiDiscord>) => <SiDiscord {...props} />;
export const IconCopy = (props: ComponentProps<typeof BiCopy>) => <BiCopy {...props} />;
export const IconInfo = (props: ComponentProps<typeof BiInfoCircle>) => <BiInfoCircle {...props} />;
export const IconPen = (props: ComponentProps<typeof BiPen>) => <BiPen {...props} />;
export const IconArrowDown = (props: ComponentProps<typeof MdKeyboardArrowDown>) => (
  <MdKeyboardArrowDown {...props} />
);
export const IconArrowRight = (props: ComponentProps<typeof MdKeyboardArrowRight>) => (
  <MdKeyboardArrowRight {...props} />
);
export const IconArrowLeft = (props: ComponentProps<typeof MdKeyboardArrowLeft>) => (
  <MdKeyboardArrowLeft {...props} />
);
