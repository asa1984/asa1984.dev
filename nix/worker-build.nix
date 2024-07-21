{
  src,
  rustToolchain,
  makeRustPlatform,
}:
let
  rustPlatform = makeRustPlatform {
    cargo = rustToolchain;
    rustc = rustToolchain;
  };
in
rustPlatform.buildRustPackage {
  pname = "worker-build";
  version = "0.1.0";

  inherit src;

  cargoLock = {
    lockFile = "${src}/Cargo.lock";
    outputHashes = {
      "psutil-3.2.1" = "sha256-0TaiJ/ZWKYGx7IxttHVrJTe1OB8R80LEZp/dfLBhZAs=";
    };
  };

  buildAndTestSubdir = "worker-build";

  # missing some module upstream to run the tests
  doCheck = false;
}
