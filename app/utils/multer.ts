import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📥 Archivo recibido en multer:", file.originalname);
    const name = file.originalname.split("_")[0]?.toLowerCase();

    const folderMap: Record<string, string> = {
      odoo: "./public/Odoo",
      clientes: "./public/Odoo"
    };

    const targetFolder = folderMap[name];

    if (!targetFolder) {
      return cb(new Error("Destino no válido"), "");
    }

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    const nameParts = file.originalname.split("_");
    cb(null, nameParts.slice(1).join("_"));
  }
});

export const upload = multer({ storage });
