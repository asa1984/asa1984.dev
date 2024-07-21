use std::sync::Arc;

use async_trait::async_trait;
use trashbox_domain::model::{
    blog::{
        Blog, CreateBlog, DatabaseResult, DeleteBlog, EditBlog, GetBlog, ValidatedBlogCreation,
        ValidatedBlogEditting,
    },
    simple_types::Slug,
};
use worker::D1Database;

pub struct BlogApp {
    db: Arc<D1Database>,
}

impl BlogApp {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl GetBlog for BlogApp {
    async fn get_blog_from_db(&self, slug: Slug) -> DatabaseResult<Option<Blog>> {
        todo!()
    }
    async fn get_all_blogs_from_db(&self) -> DatabaseResult<Vec<Blog>> {
        todo!()
    }
}

#[async_trait]
impl CreateBlog for BlogApp {
    async fn insert_blog_to_db(&self, blog: ValidatedBlogCreation) -> DatabaseResult<()> {
        todo!()
    }
}

#[async_trait]
impl EditBlog for BlogApp {
    async fn update_blog_in_db(&self, blog: ValidatedBlogEditting) -> DatabaseResult<()> {
        todo!()
    }
}

#[async_trait]
impl DeleteBlog for BlogApp {
    async fn delete_blog_in_db(&self, slug: Slug) -> DatabaseResult<()> {
        todo!()
    }
}
