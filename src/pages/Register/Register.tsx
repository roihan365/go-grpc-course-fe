import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput/FormInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getAuthClient } from "../../api/grpc/client";
import Swal from "sweetalert2";
import useGrpcApi from "../../hooks/useGrpcApi";

const registerSchema = yup.object().shape({
  full_name: yup.string().required("Nama lengkap wajib diisi"),
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .required("Kata sandi wajib diisi"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Konfirmasi kata sandi tidak sesuai")
    .required("Konfirmasi kata sandi wajib diisi"),
});

interface RegisterFormInputs {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const Register = () => {
  const navigate = useNavigate();
  const submitApi = useGrpcApi();
  const form = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema),
  });

  const submitHandler = async (values: RegisterFormInputs) => {
    await submitApi.callApi(
      getAuthClient().register({
        email: values.email,
        fullName: values.full_name,
        password: values.password,
        passwordConfirmation: values.password_confirmation,
      }),
      {
        defaultError: (res) => {
          if (res.response.base?.isError ?? true) {
            Swal.fire({
              icon: "error",
              title: "Pendaftaran Gagal",
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
      title: "Pendaftaran Berhasil",
      text: "Silahkan masuk menggunakan akun Anda",
    });

    navigate("/login");
  };
  return (
    <div className="login-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="login-wrap p-4">
              <h2 className="section-title text-center mb-5">Daftar</h2>
              <form
                onSubmit={form.handleSubmit(submitHandler)}
                className="login-form"
              >
                <FormInput<RegisterFormInputs>
                  errors={form.formState.errors}
                  name="full_name"
                  type="text"
                  placeholder="Nama Lengkap"
                  register={form.register}
                  disabled={submitApi.isLoading}
                />
                <FormInput<RegisterFormInputs>
                  errors={form.formState.errors}
                  name="email"
                  type="text"
                  placeholder="Alamat Email"
                  register={form.register}
                  disabled={submitApi.isLoading}
                />
                <FormInput<RegisterFormInputs>
                  errors={form.formState.errors}
                  name="password"
                  type="password"
                  placeholder="Kata Sandi"
                  register={form.register}
                  disabled={submitApi.isLoading}
                />
                <FormInput<RegisterFormInputs>
                  errors={form.formState.errors}
                  name="password_confirmation"
                  type="password"
                  placeholder="Konfirmasi Kata Sandi"
                  register={form.register}
                  disabled={submitApi.isLoading}
                />
                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitApi.isLoading}
                  >
                    Buat Akun
                  </button>
                </div>
                <div className="text-center mt-4">
                  <p>
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-primary">
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
