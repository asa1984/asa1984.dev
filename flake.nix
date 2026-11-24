{
  inputs = {
    conceptory.url = "github:asa1984/conceptory";
    flake-parts.follows = "conceptory/flake-parts";
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      # Sets up pkgs, packages.ci, and the devShell. CI installs packages.ci into a Nix profile
      # instead of wrapping each step in `nix develop --command`.
      imports = [ inputs.conceptory.flakeModules.default ];

      systems = [
        "aarch64-linux"
        "x86_64-linux"
        "aarch64-darwin"
      ];

      perSystem =
        { pkgs, ... }:
        {
          conceptory = {
            astGrepRules.enable = false;
            ciPackages = [
              pkgs.nodejs-slim_26
              # pnpm fetches and switches to the version that packageManager in package.json names.
              pkgs.pnpm
            ];
            devPackages = [
              pkgs.sqlite
              pkgs.act
            ];
          };
        };
    };
}
