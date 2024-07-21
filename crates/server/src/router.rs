use async_graphql::{EmptySubscription, Schema};
use async_graphql_axum::GraphQL;
use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::post_service,
    Router,
};
use std::sync::Arc;
use worker::Env;

use crate::{
    app::Apps,
    gql::{MutationRoot, QueryRoot},
};

pub struct RouterState {
    pub apps: Apps,
    pub api_token: String,
}

impl RouterState {
    pub fn new(apps: Apps, env: Env) -> worker::Result<Self> {
        let api_token = env.secret("API_TOKEN")?.to_string();
        Ok(Self { apps, api_token })
    }
}

pub fn create_router(apps: Apps, env: Env) -> Router {
    let router_state = Arc::new(RouterState::new(apps, env).unwrap());
    let schema = Schema::build(QueryRoot, MutationRoot, EmptySubscription)
        .data(router_state.clone())
        .finish();

    Router::new()
        .route("/", axum::routing::get(|| async { "Hello, World!" }))
        .route("/graphql", post_service(GraphQL::new(schema)))
        .route_layer(middleware::from_fn_with_state(
            router_state.clone(),
            bearer_auth_middleware,
        ))
        .with_state(router_state)
}

async fn bearer_auth_middleware(
    State(app_state): State<Arc<RouterState>>,
    headers: HeaderMap,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let req_token = get_bearer_token(&headers).ok_or(StatusCode::UNAUTHORIZED)?;
    if req_token == &app_state.api_token {
        let response = next.run(req).await;
        Ok(response)
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

fn get_bearer_token(headers: &HeaderMap) -> Option<&str> {
    headers
        .get("Authorization")
        .and_then(|header| header.to_str().ok())
        .map(|token| token.trim_start_matches("Bearer "))
}
