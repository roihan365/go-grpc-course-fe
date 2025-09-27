import React, { useEffect, useState } from "react";
import useSortableHeader from "../../hooks/useSortableHeader";
import SortableHeader from "../SortableHeader/SortableHeader";
import Pagination from "../Pagination/Pagination";
import { Link, useNavigate } from "react-router-dom";
import useGrpcApi from "../../hooks/useGrpcApi";
import { getProductClient } from "../../api/grpc/client";
import Swal from "sweetalert2";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageFileName: string;
}

function AdminProductListSection() {
  const productApi = useGrpcApi();
  const { handleSort, sortConfig } = useSortableHeader();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const [products, setProducts] = useState<Product[]>([]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const deleteHandler = async (product: Product) => {
    const result = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: `Produk "${product.name}" akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const res = await productApi.callApi(
      getProductClient().deleteProduct({ id: product.id }),
      {
        defaultError: (res) => {
          if (res.response.base?.isError ?? true) {
            Swal.fire({
              icon: "error",
              title: "Gagal Hapus",
              text:
                res.response.base?.message ?? "Terjadi kesalahan tak terduga",
            });
          }
        },
        useDefaultError: false,
      }
    );

    if (res?.response?.base?.isError) return;

    Swal.fire({
      icon: "success",
      title: "Produk berhasil dihapus",
      timer: 1500,
      showConfirmButton: false,
    });

    // update state
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await productApi.callApi(
        getProductClient().listProductAdmin({}),
        {
          defaultError: (res) => {
            if (res.response.base?.isError ?? true) {
              Swal.fire({
                icon: "error",
                title: "Gagal Ambil Produk",
                text:
                  res.response.base?.message ?? "Terjadi kesalahan tak terduga",
              });
            }
          },
          useDefaultError: false,
        }
      );

      if (res?.response?.data) {
        setProducts(res.response.data);
      }
    };

    fetchProduct();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="section-title">Produk</h2>
        <Link to="/admin/products/create">
          <button className="btn btn-primary">Tambah Produk</button>
        </Link>
      </div>
      <div className="table-responsive">
        <table className="table site-blocks-table">
          <thead>
            <tr>
              {/* <th>Gambar</th> */}
              <SortableHeader
                label="Nama Produk"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                label="Harga"
                sortKey="price"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                label="Deskripsi"
                sortKey="description"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id}>
                  {/* <td>
                    <img
                      src={`/images/${p.imageFileName}`}
                      alt={p.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  </td> */}
                  <td>{p.name}</td>
                  <td>Rp {p.price.toLocaleString("id-ID")}</td>
                  <td>{p.description}</td>
                  <td>
                    <Link to={`/admin/products/edit/${p.id}`}>
                      <button className="btn btn-sm btn-warning me-2">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteHandler(p)}
                      className="btn btn-sm btn-danger"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  Tidak ada produk
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default AdminProductListSection;
