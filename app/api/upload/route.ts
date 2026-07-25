import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Ubah file menjadi buffer agar bisa dibaca oleh Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload Buffer ke Cloudinary dengan promise
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "alfashop/products" }, // Folder di Cloudinary
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const secureUrl = (cloudinaryResponse as any).secure_url;

    // Catatan: Jika ingin langsung save ke database, bisa di-import query mysql 
    // dan update table `produk`. Namun lebih fleksibel jika kita kembalikan URL nya 
    // ke frontend, lalu disubmit bersamaan dengan nama produk, harga, dll.

    return NextResponse.json({ 
      success: true, 
      imageUrl: secureUrl,
      message: "Gambar berhasil diupload!" 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
  }
}
