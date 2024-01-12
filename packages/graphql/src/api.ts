export interface RevalidaterInterface {
  url: string;
  token: string;
  revalidateAllBlog: () => Promise<void>;
  revalidateBlog: (slug: string) => Promise<void>;
  revalidateAllContext: () => Promise<void>;
  revalidateContext: (slug: string) => Promise<void>;
}

export class Revalidater implements RevalidaterInterface {
  constructor(public url: string, public token: string) {
    this.url = url;
    this.token = token;
  }

  async revalidateAllBlog() {
    await fetch(`${this.url}/api/blog/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
  async revalidateBlog(slug: string) {
    await fetch(`${this.url}/api/blog/revalidate/${slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
  async revalidateAllContext() {
    await fetch(`${this.url}/api/context/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
  async revalidateContext(slug: string) {
    await fetch(`${this.url}/api/context/revalidate/${slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}
