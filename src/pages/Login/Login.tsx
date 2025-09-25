import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import FormInput from "../../components/FormInput/FormInput";
import { RpcError } from "@protobuf-ts/runtime-rpc";
import { getAuthClient } from "../../api/grpc/client";
import { useAuthStore } from "../../store/auth";

const loginSchema = yup.object().shape({
  email: yup.string().email("Email tidak valid").required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .required("Kata sandi wajib diisi"),
});

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
  const form = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const submitHandler = async (values: LoginFormInputs) => {
    try {
      const client = getAuthClient();

      const res = await client.login({
        email: values.email,
        password: values.password,
      });

      if (res.response.base?.isError ?? true) {
        Swal.fire({
          icon: "error",
          title: "Login gagal",
          text:
            res.response.base?.message ?? "Silahkan coba beberapa saat lagi",
          confirmButtonText: "Tutup",
        });
        return;
      }

      localStorage.setItem("access_token", res.response.accessToken);
      loginUser(res.response.accessToken);

      Swal.fire({
        icon: "success",
        title: "Berhasil masuk",
        timer: 2000,
        showConfirmButton: true,
      });

      if (useAuthStore.getState().role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      if (error instanceof RpcError) {
        if (error.code === "UNAUTHENTICATED") {
          Swal.fire({
            icon: "error",
            title: "Login gagal",
            text: "Email atau kata sandi salah",
            confirmButtonText: "Tutup",
          });
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Login gagal",
          text: "Silahkan coba beberapa saat lagi",
          confirmButtonText: "Tutup",
        });
      }
    }
  };

  return (
    <div className="login-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="login-wrap p-4">
              <h2 className="section-title text-center mb-5">Masuk</h2>
              <form
                onSubmit={form.handleSubmit(submitHandler)}
                className="login-form"
              >
                <FormInput<LoginFormInputs>
                  type="text"
                  placeholder="Alamat Email"
                  register={form.register}
                  name="email"
                  errors={form.formState.errors}
                />
                <FormInput<LoginFormInputs>
                  type="password"
                  placeholder="Kata Sandi"
                  register={form.register}
                  name="password"
                  errors={form.formState.errors}
                />
                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">
                    Masuk
                  </button>
                </div>
                <div className="text-center mt-4">
                  <p>
                    Belum punya akun?{" "}
                    <Link to="/register" className="text-primary">
                      Daftar di sini
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

export default Login;
