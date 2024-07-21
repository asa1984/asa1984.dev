mod blog;
pub use blog::*;

use std::sync::Arc;
use worker::D1Database;

pub struct Apps {
    pub blog_app: BlogApp,
}

impl Apps {
    pub fn new(db: D1Database) -> Self {
        let db = Arc::new(db);
        Self {
            blog_app: BlogApp::new(db),
        }
    }
}
