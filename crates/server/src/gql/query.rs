use async_graphql::{Object, SimpleObject};
use chrono::{DateTime, Utc};
use trashbox_domain::model::blog::{Blog, GetBlog};
use url::Url;

use crate::router::RouterState;

#[derive(SimpleObject)]
struct BlogObject {
    slug: String,
    title: String,
    image: Url,
    description: String,
    content: String,
    published: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<Blog> for BlogObject {
    fn from(blog: Blog) -> Self {
        Self {
            slug: blog.slug.0,
            title: blog.title.0,
            image: blog.image,
            description: blog.description,
            content: blog.content,
            published: blog.published,
            created_at: blog.created_at,
            updated_at: blog.updated_at,
        }
    }
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        #[graphql(desc = "slug of the blog")] slug: String,
    ) -> async_graphql::Result<Option<BlogObject>> {
        let RouterState { apps, .. } = ctx.data()?;
        let blog = apps.blog_app.get_blog(&slug).await?;
        Ok(blog.map(BlogObject::from))
    }

    async fn blogs(
        &self,
        ctx: &async_graphql::Context<'_>,
    ) -> async_graphql::Result<Vec<BlogObject>> {
        let RouterState { apps, .. } = ctx.data()?;
        let blogs = apps.blog_app.get_all_blogs().await?;
        Ok(blogs.into_iter().map(BlogObject::from).collect())
    }
}
