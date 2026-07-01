import { Box, Typography, Card } from "@mui/material";
import { useFormContext } from "react-hook-form";

const PreviewProduct = () => {
  const { watch } = useFormContext();
  const productImage = watch("productimage");
  const title = watch("title");
  const price = watch("price");
  const description = watch("description");

  let productImageUrl = null;
  if (productImage && productImage[0] && productImage[0] instanceof File) {
    try {
      productImageUrl = URL.createObjectURL(productImage[0]);
    } catch (error) {
      console.error("Error creating object URL:", error);
    }
  }

  const hasContent = title || productImageUrl || price || description;

  if (!hasContent) {
    return (
      <Typography variant="body2" color="text.secondary">
        Fill in the form to see a live preview here.
      </Typography>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">
        Preview
      </Typography>
      <Typography variant="h4" fontWeight={700} color="secondary.main" gutterBottom>
        {title}
      </Typography>
      {productImageUrl && (
        <Box
          component="img"
          src={productImageUrl}
          alt=""
          sx={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 1, mb: 2 }}
        />
      )}
      {price && (
        <Typography variant="h6" color="secondary.main" gutterBottom>
          Price: <Box component="span" fontWeight={700}>${price}</Box>
        </Typography>
      )}
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Card>
  );
};

export default PreviewProduct;
