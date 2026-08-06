import type { Revalidater } from "@asa1984.dev/graphql";

export class FrontendRevalidater implements Revalidater {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async post(path: string) {
    await fetch(`${this.url}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async revalidateAllBlog() {
    await this.post("/api/revalidate/blog");
  }
  async revalidateBlog(slug: string) {
    await this.post(`/api/revalidate/blog/${slug}`);
  }
  async revalidateAllContext() {
    await this.post("/api/revalidate/context");
  }
  async revalidateContext(slug: string) {
    await this.post(`/api/revalidate/context/${slug}`);
  }
}
