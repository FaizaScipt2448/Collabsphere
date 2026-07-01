import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCollabsphere from "../../../src/hooks/useCollabsphere";
import ProfileListCard from "./ProfileListCard";

const RecentPost = () => {
  const [posts, setPosts] = useState([]);
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
          }/posts?limit=5&sort=createdAt`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setPosts(response.data.posts);
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
      title="Recent Posts"
      items={posts}
      emptyMessage="No posts published yet."
      renderItem={(post) => ({
        key: post._id,
        primary: post.title.slice(0, 40),
        secondary: `Posted on: ${new Date(post.createdAt).toLocaleDateString()}`,
      })}
    />
  );
};

export default RecentPost;
