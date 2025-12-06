{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
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
              };
              ci = pkgs.mkShell {
                packages = ciDeps;
              };
            };
        };
    };
}
