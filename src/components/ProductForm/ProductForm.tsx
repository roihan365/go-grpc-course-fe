import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import FormInput from "../FormInput/FormInput";
import CurrencyInput from "../CurrencyInput/CurrencyInput";
import { type ProductFormInputs } from "../../types/product";
import { useEffect } from "react";

const createProductSchema = yup.object().shape({
  name: yup.string().required("Nama produk wajib diisi"),
  description: yup.string(),
  price: yup
    .number()
    .required("Harga produk wajib diisi")
    .typeError("Harga produk tidak valid")
    .moreThan(0, "Harga produk harus lebih dari 0"),
  // image: yup
  //   .mixed<FileList>()
  //   .test(
  //     "fileType",
  //     "Unsupported file type (only JPEG, PNG, GIF)",
  //     (fileList) =>
  //       fileList && fileList.length > 0
  //         ? ["image/jpeg", "image/png", "image/gif"].includes(fileList[0].type)
  //         : true
  //   ),
  image: yup.string().optional(),
});

const editProductSchema = yup.object().shape({
  name: yup.string().required("Nama produk wajib diisi"),
  description: yup.string(),
  price: yup
    .number()
    .required("Harga produk wajib diisi")
    .typeError("Harga produk tidak valid")
    .moreThan(0, "Harga produk harus lebih dari 0"),
  // image: yup
  //   .mixed<FileList>()
  //   .test(
  //     "fileType",
  //     "Unsupported file type (only JPEG, PNG, GIF)",
  //     (fileList) =>
  //       fileList && fileList.length > 0
  //         ? ["image/jpeg", "image/png", "image/gif"].includes(fileList[0].type)
  //         : true
  //   ),
  image: yup.string().optional(),
});

interface ProductFormProps {
  onSubmit: (values: ProductFormInputs) => void;
  disabled?: boolean;
  defaultValues?: ProductFormInputs;
  isEdit?: boolean;
}

function ProductForm(props: ProductFormProps) {
  const form = useForm<ProductFormInputs>({
    resolver: yupResolver(
      props.isEdit ? editProductSchema : createProductSchema
    ),
    defaultValues: props.defaultValues,
  });

  const submitHandler = async (values: ProductFormInputs) => {
    props.onSubmit(values);
  };

  useEffect(() => {
    if (props.defaultValues) {
      form.reset(props.defaultValues);
    }
  }, [props.defaultValues]);
  return (
    <div className="p-4 p-lg-5 border bg-white">
      <form onSubmit={form.handleSubmit(submitHandler)}>
        <FormInput<ProductFormInputs>
          name="name"
          errors={form.formState.errors}
          register={form.register}
          type="text"
          label="Nama Produk"
          placeholder="Nama Produk"
          labelRequired={true}
          disabled={props.disabled}
        />

        <CurrencyInput<ProductFormInputs>
          name="price"
          errors={form.formState.errors}
          control={form.control}
          label="Harga Produk"
          placeholder="Harga Produk"
          labelRequired={true}
          disabled={props.disabled}
        />

        <FormInput<ProductFormInputs>
          name="description"
          errors={form.formState.errors}
          register={form.register}
          type="textarea"
          label="Deskripsi"
          placeholder="Deskripsi Produk"
          labelRequired={true}
          disabled={props.disabled}
        />

        {/* <FormInput<ProductFormInputs>
          name="image"
          errors={form.formState.errors}
          register={form.register}
          type="image"
          label="Gambar Produk"
          placeholder="Gambar Produk"
          labelRequired={false}
          disabled={props.disabled}
        /> */}

        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={props.disabled}
          >
            Simpan Produk
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
