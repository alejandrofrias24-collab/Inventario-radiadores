export class ProductoRepository {
  async create(_producto) { throw new Error('ProductoRepository.create debe implementarse.'); }
  async findAll(_filters) { throw new Error('ProductoRepository.findAll debe implementarse.'); }
  async findById(_id) { throw new Error('ProductoRepository.findById debe implementarse.'); }
  async findByCodigo(_codigo) { throw new Error('ProductoRepository.findByCodigo debe implementarse.'); }
  async update(_id, _producto) { throw new Error('ProductoRepository.update debe implementarse.'); }
  async delete(_id) { throw new Error('ProductoRepository.delete debe implementarse.'); }
}
