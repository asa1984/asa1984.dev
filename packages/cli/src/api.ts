export type RemoteBlog = {
  slug: string;
  title: string;
  image: string;
  description: string;
  content: string;
  published: boolean;
};

export type RemoteContext = {
  slug: string;
  title: string;
  emoji: string;
  content: string;
  published: boolean;
};

export type RemoteImage = {
  key: string;
  etag: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export class BackendClient {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private authHeader(): Record<string, string> {
    return { Authorization: `Bearer ${this.token}` };
  }

  private async gql<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(`${this.url}/graphql`, {
      method: "POST",
      headers: { ...this.authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(
        `GraphQL request failed: ${res.status} ${await res.text()}`,
      );
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors && json.errors.length > 0) {
      throw new Error(
        `GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`,
      );
    }
    if (!json.data) throw new Error("GraphQL response has no data");
    return json.data;
  }

  async blogs(): Promise<RemoteBlog[]> {
    const data = await this.gql<{ blogs: RemoteBlog[] }>(
      "query { blogs { slug title image description content published } }",
      {},
    );
    return data.blogs;
  }

  async contexts(): Promise<RemoteContext[]> {
    const data = await this.gql<{ contexts: RemoteContext[] }>(
      "query { contexts { slug title emoji content published } }",
      {},
    );
    return data.contexts;
  }

  async upsertBlog(input: RemoteBlog): Promise<void> {
    await this.gql(
      "mutation ($input: UpsertBlogInput!) { upsertBlog(input: $input) { slug } }",
      { input },
    );
  }

  async upsertContext(input: RemoteContext): Promise<void> {
    await this.gql(
      "mutation ($input: UpsertContextInput!) { upsertContext(input: $input) { slug } }",
      { input },
    );
  }

  async deleteBlog(slug: string): Promise<void> {
    await this.gql("mutation ($slug: String!) { deleteBlog(slug: $slug) }", {
      slug,
    });
  }

  async deleteContext(slug: string): Promise<void> {
    await this.gql("mutation ($slug: String!) { deleteContext(slug: $slug) }", {
      slug,
    });
  }

  async listImages(): Promise<RemoteImage[]> {
    const res = await fetch(`${this.url}/api/image/list`, {
      headers: this.authHeader(),
    });
    if (!res.ok) {
      throw new Error(
        `Failed to list images: ${res.status} ${await res.text()}`,
      );
    }
    const json = (await res.json()) as { objects: RemoteImage[] };
    return json.objects;
  }

  async uploadImage(
    content: string,
    slug: string,
    file: string,
    body: Uint8Array,
  ): Promise<void> {
    const res = await fetch(
      `${this.url}/api/image/upload/${content}/${encodeURIComponent(slug)}/${encodeURIComponent(file)}`,
      { method: "POST", headers: this.authHeader(), body },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to upload image ${content}/${slug}/${file}: ${res.status}`,
      );
    }
  }

  async deleteImage(key: string): Promise<void> {
    const res = await fetch(`${this.url}/api/image/object/${key}`, {
      method: "DELETE",
      headers: this.authHeader(),
    });
    if (!res.ok) {
      throw new Error(`Failed to delete image ${key}: ${res.status}`);
    }
  }
}
