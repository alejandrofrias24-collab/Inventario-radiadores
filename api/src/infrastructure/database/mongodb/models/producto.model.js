import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  codigo: { type: String, trim: true, maxlength: 40 },
  nombre: { type: String, trim: true, maxlength: 160 },
  descripcion: { type: String, default: null, maxlength: 1000 },
  marca: { type: String, trim: true, maxlength: 100 },
  modelo: { type: String, trim: true, maxlength: 120 },
  vehiculo_compatible: { type: String, trim: true, maxlength: 120 },
  ano_desde: Number,
  ano_hasta: Number,
  precio_dop: Number,
  stock: { type: Number, min: 0, default: 0 }
}, { collection: 'radiadores', timestamps: false, versionKey: false, strict: false });

const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }, { collection: 'contadores', versionKey: false });

export const ProductoModel = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
export const ProductoCounterModel = mongoose.models.ProductoCounter || mongoose.model('ProductoCounter', counterSchema);
