use async_trait::async_trait;
use chrono::{DateTime, Utc};
use url::Url;

use super::error::{BlogServiceError, DatabaseError, ValidationError};
use super::simple_types::{Slug, Title};

pub type DatabaseResult<T> = Result<T, DatabaseError>;
pub type ValidationResult<T> = Result<T, ValidationError>;
pub type BlogServiceResult<T> = Result<T, BlogServiceError>;

/// Blog
pub struct Blog {
    /// entitiy id
    pub slug: Slug,
    pub title: Title,
    pub image: Url,
    pub description: String,
    pub content: String,
    pub published: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[async_trait]
pub trait GetBlog {
    async fn get_blog_from_db(&self, slug: Slug) -> DatabaseResult<Option<Blog>>;

    async fn get_all_blogs_from_db(&self) -> DatabaseResult<Vec<Blog>>;

    async fn get_blog(&self, slug: &str) -> BlogServiceResult<Option<Blog>> {
        let slug = Slug::try_from(slug)?;
        self.get_blog_from_db(slug)
            .await
            .map_err(BlogServiceError::Database)
    }

    async fn get_all_blogs(&self) -> BlogServiceResult<Vec<Blog>> {
        self.get_all_blogs_from_db()
            .await
            .map_err(BlogServiceError::Database)
    }
}

/// Unvalidated blog creation
pub struct UnvalidatedBlogCreation {
    /// entitiy id
    pub slug: String,
    pub title: String,
    pub image: Url,
    pub description: String,
    pub content: String,
    pub published: bool,
}

/// Validated blog creation
pub struct ValidatedBlogCreation {
    /// entitiy id
    pub slug: Slug,
    pub title: Title,
    pub image: Url,
    pub description: String,
    pub content: String,
    pub published: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[async_trait]
pub trait CreateBlog {
    async fn validate_blog_creation(
        &self,
        created: UnvalidatedBlogCreation,
    ) -> ValidationResult<ValidatedBlogCreation> {
        let UnvalidatedBlogCreation {
            slug,
            title,
            image,
            description,
            content,
            published,
        } = created;
        let slug = Slug::try_from(slug)?;
        let title = Title::try_from(title)?;
        let created_at = Utc::now();

        Ok(ValidatedBlogCreation {
            slug,
            title,
            image,
            description,
            content,
            published,
            created_at,
            updated_at: created_at,
        })
    }

    async fn insert_blog_to_db(&self, created: ValidatedBlogCreation) -> DatabaseResult<()>;

    async fn create_blog(&self, created: UnvalidatedBlogCreation) -> BlogServiceResult<()> {
        let validated_blog_creation = self.validate_blog_creation(created).await?;
        self.insert_blog_to_db(validated_blog_creation)
            .await
            .map_err(BlogServiceError::Database)
    }
}

impl TryFrom<UnvalidatedBlogCreation> for ValidatedBlogCreation {
    type Error = BlogServiceError;

    fn try_from(value: UnvalidatedBlogCreation) -> Result<Self, Self::Error> {
        let UnvalidatedBlogCreation {
            slug,
            title,
            image,
            description,
            content,
            published,
        } = value;
        let slug = Slug::try_from(slug)?;
        let title = Title::try_from(title)?;
        let created_at = Utc::now();

        Ok(Self {
            slug,
            title,
            image,
            description,
            content,
            published,
            created_at,
            updated_at: created_at,
        })
    }
}

/// Unvalidated blog update
pub struct UnvalidatedBlogEditting {
    /// entitiy id
    pub slug: String,
    pub title: Option<String>,
    pub image: Option<Url>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub published: Option<bool>,
}

/// Validated blog update
pub struct ValidatedBlogEditting {
    /// entitiy id
    pub slug: Slug,
    pub title: Option<Title>,
    pub image: Option<Url>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub published: Option<bool>,
    pub updated_at: DateTime<Utc>,
}

#[async_trait]
pub trait EditBlog {
    fn validate_blog_editting(
        &self,
        updated: UnvalidatedBlogEditting,
    ) -> ValidationResult<ValidatedBlogEditting> {
        let UnvalidatedBlogEditting {
            slug,
            title,
            image,
            description,
            content,
            published,
        } = updated;
        let slug = Slug::try_from(slug)?;
        let title = title.map(Title::try_from).transpose()?;
        let updated_at = Utc::now();

        Ok(ValidatedBlogEditting {
            slug,
            title,
            image,
            description,
            content,
            published,
            updated_at,
        })
    }

    async fn update_blog_in_db(&self, updated: ValidatedBlogEditting) -> DatabaseResult<()>;

    async fn edit_blog(&self, updated: UnvalidatedBlogEditting) -> BlogServiceResult<()> {
        let validated_blog_update = self.validate_blog_editting(updated)?;
        self.update_blog_in_db(validated_blog_update)
            .await
            .map_err(BlogServiceError::Database)
    }
}

#[async_trait]
pub trait DeleteBlog {
    async fn delete_blog_in_db(&self, slug: Slug) -> DatabaseResult<()>;

    async fn delete_blog(&self, slug: &str) -> BlogServiceResult<()> {
        let slug = Slug::try_from(slug)?;
        self.delete_blog_in_db(slug)
            .await
            .map_err(BlogServiceError::Database)
    }
}
