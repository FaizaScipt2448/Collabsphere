import { Grid } from "@mui/material";

import AddProductFrom from "../../components/profile/product/AddProductFrom";
import PreviewProduct from "../../components/profile/product/PreviewProduct";

import { useForm, FormProvider } from "react-hook-form";

const AddProduct = () => {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <AddProductFrom />
        </Grid>
        <Grid item xs={12} md={6}>
          <PreviewProduct />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddProduct;
