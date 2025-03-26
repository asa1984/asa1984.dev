{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    git-hooks.url = "github:cachix/git-hooks.nix";

    flake-parts.inputs.nixpkgs-lib.follows = "nixpkgs";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
    git-hooks.inputs.nixpkgs.follows = "nixpkgs";
    git-hooks.inputs.flake-compat.follows = "";
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
        let
          ciDeps = with pkgs; [
            nodejs-slim_22
            corepack
            biome
          ];
          devDeps =
            ciDeps
            ++ (with pkgs; [
              sqlite
              act
              actionlint
            ]);
        in
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
            ci = pkgs.buildEnv {
              name = "ci";
              paths = ciDeps;
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

          devShells = rec {
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
