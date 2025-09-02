declare module "essentia.js" {
  // This is an example. You'll need to replace these with the actual
  // types and functions you use from the essentia.js library.
  export class Essentia {
    constructor(extractor: any);
    static Meyda: any;
    compute(input: Float32Array, options?: any): any;
    // Add other methods you use here
  }

  export function EssentiaWASM(wasmUrl: string): Promise<any>;
}
