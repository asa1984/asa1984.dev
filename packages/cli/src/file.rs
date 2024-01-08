use anyhow::Result;
use serde::Deserialize;
use std::{
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
};

use crate::gql::upsert_blog::UpsertBlogInput;
use crate::gql::upsert_context::UpsertContextInput;

const BLOG_FRONTMATTER_TEMPLATE: &str = r#"---
title: 
image: 
description: 
published: false
---
"#;

const CONTEXT_FRONTMATTER_TEMPLATE: &str = r#"---
title: 
emoji: 
published: false
---
"#;

const BLOG_PATH: &str = "blog";
const CONTEXT_PATH: &str = "context";

pub fn create_empty_blog(slug: &str) -> Result<()> {
    // /blog
    let blog_path = Path::new(BLOG_PATH);
    if !blog_path.exists() {
        fs::create_dir(&blog_path)?;
    }
    // /blog/{slug}
    let parent_path = blog_path.join(slug);
    if !parent_path.exists() {
        fs::create_dir(&parent_path)?;
    }
    // /blog/{slug}/post.md
    let path = parent_path.join("post.md");
    if path.exists() {
        anyhow::bail!("Blog \"{}\" already exists", slug);
    }
    let mut file = File::create(path)?;
    file.write_all(BLOG_FRONTMATTER_TEMPLATE.as_bytes())?;

    Ok(())
}

pub fn create_empty_context(slug: &str) -> Result<()> {
    // /context
    let context_path = Path::new("context");
    if !context_path.exists() {
        fs::create_dir(&context_path)?;
    }
    // /context/{slug}
    let parent_path = context_path.join(slug);
    if !parent_path.exists() {
        fs::create_dir(&parent_path)?;
    }
    // /context/{slug}/post.md
    let path = parent_path.join("post.md");
    if path.exists() {
        anyhow::bail!("Context \"{}\" already exists", slug);
    }
    let mut file = File::create(path)?;
    file.write_all(CONTEXT_FRONTMATTER_TEMPLATE.as_bytes())?;

    Ok(())
}

#[derive(Debug)]
pub struct BlogContent {
    pub post: UpsertBlogInput,
    pub images: Vec<PathBuf>,
}

pub fn get_blog_content_by_slug(slug: &str) -> Result<BlogContent> {
    let blog_dir = Path::new(BLOG_PATH);
    let parent_path = blog_dir.join(slug);
    let path = parent_path.join("post.md");
    if !path.exists() {
        anyhow::bail!("Blog \"{}\" does not exist", slug);
    }
    let post = parse_blog(slug)?;
    let mut images = vec![];
    for entry in fs::read_dir(parent_path)? {
        let path = entry?.path();
        if path.is_file() {
            images.push(path);
        }
    }
    Ok(BlogContent { post, images })
}

pub fn get_all_blog_contents() -> Result<Vec<BlogContent>> {
    let blog_dir = Path::new(BLOG_PATH);
    let mut contents = vec![];
    for entry in fs::read_dir(blog_dir)? {
        let path = entry?.path();
        if path.is_dir() {
            let slug = path.file_name().unwrap().to_str().unwrap();
            contents.push(get_blog_content_by_slug(slug)?);
        }
    }
    Ok(contents)
}

#[derive(Deserialize, Debug)]
struct BlogFrontmatter {
    title: String,
    image: String,
    description: String,
    published: bool,
}

pub fn parse_blog(slug: &str) -> Result<UpsertBlogInput> {
    use fronma::{error::Error, parser::parse};

    let path = format!("{}/{}/post.md", BLOG_PATH, slug);
    let source = fs::read_to_string(path)?;
    let parsed = parse::<BlogFrontmatter>(&source).map_err(|err| match err {
        Error::MissingBeginningLine => anyhow::Error::msg("Missing beginning `---`"),
        Error::MissingEndingLine => anyhow::Error::msg("Missing ending `---`"),
        Error::SerdeYaml(err) => anyhow::Error::msg(err.to_string()),
    })?;

    let frontmatter = parsed.headers;
    let content = parsed.body.to_owned();
    validate_upsert_blog_input(UpsertBlogInput {
        slug: slug.to_string(),
        title: frontmatter.title,
        image: frontmatter.image,
        description: frontmatter.description,
        published: frontmatter.published,
        content,
    })
}

