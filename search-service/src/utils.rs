//search-service/src/utils.rs
pub fn haversine_distance(
    lat1: f64,
    lon1: f64,
    lat2: f64,
    lon2: f64,
) -> f64 {
    let earth_radius = 6371.0; // Raggio medio della Terra in km

    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();

    let a = (dlat / 2.0).sin().powi(2)
        + lat1.to_radians().cos() * lat2.to_radians().cos() * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().asin();

    earth_radius * c
}

/// Trasforma l’input in minuscolo, rimuove i caratteri speciali e sostituisce gli spazi con underscore.
/// Esempio: "brodo di verdure" -> "brodo_di_verdure"
pub fn sanitize(input: &str) -> String {
    input
        .to_lowercase()
        .replace(|c: char| !c.is_alphanumeric() && !c.is_whitespace(), "")
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join("_")
}
