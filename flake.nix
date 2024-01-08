{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import inputs.nixpkgs {inherit system;};
      dev-deps = with pkgs; [
        nodejs-slim_20
        bun
        nodePackages.pnpm
        nodePackages.wrangler
        nodePackages.vercel
        biome
        sqlite
      ];
      ci-deps = with pkgs; [
        nodejs-slim_20
        nodePackages.pnpm
        nodePackages.wrangler
      ];
      scripts = with pkgs; [
        (writeScriptBin "install" ''
          ${nodePackages.pnpm}/bin/pnpm install
        '')
        (writeScriptBin "build" ''
          ${nodePackages.pnpm}/bin/pnpm run gen
          ${nodePackages.pnpm}/bin/pnpm run build
        '')
        (writeScriptBin "migrate" ''
          ${nodePackages.pnpm}/bin/pnpm run migrate:prod
        '')
      ];
    in {
      devShells = rec {
        default = dev;
        dev = pkgs.mkShell {
          packages = dev-deps;
        };
        ci = pkgs.mkShell {
          packages = ci-deps ++ scripts;
        };
      };
      packages = rec {
        default = cli;
        cli = pkgs.rustPlatform.buildRustPackage {
          name = "cli";
          src = ./packages/cli;
          cargoLock = {lockFile = ./packages/cli/Cargo.lock;};
        };

        # Scripts
        install = with pkgs;
          writescriptbin "install" ''
            ${nodepackages.pnpm}/bin/pnpm install --frozen-lockfile
          '';
        build = with pkgs;
          writeScriptBin "build" ''
            ${nodePackages.pnpm}/bin/pnpm run gen
            ${nodePackages.pnpm}/bin/pnpm run build
          '';
      };
    });
}
