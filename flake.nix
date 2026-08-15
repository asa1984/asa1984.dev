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
        let
          sharedDeps = with pkgs; [
            nodejs-slim_22
            corepack
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
        {
          # CI は devShell ではなくこの closure を `nix profile install .#ci` する
          # (ステップごとの `nix develop` 評価をなくすため)。
          packages.ci = pkgs.buildEnv {
            name = "ci-tools";
            paths = ciDeps;
          };

          devShells = rec {
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
