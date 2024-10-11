mod routes;

use warp::Filter;
use routes::search;

#[tokio::main]
async fn main() {
    let search_route = warp::path("search")
        .and(warp::get())
        .and(warp::query::<std::collections::HashMap<String, String>>())
        .and_then(search);

    let routes = search_route.with(warp::log("search-service"));

    let port = std::env::var("SEARCH_SERVICE_PORT").unwrap_or_else(|_| "4001".to_string());

    println!("Search service started at port {}", port);
    warp::serve(routes).run(([0, 0, 0, 0], port.parse().unwrap())).await;
}
