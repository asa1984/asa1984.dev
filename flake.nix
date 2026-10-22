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
            nodejs-slim_26
            corepack
            actionlint
            zizmor
            cocogitto
          ];
          devDeps =
            sharedDeps
            ++ (with pkgs; [
              sqlite
              act
            ]);
          ciDeps = sharedDeps;
        in
        {
          # CI installs this closure with `nix profile add .#ci` instead of using the devShell,
          # so that steps do not evaluate `nix develop` each time.
          packages.ci = pkgs.buildEnv {
            name = "ci-tools";
            paths = ciDeps;
            # nodejs-slim and corepack both provide bin/corepack. Prefer the first one
            # (nodejs-slim), as mkShell does.
            ignoreCollisions = true;
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
