mod routes;

use routes::search;
use warp::Filter;

// #[tokio::main]
// async fn main() {
//     let search_route = warp::path("search")
//         .and(warp::get())
//         .and(warp::query::<std::collections::HashMap<String, String>>())
//         .and_then(search);
//
//     let routes = search_route.with(warp::log("search-service"));
//
//     let port = std::env::var("SEARCH_SERVICE_PORT").unwrap_or_else(|_| "4001".to_string());
//
//     println!("Search service started at port {}", port);
//     warp::serve(routes).run(([0, 0, 0, 0], port.parse().unwrap())).await;
// }

#[tokio::main]
async fn main() {
    let app = axum::Router::new().route("/search", axum::routing::get(search_handler));

    let port = std::env::var("SEARCH_SERVICE_PORT").unwrap_or_else(|_| "4001".to_string());
    let url = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(url).await.unwrap();
    println!("Search service started at port {}", port);
    axum::serve(listener, app).await.unwrap();
}

#[derive(serde::Deserialize)]
struct SearchQuery {
    query: String,
}

async fn search_handler(
    axum::extract::Query(params): axum::extract::Query<SearchQuery>,
) -> Result<
    impl axum::response::IntoResponse,
    (axum::http::StatusCode, axum::Json<serde_json::Value>),
> {
    let transport =
        elasticsearch::http::transport::Transport::single_node("http://elasticsearch:9200")
            .unwrap();
    let client = elasticsearch::Elasticsearch::new(transport);

    let response = client
        .search(elasticsearch::SearchParts::Index(&["products"]))
        .body(serde_json::json!({
            "query": {
                "bool": {
                    "should": [
                        {
                            "multi_match": {
                                "fields": ["full_name", "name", "description"],
                                "query": params.query,
                                "type": "phrase_prefix"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": ["full_name", "name", "description"],
                                "query": params.query,
                                "fuzziness": "AUTO",
                                "type": "best_fields"
                            }
                        }
                    ],
                    "minimum_should_match": 1
                }
            },
            "size": 10
        }))
        .send()
        .await;

    match response {
        Ok(response) => {
            let json_resp = response.json::<serde_json::Value>().await.unwrap();
            Ok((axum::http::StatusCode::OK, axum::Json(json_resp)))
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
            Err((
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::Json(serde_json::json!({ "error": "Internal server error" })),
            ))
        }
    }
}
