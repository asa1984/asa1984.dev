use anyhow::Result;
use reqwest::blocking::Client;
use reqwest::header::{self, HeaderMap, HeaderValue};
use std::fs::File;

#[derive(Debug)]
pub struct RestClient {
    client: Client,
    base_url: String,
}

impl RestClient {
    pub fn new(base_url: &str, token: &str) -> Result<Self> {
        let token = HeaderValue::try_from(format!("Bearer {}", token))?;
        let mut headers = HeaderMap::new();
        headers.insert(header::AUTHORIZATION, token);
        let client = Client::builder().default_headers(headers).build()?;

        Ok(Self {
            client,
            base_url: base_url.to_string(),
        })
    }

    pub fn upload_image(&self, key: &str, file: File) -> Result<()> {
        let url = format!("{}/api/image/upload/{}", self.base_url, key);

        let response = self.client.post(url).body(file).send()?;
        if response.status().is_success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to upload image"))
        }
    }
}
