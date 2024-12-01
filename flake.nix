{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.nixpkgs-stable.follows = "nixpkgs";
    };
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "aarch64-linux" # 64-bit ARM Linux
        "x86_64-linux" # 64-bit x86 Linux
        "aarch64-darwin" # 64-bit ARM macOS
        "x86_64-darwin" # 64-bit x86 macOS
      ];

      imports = [
        inputs.git-hooks.flakeModule
        inputs.treefmt-nix.flakeModule
      ];

      perSystem =
        {
          config,
          pkgs,
          lib,
          system,
          ...
        }:
        {
          packages = rec {
            default = cli;
            cli = pkgs.rustPlatform.buildRustPackage {
              name = "cli";
              src = ./packages/cli;
              cargoLock = {
                lockFile = ./packages/cli/Cargo.lock;
              };
            };
          };

          pre-commit = {
            check.enable = true;
            settings = {
              src = ./.;
              hooks = {
                actionlint.enable = true;
                treefmt.enable = true;
              };
            };
          };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
              rustfmt.enable = true;
              biome.enable = true;
            };
          };

          devShells =
            let
              sharedDeps = with pkgs; [
                nodejs-slim_22
                corepack
                biome
              ];
              devDeps =
                sharedDeps
                ++ (with pkgs; [
                  sqlite
                  act
                  actionlint
                ]);
              ciDeps = sharedDeps;
            in
            rec {
              default = dev;
              dev = pkgs.mkShell {
                packages = devDeps;
                shellHook = config.pre-commit.installationScript;
              };
              ci = pkgs.mkShell {
                packages = ciDeps;
              };
            };
        };
    };
}
