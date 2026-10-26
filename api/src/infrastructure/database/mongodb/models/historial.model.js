import mongoose from 'mongoose';

const historialSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: Number,
      required: [true, 'El usuarioId es obligatorio.'],
      min: [1, 'El usuarioId debe ser un entero positivo.'],
      validate: {
        validator: Number.isInteger,
        message: 'El usuarioId debe ser un entero.'
      },
      index: true
    },
    accion: {
      type: String,
      required: [true, 'La acción es obligatoria.'],
      trim: true,
      minlength: [2, 'La acción debe tener al menos 2 caracteres.'],
      maxlength: [80, 'La acción no puede superar 80 caracteres.']
    },
    recurso: {
      type: String,
      required: [true, 'El recurso es obligatorio.'],
      trim: true,
      minlength: [1, 'El recurso no puede estar vacío.'],
      maxlength: [100, 'El recurso no puede superar 100 caracteres.']
    },
    detalles: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    collection: 'historial',
    timestamps: { createdAt: 'creadoEn', updatedAt: false },
    versionKey: false
  }
);

export const HistorialModel = mongoose.model('Historial', historialSchema);
