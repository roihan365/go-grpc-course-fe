import Swal from "sweetalert2";
import { getProductClient } from "../../api/grpc/client";
import PlainHeroSection from "../../components/PlainHeroSection/PlainHeroSection";
import ProductForm from "../../components/ProductForm/ProductForm";
import useGrpcApi from "../../hooks/useGrpcApi";
import { type ProductFormInputs } from "../../types/product";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { get, set } from "react-hook-form";

interface UploadImageResponse {
  fileName: string;
  message: string;
  success: boolean;
}



function AdminEditProduct() {
  const { id } = useParams();
  const detailApi = useGrpcApi();
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const productApi = useGrpcApi();
  const [defaultValues, setDefaultValues] = useState<ProductFormInputs | undefined>(undefined);

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await detailApi.callApi(getProductClient().detailProduct({ id: id ?? "" }))

      setDefaultValues({
        name: res?.response?.name ?? "",
        description: res?.response?.description ?? "",
        price: res?.response?.price ?? 0,
        image: "default.png",
        // image: new DataTransfer().files,
      });
    }

    fetchDetail();
  }, []);

  const submitHandler = async (values: ProductFormInputs) => {
    try {
      setUploadLoading(true);

      const res = await productApi.callApi(
        getProductClient().editProduct({
          id: id ?? "",
          name: values.name,
          description: values.description ?? "",
          price: values.price,
          //   imageFileName: uploadRes.data.fileName,
          imageFileName: "default.png",
        }),
        {
          defaultError: (res) => {
            if (res.response.base?.isError ?? true) {
              Swal.fire({
                icon: "error",
                title: "Tambah Gagal",
                text:
                  res.response.base?.message ?? "Terjadi kesalahan tak terduga",
              });
            }
          },
          useDefaultError: false,
        }
      );


      Swal.fire({
        icon: "success",
        title: "Berhasil menambahkan produk",
        timer: 2000,
        showConfirmButton: true,
      });

      navigate("/admin/products");
    } finally {
      setUploadLoading(false);
    }
  };
  return (
    <>
      <PlainHeroSection title="Tambah Produk" />

      <div className="untree_co-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <ProductForm
                onSubmit={submitHandler}
                disabled={productApi.isLoading || uploadLoading}
                defaultValues={defaultValues}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminEditProduct;
