{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import inputs.nixpkgs {inherit system;};
      craneLib = inputs.crane.lib.${system};
      dev-deps = with pkgs; [
        nodejs-slim_20
        bun
        nodePackages.pnpm
        nodePackages.wrangler
        biome
        sqlite
      ];
    in {
      devShell = pkgs.mkShell {
        packages = dev-deps;
      };
      packages = {
        cli = craneLib.buildPackage {
          src = craneLib.cleanCargoSource (craneLib.path ./packages/cli);
        };

        default = pkgs.rustPlatform.buildRustPackage {
          name = "cli";

          src = ./packages/cli;

          cargoLock = {lockFile = ./packages/cli/Cargo.lock;};
        };
      };
    });
}
