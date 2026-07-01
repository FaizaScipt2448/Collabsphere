import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCollabsphere from "../../../src/hooks/useCollabsphere";
import ProfileListCard from "./ProfileListCard";

const LatestProduct = () => {
  const [products, setProducts] = useState([]);
  const {
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
    setLoadingStatus,
  } = useCollabsphere();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_ENDPOINT
          }/products?limit=5&sort=createdAt`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setProducts(response.data.products);
        } else {
          setLoadingStatus(false);
          setAlertBoxOpenStatus(true);
          setAlertSeverity(response.data.status ? "success" : "error");
          setAlertMessage(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingStatus(false);
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(error.response?.data?.message || error.message);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchData();
  }, [setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus]);

  return (
    <ProfileListCard
      title="Latest Products"
      items={products}
      emptyMessage="No products listed yet."
      renderItem={(product) => ({
        key: product._id,
        primary: product.title,
        secondary: `Price: $${product.price}`,
        avatar: `${import.meta.env.VITE_SERVER_ENDPOINT}/productimage/${product.image}`,
      })}
    />
  );
};

export default LatestProduct;
