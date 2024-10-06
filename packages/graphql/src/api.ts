export interface RevalidaterInterface {
  url: string;
  token: string;
  revalidateAllBlog: () => Promise<void>;
  revalidateBlog: (slug: string) => Promise<void>;
  revalidateAllContext: () => Promise<void>;
  revalidateContext: (slug: string) => Promise<void>;
}

export class Revalidater implements RevalidaterInterface {
  constructor(
    public url: string,
    public token: string,
  ) {
    this.url = url;
    this.token = token;
  }

  async revalidateAllBlog() {
    await fetch(`${this.url}/api/revalidate/blog`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
  async revalidateBlog(slug: string) {
    await fetch(`${this.url}/api/revalidate/blog/${slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
  async revalidateAllContext() {
    await fetch(`${this.url}/api/revalidate/context`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
  async revalidateContext(slug: string) {
    await fetch(`${this.url}/api/revalidate/context/${slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}
