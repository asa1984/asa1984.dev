{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    conceptory = {
      url = "github:asa1984/conceptory";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-parts.follows = "flake-parts";
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
            ast-grep
            actionlint
            zizmor
          ];
          devDeps =
            sharedDeps
            ++ (with pkgs; [
              sqlite
              act
            ]);
          ciDeps = sharedDeps;
          astGrepRules = inputs.conceptory.packages.${system}.ast-grep-rules;
        in
        {
          # CI は devShell ではなくこの closure を `nix profile install .#ci` する
          # (ステップごとの `nix develop` 評価をなくすため)。
          packages.ci = pkgs.buildEnv {
            name = "ci-tools";
            paths = ciDeps;
            # nodejs-slim と corepack が両方 bin/corepack を提供する。
            # mkShell と同じく先頭側 (nodejs-slim) を優先する。
            ignoreCollisions = true;
          };

          # CI は devShell の shellHook を実行しないので、`nix build .#ast-grep-rules --out-link` でルールへのリンクを置く。
          packages.ast-grep-rules = astGrepRules;

          devShells = rec {
            default = dev;
            dev = pkgs.mkShell {
              packages = devDeps;
              shellHook = ''
                mkdir -p .conceptory
                ln -sfn ${astGrepRules} .conceptory/ast-grep
              '';
            };
            ci = pkgs.mkShell {
              packages = ciDeps;
            };
          };
        };
    };
}
