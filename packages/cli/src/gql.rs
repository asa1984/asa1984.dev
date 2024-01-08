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

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "schema/schema.graphql",
    query_path = "src/upsert_context.graphql",
    variables_derives = "Debug",
    response_derives = "Debug",
    normalization = "rust"
)]
pub struct UpsertContext;

use anyhow::Result;
use get_blogs::GetBlogsBlogs;
use graphql_client::{reqwest::post_graphql_blocking, GraphQLQuery};
use reqwest::blocking::Client;
use reqwest::header::{self, HeaderMap, HeaderValue};
use upsert_blog::{UpsertBlogInput, UpsertBlogUpsertBlog};
use upsert_context::{UpsertContextInput, UpsertContextUpsertContext};

pub struct GQLClient {
    client: Client,
    base_url: String,
}

impl GQLClient {
    pub fn new(server: &str, token: &str) -> Result<Self> {
        let base_url = format!("{}/graphql", server);

        let mut headers = HeaderMap::new();
        let token = HeaderValue::try_from(format!("Bearer {}", token))?;
        headers.insert(header::AUTHORIZATION, token);
        let client = Client::builder().default_headers(headers).build()?;
        Ok(Self { client, base_url })
    }

    #[allow(dead_code)]
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

    pub fn upsert_context(
        &self,
        context: UpsertContextInput,
    ) -> Result<UpsertContextUpsertContext> {
        let query = upsert_context::Variables { context };
        let response =
            post_graphql_blocking::<UpsertContext, _>(&self.client, self.base_url.as_str(), query)?;
        let context = response
            .data
            .ok_or(anyhow::Error::msg("Missing response"))?
            .upsert_context;
        Ok(context)
    }
}
