use async_graphql::{InputObject, Object};
use trashbox_domain::model::blog::{
    CreateBlog, DeleteBlog, EditBlog, UnvalidatedBlogCreation, UnvalidatedBlogEditting,
};
use url::Url;

use crate::router::RouterState;

#[derive(InputObject, Debug)]
struct CreateBlogInput {
    pub slug: String,
    pub title: String,
    pub image: Url,
    pub description: String,
    pub content: String,
    pub published: bool,
}

impl TryFrom<CreateBlogInput> for UnvalidatedBlogCreation {
    type Error = anyhow::Error;

    fn try_from(input: CreateBlogInput) -> Result<Self, Self::Error> {
        Ok(Self {
            slug: input.slug,
            title: input.title,
            image: input.image,
            description: input.description,
            content: input.content,
            published: input.published,
        })
    }
}

#[derive(InputObject, Debug)]
struct UpdateBlogInput {
    pub slug: String,
    pub title: Option<String>,
    pub image: Option<Url>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub published: Option<bool>,
}

impl TryFrom<UpdateBlogInput> for UnvalidatedBlogEditting {
    type Error = anyhow::Error;

    fn try_from(input: UpdateBlogInput) -> Result<Self, Self::Error> {
        Ok(Self {
            slug: input.slug,
            title: input.title,
            image: input.image,
            description: input.description,
            content: input.content,
            published: input.published,
        })
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn create_blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        input: CreateBlogInput,
    ) -> async_graphql::Result<String> {
        let RouterState { apps, .. } = ctx.data()?;
        apps.blog_app.create_blog(input.try_into()?).await?;
        todo!()
    }

    async fn update_blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        input: UpdateBlogInput,
    ) -> async_graphql::Result<String> {
        let RouterState { apps, .. } = ctx.data()?;
        apps.blog_app.edit_blog(input.try_into()?).await?;
        todo!()
    }
    async fn delete_blog(
        &self,
        ctx: &async_graphql::Context<'_>,
        #[graphql(desc = "slug of the blog")] slug: String,
    ) -> async_graphql::Result<String> {
        let RouterState { apps, .. } = ctx.data()?;
        apps.blog_app.delete_blog(&slug).await?;
        todo!()
    }
}
