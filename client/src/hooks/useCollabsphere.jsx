import { useContext } from "react";
import { CollabsphereContext } from "../../provider/Provider";

const useCollabsphere = () => {
  return useContext(CollabsphereContext);
};

export default useCollabsphere;
