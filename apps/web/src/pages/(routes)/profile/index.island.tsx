import { IconNixOS, IconReact, IconRust, IconTypescript } from "#/components/icons.tsx";
import { OgpLinkCard } from "#/features/ogp.ts";
import { css } from "#/styled-system/css";

import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";
import Age from "./_components/age.tsx" with { island: "load" };
import { ProfileCard } from "./_components/profile.tsx";
import { Topic } from "./_components/topic.tsx";
import type { Props } from "./index.server.ts";

const articleStyle = css({
  marginTop: 16,
  marginX: "auto",
  maxWidth: "4xl",
});

const ProfilePage = ({ playlist, renderedAt }: Props) => (
  <RoutesLayout nav={<NavMenu segment="profile" />}>
    <>
      <header
        className={css({
          marginTop: 16,
        })}
      >
        <ProfileCard age={<Age renderedAt={renderedAt} />} />
      </header>
      <article className={articleStyle}>
        <Topic
          content={
            <>
              <h2>Tech</h2>
              <h3>Love</h3>
              <p>Nix / NixOS</p>
              <h3>Likes & Learning</h3>
              <p>TypeScript, React (Next.js), Rust</p>
              <h3>Just Interested</h3>
              <p>Type System, WASM</p>
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
          cardDirection="right"
        />

        <Topic
          content={
            <>
              <h2>Env</h2>
              <ul>
                <li>Distro: NixOS</li>
                <li>Desktop: Hyprland</li>
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
              <img
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
          cardDirection="left"
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
                <OgpLinkCard {...playlist} />
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
              <img
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

              <img
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
          cardDirection="right"
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
                  <em>Kal&apos;tsit</em>
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
          cardDirection="left"
        />
      </article>
    </>
  </RoutesLayout>
);

export default ProfilePage;
