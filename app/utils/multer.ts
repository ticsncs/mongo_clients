import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📥 Archivo recibido en multer:", file.originalname);

    const nameParts = file.originalname.split("_");
    const name = nameParts.length > 1 ? nameParts[0].toLowerCase() : null;

    const folderMap: Record<string, string> = {
      odoo: "./public/Odoo",
      clientes: "./public/Odoo",
      contracts: "./public/Odoo",  // Añade esta línea
      pagos: "./public/Odoo",
    };

    console.log("🧩 Nombre clave extraído:", name);
    const targetFolder = name ? folderMap[name] : null;

    console.log("📁 Carpeta de destino:", targetFolder);

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
    const filename = nameParts.length > 1 ? nameParts.slice(1).join("_") : file.originalname;
    cb(null, filename);
  }
});

export const upload = multer({ storage });
