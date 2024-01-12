import { type Metadata } from "next";
import { css } from "@/styled-system/css";
import Image from "next/image";

import { IconNixOS, IconReact, IconRust, IconTypescript } from "@/components/icons";
import LinkCard from "@/features/ogp";

import Profile from "./_components/Profile";
import Topic from "./_components/Topic";

export const metadata: Metadata = {
  title: "Who are you?",
  description: "About asa1984",
  openGraph: {
    title: "Who are you?",
    description: "About asa1984",
    type: "profile",
  },
};

export default function Page() {
  const article_style = css({
    marginTop: 16,
    marginX: "auto",
    maxWidth: "4xl",
  });

  return (
    <>
      <header
        className={css({
          marginTop: 16,
        })}
      >
        <Profile />
      </header>
      <article className={article_style}>
        <Topic
          content={
            <>
              <h2>Tech</h2>
              <h3>Love</h3>
              <p>Nix / NixOS</p>
              <h3>Likes & Learning</h3>
              <p>TypeScript, React (Next.js), Rust</p>
              <h3>Just Interested</h3>
              <p>Type System, WASM, k8s, Haskell</p>
            </>
          }
          card={
            <div
              className={css({
                display: "grid",
                gridTemplateColumns: "3fr 1fr",
                alignItems: "center",
                justifyItems: "center",
              })}
            >
              <IconNixOS
                className={css({
                  padding: 1,
                  width: "full",
                  height: "full",
                })}
              />
              <div
                className={css({
                  width: "full",
                  height: "full",
                  display: "grid",
                  gridTemplateRows: "repeat(3, 1fr)",
                })}
              >
                <IconTypescript
                  className={css({
                    padding: 1,
                    display: "block",
                    width: "full",
                    height: "full",
                  })}
                />
                <IconReact
                  className={css({
                    padding: 1,
                    display: "block",
                    width: "full",
                    height: "full",
                  })}
                />
                <IconRust
                  className={css({
                    padding: 1,
                    display: "block",
                    width: "full",
                    height: "full",
                  })}
                />
              </div>
            </div>
          }
          card_direction="right"
        />

        <Topic
          content={
            <>
              <h2>Env</h2>
              <ul>
                <li>Distro: NixOS</li>
                <li>Desktop: X11 + XMonad</li>
                <li>Editor: Neovim</li>
                <li>Terminal: WezTerm</li>
              </ul>
              <a
                href="https://github.com/asa1984/dotfiles"
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  display: "inline-block",
                  fontSize: "xl",
                  textDecoration: "underline",
                  _hover: {
                    opacity: 0.8,
                  },
                })}
              >
                View dotfiles →
              </a>
            </>
          }
          card={
            <div
              className={css({
                borderRadius: "xl",
                overflow: "hidden",
                aspectRatio: "4 / 3",
              })}
            >
              <Image
                src="/images/asa1984_desktop.webp"
                alt="Keyboard"
                width={400}
                height={300}
                decoding="async"
                loading="lazy"
                className={css({
                  height: "full",
                  objectFit: "cover",
                })}
              />
            </div>
          }
          card_direction="left"
        />

        <Topic
          content={
            <>
              <h2>Culture</h2>
              <h3>Novel</h3>
              <ul>
                <li>Inherit the Stars | James P. Hogan</li>
                <li>Project Hail Mary | Andy Weir</li>
                <li>Yokohama Station SF | Yuba Isukari</li>
                <li>Genocidal Organ | Project Itoh</li>
                <li>Epilogue | Toh Enjoe</li>
              </ul>
              <h3>Movie</h3>
              <ul>
                <li>Interstellar</li>
                <li>Matrix</li>
                <li>Evangelion</li>
                <li>Shin Godzilla</li>
                <li>RRR</li>
              </ul>
              <h3>Music</h3>
              <div className={css({ mt: 2 })}>
                <LinkCard href="https://open.spotify.com/playlist/4DgSGXp7rK9Tq07PZIc19J" />
              </div>
            </>
          }
          card={
            <div
              className={css({
                borderRadius: "xl",
                aspectRatio: "9 / 16",
                overflow: "hidden",
              })}
            >
              <Image
                src="/images/asa1984_books.webp"
                alt="Books"
                width={400}
                height={700}
                decoding="async"
                loading="lazy"
                className={css({
                  objectFit: "cover",
                  animation: "scroll infinite linear 60s both",
                })}
              />

              <Image
                src="/images/asa1984_books.webp"
                alt="Books"
                width={400}
                height={700}
                decoding="async"
                loading="lazy"
                className={css({
                  objectFit: "cover",
                  animation: "scroll infinite linear 60s both",
                })}
              />
            </div>
          }
          card_direction="right"
        />
        <Topic
          content={
            <>
              <h3>Arknights</h3>
              <ul>
                <li>Epic Story</li>
                <li>Great Music</li>
                <li>Beautiful Artwork</li>
                <li>
                  <em>Kal'tsit</em>
                </li>
              </ul>
            </>
          }
          card={
            <div
              className={css({
                display: "grid",
                placeItems: "center",
              })}
            >
              <div
                className={css({
                  fontSize: "6xl",
                })}
              >
                🫵🏻
              </div>
              <strong
                className={css({
                  marginTop: 4,
                  fontWeight: "extrabold",
                  textAlign: "center",
                })}
              >
                <span
                  className={css({
                    fontSize: "4xl",
                    lineHeight: "0",
                  })}
                >
                  I WANT <span className={css({ color: "red.500" })}>YOU</span>
                </span>
                <br />
                <span
                  className={css({
                    fontSize: "3xl",
                  })}
                >
                  TO PLAY ARKNIGHTS
                </span>
              </strong>
            </div>
          }
          card_direction="left"
        />
      </article>
    </>
  );
}
