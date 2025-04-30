import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📥 Archivo recibido en multer:", file.originalname);

    const nameParts = file.originalname.split("_");
    const name = nameParts.length > 1 ? nameParts[0].toLowerCase() : null;

    const folderMap: Record<string, string> = {
      odoo: "./public/Odoo",
      clientes: "./public/Odoo",
      contracts: "./public/Odoo",  // Añade esta línea
      payments: "./public/Odoo",
      billings: "./public/Odoo",
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
    const nameParts = file.originalname.split('_');
    const dateNow = new Date().toISOString().replace(/:/g, '_');
    
    // Ejemplo: si originalname = "factura_cliente.csv", esto lo parte en ["factura", "cliente.csv"]
    const baseName = nameParts[0]; // "factura"
    const rest = nameParts.slice(1).join('_'); // "cliente.csv"
  
    const finalName = `${baseName}_${dateNow}_${rest}`;
    cb(null, finalName);
  }

});

export const upload = multer({ storage });
