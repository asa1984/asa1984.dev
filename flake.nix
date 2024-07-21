{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    workers-rs = {
      url = "github:cloudflare/workers-rs";
      flake = false;
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      fenix,
      workers-rs,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        fenixPkgs = fenix.packages.${system};
        rustToolchain = (
          fenixPkgs.combine [
            fenixPkgs.stable.toolchain
            fenixPkgs.targets.wasm32-unknown-unknown.stable.rust-std
          ]
        );
        pkgs = nixpkgs.legacyPackages.${system};

        worker-build = pkgs.callPackage ./nix/worker-build.nix {
          inherit rustToolchain;
          src = workers-rs;
        };

        devPackages =
          [
            self.packages.${system}.worker-build
            (fenixPkgs.combine [
              fenixPkgs.stable.toolchain
              fenixPkgs.targets.wasm32-unknown-unknown.stable.rust-std
            ])
          ]
          ++ (with pkgs; [
            nodejs-slim_20
            nodePackages.pnpm
            nodePackages.wrangler
            biome
          ]);

        ciPackages = with pkgs; [
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
          (writeScriptBin "deploy" ''
            ${nodePackages.pnpm}/bin/pnpm run deploy
          '')
        ];
      in
      {
        devShells = rec {
          default = dev;
          dev = pkgs.mkShell { packages = devPackages; };
          ci = pkgs.mkShell { packages = ciPackages ++ scripts; };
        };

        packages = rec {
          default = cli;
          cli = pkgs.rustPlatform.buildRustPackage {
            name = "cli";
            src = ./packages/cli;
            cargoLock = {
              lockFile = ./packages/cli/Cargo.lock;
            };
          };
          inherit worker-build;

          # Scripts
          install =
            with pkgs;
            writescriptbin "install" ''
              ${nodepackages.pnpm}/bin/pnpm install
            '';
          build =
            with pkgs;
            writeScriptBin "build" ''
              ${nodePackages.pnpm}/bin/pnpm run gen
              ${nodePackages.pnpm}/bin/pnpm run build
            '';
        };
      }
    );
}
