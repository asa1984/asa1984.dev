mod file;
mod gql;
mod rest;

use ansi_term::Colour;
use clap::{Parser, Subcommand};
use std::{env, fs};

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    subcommands: Subcommands,

    #[arg(short, long = "server", default_value = "https://api.asa1984.dev")]
    server: String,

    #[arg(short, long = "token")]
    token: Option<String>,
}

#[derive(Subcommand, Debug)]
enum Subcommands {
    /// Sync contents
    Sync,

    /// Blog operations
    Blog {
        #[command(subcommand)]
        operation: OperationKind,
    },
}

#[derive(Subcommand, Debug)]
enum OperationKind {
    /// Initialize file
    Init { slug: String },
    /// Upsert
    Up,
    /// Get
    Get,
    /// List all
    List,
    /// Delete
    Delete,
}

fn main() {
    let cli = Cli::parse();
    let token = cli.token.unwrap_or_else(|| {
        env::var("API_TOKEN").unwrap_or_else(|err| {
            let err_msg = format!("Failed to get token: {err}");
            panic!("{}", Colour::Red.paint(err_msg));
        })
    });
    let gql_client = gql::GQLClient::new(&cli.server, &token).unwrap_or_else(|err| {
        let err_msg = format!("Failed to create GQL client: {err}");
        panic!("{}", Colour::Red.paint(err_msg));
    });
    let rest_client = rest::RestClient::new(&cli.server, &token).unwrap_or_else(|err| {
        let err_msg = format!("Failed to create REST client: {err}");
        panic!("{}", Colour::Red.paint(err_msg));
    });

    match &cli.subcommands {
        Subcommands::Sync => {
            let blog_contents = file::get_all_blog_contents().unwrap_or_else(|err| {
                let err_msg = format!("Failed to get blogs: {err}");
                panic!("{}", Colour::Red.paint(err_msg));
            });
            for content in blog_contents {
                gql_client.upsert_blog(content.post).unwrap_or_else(|err| {
                    let err_msg = format!("Failed to upsert blog: {err}");
                    panic!("{}", Colour::Red.paint(err_msg));
                });
                for image_path in content.images {
                    let key = image_path.as_os_str().to_str().unwrap();
                    let file = fs::File::open(&image_path).unwrap();
                    rest_client.upload_image(key, file).unwrap_or_else(|err| {
                        let err_msg = format!("Failed to upload image: {err}");
                        panic!("{}", Colour::Red.paint(err_msg));
                    });
                }
            }

            let context_contents = file::get_all_context_contents().unwrap_or_else(|err| {
                let err_msg = format!("Failed to get contexts: {err}");
                panic!("{}", Colour::Red.paint(err_msg));
            });
            for content in context_contents {
                gql_client
                    .upsert_context(content.post)
                    .unwrap_or_else(|err| {
                        let err_msg = format!("Failed to upsert context: {err}");
                        panic!("{}", Colour::Red.paint(err_msg));
                    });
                for image_path in content.images {
                    let key = image_path.as_os_str().to_str().unwrap();
                    let file = fs::File::open(&image_path).unwrap();
                    rest_client.upload_image(key, file).unwrap_or_else(|err| {
                        let err_msg = format!("Failed to upload image: {err}");
                        panic!("{}", Colour::Red.paint(err_msg));
                    });
                }
            }
            println!("Synced!");
        }
        Subcommands::Blog { operation } => match operation {
            OperationKind::Init { slug } => {
                println!("Initializing \"{slug}\"...");
                file::create_empty_blog(slug).unwrap_or_else(|err| {
                    let err_msg = format!("Failed to Initialize: {err}");
                    panic!("{}", Colour::Red.paint(err_msg));
                });
                println!("Created empty blog file");
            }
            OperationKind::Up => {
                unimplemented!();
            }
            OperationKind::Get => {
                unimplemented!();
            }
            OperationKind::List => {
                unimplemented!();
            }
            OperationKind::Delete => {
                unimplemented!();
            }
        },
    }
}
