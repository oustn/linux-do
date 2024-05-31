export class Runtime {
  private static instance?: Runtime

  static async getInstance(): Promise<Runtime> {
    if (!this.instance) {
      this.instance = new Runtime()
    }
    return this.instance
  }
}
