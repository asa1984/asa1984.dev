#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "schema/schema.graphql",
    query_path = "src/upsert_blog.graphql",
    variables_derives = "Debug",
    response_derives = "Debug",
    normalization = "rust"
)]
pub struct UpsertBlog;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "schema/schema.graphql",
    query_path = "src/get_blogs.graphql",
    variables_derives = "Debug",
    response_derives = "Debug",
    normalization = "rust"
)]
pub struct GetBlogs;

use anyhow::Result;
use get_blogs::GetBlogsBlogs;
use graphql_client::{reqwest::post_graphql_blocking, GraphQLQuery};
use reqwest::blocking::Client;
use reqwest::header;
use upsert_blog::{UpsertBlogInput, UpsertBlogUpsertBlog};

pub struct GQLClient {
    client: Client,
    base_url: String,
}

impl GQLClient {
    pub fn new(server: &str, token: &str) -> Self {
        let base_url = format!("{}/graphql", server);

        let bearer_token = format!("Bearer {}", token);
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "Authorization",
            header::HeaderValue::from_str(&bearer_token).unwrap(),
        );
        let client = Client::builder().default_headers(headers).build().unwrap();
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub fn get_blogs(&self) -> Result<Vec<GetBlogsBlogs>> {
        let query = get_blogs::Variables {};
        let response =
            post_graphql_blocking::<GetBlogs, _>(&self.client, self.base_url.as_str(), query)?;
        let blogs = response
            .data
            .ok_or(anyhow::Error::msg("Missing response"))?
            .blogs;
        Ok(blogs)
    }

    pub fn upsert_blog(&self, blog: UpsertBlogInput) -> Result<UpsertBlogUpsertBlog> {
        let query = upsert_blog::Variables { blog };
        let response =
            post_graphql_blocking::<UpsertBlog, _>(&self.client, self.base_url.as_str(), query)?;
        let blog = response
            .data
            .ok_or(anyhow::Error::msg("Missing response"))?
            .upsert_blog;
        Ok(blog)
    }
}
