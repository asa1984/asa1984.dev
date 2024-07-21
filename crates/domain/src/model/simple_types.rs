use anyhow::anyhow;

use super::error::ValidationError;

/// A id for article kind. Constrained to be non-empty and only alphanumeric characters, dashes, and underscores.
pub struct Slug(pub String);

/// A title. Constrained to be non-empty.
pub struct Title(pub String);

impl TryFrom<&str> for Slug {
    type Error = ValidationError;

    fn try_from(slug: &str) -> Result<Self, Self::Error> {
        if slug.is_empty()
            || slug
                .chars()
                .any(|c| c.is_whitespace() || !(c.is_ascii_alphanumeric() || c == '-' || c == '_'))
        {
            return Err(ValidationError(anyhow!("Invalid slug")));
        }
        Ok(Self(slug.to_string()))
    }
}

impl TryFrom<String> for Slug {
    type Error = ValidationError;

    fn try_from(slug: String) -> Result<Self, Self::Error> {
        slug.as_str().try_into()
    }
}

impl TryFrom<&str> for Title {
    type Error = ValidationError;

    fn try_from(title: &str) -> Result<Self, Self::Error> {
        if title.is_empty() {
            return Err(ValidationError(anyhow!("Title is empty")));
        }
        Ok(Self(title.to_string()))
    }
}

impl TryFrom<String> for Title {
    type Error = ValidationError;

    fn try_from(title: String) -> Result<Self, Self::Error> {
        title.as_str().try_into()
    }
}
