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
        nodePackages_latest.pnpm
        nodePackages_latest.wrangler
      ];
    in {
      devShell = pkgs.mkShell {
        packages = dev-deps;
      };
    });
}
