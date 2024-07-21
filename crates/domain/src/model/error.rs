#[derive(thiserror::Error, Debug)]
#[error(transparent)]
pub struct ValidationError(#[from] pub anyhow::Error);

#[derive(thiserror::Error, Debug)]
#[error(transparent)]
pub struct DatabaseError(#[from] pub anyhow::Error);

#[derive(thiserror::Error, Debug)]
pub enum BlogServiceError {
    #[error("validation error: {0}")]
    Validation(#[from] ValidationError),
    #[error("database error: {0}")]
    Database(#[from] DatabaseError),
}
