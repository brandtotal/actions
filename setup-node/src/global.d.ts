declare module "@pkgjs/nv" {
  interface NvmVersion {
    version: string;
    major: number;
    minor: number;
    patch: number;
    codename: string;
    versionName: string;
    start: Date;
    lts: Date;
    maintenance: Date;
    end: Date;
  }

  function nv(alias?: string, opts?: object): Promise<NvmVersion[]>;

  export = nv;
}
