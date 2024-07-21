mod app;
pub mod gql;
mod router;

use tower_service::Service;
use worker::{Context, Env, HttpRequest};

use app::Apps;
use router::create_router;

const D1_BINDING: &str = "DB";

#[worker::event(fetch)]
async fn fetch(
    req: HttpRequest,
    env: Env,
    _ctx: Context,
) -> worker::Result<axum::response::Response<axum::body::Body>> {
    console_error_panic_hook::set_once();

    let apps = Apps::new(env.d1(D1_BINDING)?);
    let mut router = create_router(apps, env);

    Ok(router.call(req).await?)
}