fn validate_upsert_blog_input(upsert_blog_input: UpsertBlogInput) -> Result<UpsertBlogInput> {
    if upsert_blog_input.slug.is_empty() {
        anyhow::bail!("`slug` cannot be empty");
    }
    if upsert_blog_input.title.is_empty() {
        anyhow::bail!("`title` cannot be empty");
    }
    if upsert_blog_input.image.is_empty() {
        anyhow::bail!("`image` cannot be empty");
    }
    if upsert_blog_input.description.is_empty() {
        anyhow::bail!("`description` cannot be empty");
    }

    let path = format!(
        "{}/{}/{}",
        BLOG_PATH, upsert_blog_input.slug, upsert_blog_input.image
    );
    let path = Path::new(&path);
    if !path.exists() {
        anyhow::bail!("Image \"{}\" does not exist", upsert_blog_input.image);
    }
    Ok(upsert_blog_input)
}

#[derive(Debug)]
pub struct ContextContent {
    pub post: UpsertContextInput,
    pub images: Vec<PathBuf>,
}

pub fn get_context_content_by_slug(slug: &str) -> Result<ContextContent> {
    let context_dir = Path::new("context");
    let parent_path = context_dir.join(slug);
    let path = parent_path.join("post.md");
    if !path.exists() {
        anyhow::bail!("Context \"{}\" does not exist", slug);
    }
    let post = parse_context(slug)?;
    let mut images = vec![];
    for entry in fs::read_dir(parent_path)? {
        let path = entry?.path();
        if path.is_file() {
            images.push(path);
        }
    }
    Ok(ContextContent { post, images })
}

pub fn get_all_context_contents() -> Result<Vec<ContextContent>> {
    let context_dir = Path::new("context");
    let mut contents = vec![];
    for entry in fs::read_dir(context_dir)? {
        let path = entry?.path();
        if path.is_dir() {
            let slug = path.file_name().unwrap().to_str().unwrap();
            contents.push(get_context_content_by_slug(slug)?);
        }
    }
    Ok(contents)
}

#[derive(Deserialize, Debug)]
struct ContextFrontmatter {
    title: String,
    emoji: String,
    published: bool,
}

pub fn parse_context(slug: &str) -> Result<UpsertContextInput> {
    use fronma::{error::Error, parser::parse};

    let path = format!("{}/{}/post.md", CONTEXT_PATH, slug);
    let source = fs::read_to_string(path)?;
    let parsed = parse::<ContextFrontmatter>(&source).map_err(|err| match err {
        Error::MissingBeginningLine => anyhow::Error::msg("Missing beginning `---`"),
        Error::MissingEndingLine => anyhow::Error::msg("Missing ending `---`"),
        Error::SerdeYaml(err) => anyhow::Error::msg(err.to_string()),
    })?;

    let frontmatter = parsed.headers;
    let content = parsed.body.to_owned();
    validate_upsert_context_input(UpsertContextInput {
        slug: slug.to_string(),
        title: frontmatter.title,
        emoji: frontmatter.emoji,
        published: frontmatter.published,
        content,
    })
}

fn validate_upsert_context_input(
    upsert_context_input: UpsertContextInput,
) -> Result<UpsertContextInput> {
    if upsert_context_input.slug.is_empty() {
        anyhow::bail!("`slug` cannot be empty");
    }
    if upsert_context_input.title.is_empty() {
        anyhow::bail!("`title` cannot be empty");
    }
    if upsert_context_input.emoji.is_empty() {
        anyhow::bail!("`emoji` cannot be empty");
    }
    Ok(upsert_context_input)
}
