import { useState } from "react";

const ItemCard = ({ product, data }) => {
  const [isGrayMode, setIsGrayMode] = useState(false);

  return (
    <div
      className={`p-4 rounded-2xl w-full ${
        isGrayMode ? " shadow-sm" : "shadow-md"
      } mb-2`}
    > 
    <div className="flex pl-3">
    {/* Toggle per la modalità grigia */}
      <div className="mt-2 flex flex-col justify-center mr-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="toggle toggle-gray rounded-full"
            checked={isGrayMode}
            onChange={() => setIsGrayMode(!isGrayMode)}
            />
        </label>
      </div>
      <div className="flex justify-around w-full">
        <div>
        <strong
            className={`text-lg ${
              isGrayMode ? "line-through text-gray-500" : "text-gray-800"
            }`}
          >
            {product.name}
          </strong>
          <p className="text-sm text-gray-600">Quantità: {product.quantity}</p>
        </div>
        {data && (
            <div className="text-sm text-gray-500 pt-2">
            <p>{data.mostSimilar?.name}</p>
            <p>Prezzo: €{data.mostSimilar?.price || "N/A"}</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ItemCard;
