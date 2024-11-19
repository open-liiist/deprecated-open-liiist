import React from "react";
import productListStyles from "./ProductList.module.css";

interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
}

interface ProductListProps {
    products: Product[];
}

export const ProductList = ({ products }: ProductListProps) => {
    return (
        <div className={productListStyles.productList}>
            {products.map((product) => (
                <div key={product.id} className={productListStyles.productItem}>
                    <h3 className={productListStyles.productName}>{product.name}</h3>
                    <p className={productListStyles.productPrice}>{product.price}€</p>
                    {product.description && (
                        <p className={productListStyles.productDescription}>
                            {product.description}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};
