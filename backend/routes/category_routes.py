# import React, { useEffect, useState } from "react";
# import { useParams } from "react-router-dom";

# const CategoryPage = () => {
#   const { catname } = useParams(); 
#   const [products, setProducts] = useState([]);

#   useEffect(() => {
#     fetch(`https://mahal-api/api/category/${catname}`)
#       .then(res => res.json())
#       .then(data => setProducts(data))
#       .catch(err => console.error("Filter error:", err));
#   }, [catname]);

#   return (
#     <div className="container">
#       <h2>{catname} Products</h2>
      
#       {products.length === 0 ? (
#         <p>No products found.</p>
#       ) : (
#         <div className="product-grid">
#           {products.map((p) => (
#             <div key={p.product_id} className="product-card">
#               <img src={`https://mahal-api/api/image/${p.product_id}`} alt="" />
#               <h4>{p.product_name_english}</h4>
#               <p>{p.price_per_unit} {p.currency}</p>
#             </div>
#           ))}
#         </div>
#       )}
#     </div>
#   );
# };

# export default CategoryPage;
