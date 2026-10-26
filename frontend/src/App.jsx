import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { LoginPage, RegisterPage } from './auth/AuthPages.jsx';
import {
  createProducto,
  deleteProducto,
  getHealth,
  getProductos,
  updateProducto
} from './api/productos.js';

const PAGE_SIZE = 8;
const EMPTY_PRODUCT = {
  codigo: '', nombre: '', descripcion: '', marca: '', modelo: '', vehiculo: '',
  anioDesde: '', anioHasta: '', precio: '', stock: '0'
};
const currency = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' });
const numberFormat = new Intl.NumberFormat('es-DO');

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    radiator: <><path d="M5 4v16M9 4v16M13 4v16M17 4v16M21 4v16"/><path d="M3 7h20M3 17h20M4 4h16M4 20h16"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    edit: <><path d="m14 5 5 5M4 20l4.4-.9L19 8.5a2.1 2.1 0 0 0-3-3L5.4 16.1 4 20Z"/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5.5 7l.8 13h11.4l.8-13M9 7V4h6v3"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    check: <path d="m5 12 4 4L19 6"/>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function MetricCard({ label, value, footnote, tone, icon }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon name={icon} size={19} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{footnote}</small></div>
    </article>
  );
}

function ProductDialog({ product, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(() => product ? {
    codigo: product.codigo,
    nombre: product.nombre,
    descripcion: product.descripcion ?? '',
    marca: product.marca,
    modelo: product.modelo,
    vehiculo: product.vehiculo,
    anioDesde: String(product.anioDesde),
    anioHasta: String(product.anioHasta),
    precio: String(product.precio),
    stock: String(product.stock)
  } : EMPTY_PRODUCT);
  const [formError, setFormError] = useState('');

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    setFormError('');
    const payload = {
      ...form,
      anioDesde: Number(form.anioDesde),
      anioHasta: Number(form.anioHasta),
      precio: Number(form.precio),
      stock: Number(form.stock)
    };
    if (payload.anioHasta < payload.anioDesde) {
      setFormError('El año final debe ser igual o posterior al año inicial.');
      return;
    }
    onSave(payload).catch((error) => setFormError(error.message));
  }

  useEffect(() => {
    function onKeyDown(event) { if (event.key === 'Escape' && !isSaving) onClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, isSaving]);

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-header">
          <div><span className="eyebrow">INVENTARIO DE RADIADORES</span><h2 id="dialog-title">{product ? 'Editar producto' : 'Agregar producto'}</h2><p>Completa los datos del repuesto para vehículos.</p></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar" disabled={isSaving}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>Código<input autoFocus name="codigo" value={form.codigo} onChange={change} maxLength="40" placeholder="RAD-TOY-001" required /></label>
            <label>Nombre<input name="nombre" value={form.nombre} onChange={change} maxLength="160" placeholder="Radiador Corolla" required /></label>
            <label>Marca<input name="marca" value={form.marca} onChange={change} maxLength="100" placeholder="Toyota" required /></label>
            <label>Modelo<input name="modelo" value={form.modelo} onChange={change} maxLength="120" placeholder="Corolla" required /></label>
            <label className="span-two">Vehículo compatible<input name="vehiculo" value={form.vehiculo} onChange={change} maxLength="120" placeholder="Toyota Corolla 1.8L" required /></label>
            <label>Año desde<input name="anioDesde" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.anioDesde} onChange={change} required /></label>
            <label>Año hasta<input name="anioHasta" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.anioHasta} onChange={change} required /></label>
            <label>Precio (DOP)<input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={change} placeholder="0.00" required /></label>
            <label>Unidades en stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} required /></label>
            <label className="span-two">Descripción <span className="optional">Opcional</span><textarea name="descripcion" value={form.descripcion} onChange={change} maxLength="1000" rows="3" placeholder="Material, características o notas del producto" /></label>
          </div>
          {formError && <div className="form-error" role="alert">{formError}</div>}
          <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose} disabled={isSaving}>Cancelar</button><button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? <span className="spinner small" /> : <Icon name="check" size={17} />}{isSaving ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}</button></div>
        </form>
      </section>
    </div>
  );
}

function InventoryPage() {
  const { session, logout } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogProduct, setDialogProduct] = useState(undefined);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setPage(1); setDebouncedSearch(search.trim()); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const healthQuery = useQuery({ queryKey: ['api-health'], queryFn: getHealth, retry: false, refetchInterval: 20_000 });
  const productsQuery = useQuery({ queryKey: ['productos', page, debouncedSearch], queryFn: () => getProductos({ page, limit: PAGE_SIZE, search: debouncedSearch }) });
  const saveMutation = useMutation({
    mutationFn: ({ id, producto }) => id ? updateProducto({ id, producto }) : createProducto(producto),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
      setDialogProduct(undefined);
      setNotice({ type: 'success', text: variables.id ? 'Producto actualizado correctamente.' : 'Producto agregado al inventario.' });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
      setNotice({ type: 'success', text: 'Producto eliminado del inventario.' });
    },
    onError: (error) => setNotice({ type: 'error', text: error.message })
  });

  const result = productsQuery.data;
  const products = result?.data ?? [];
  const pagination = result?.pagination ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };
  const stockTotal = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);

  async function saveProduct(producto) {
    await saveMutation.mutateAsync({ id: dialogProduct?.id, producto });
  }

  function removeProduct(product) {
    if (window.confirm(`¿Eliminar “${product.nombre}” del inventario? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(product.id);
    }
  }

  const apiOnline = healthQuery.isSuccess;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Radiadores, inicio"><span className="brand-mark"><Icon name="radiator" size={23} /></span><span className="brand-text"><strong>radiadores</strong><small>GESTIÓN DE REPUESTOS</small></span></a>
        <div className="sidebar-label">MENÚ PRINCIPAL</div>
        <nav className="side-nav" aria-label="Navegación principal">
          <a className="nav-item active" href="#inventario"><Icon name="box" size={19} /><span>Inventario</span><span className="nav-indicator" /></a>
        </nav>
        <div className="sidebar-bottom"><div className={`api-card ${apiOnline ? 'online' : ''}`}><span className="status-dot" /><div><strong>{apiOnline ? 'API conectada' : healthQuery.isLoading ? 'Conectando…' : 'API desconectada'}</strong><small>{apiOnline ? 'Servicio disponible' : 'Revisa el servidor en :3000'}</small></div></div><div className="sidebar-foot">Panel de control <span>•</span> v1.0</div></div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar"><div className="breadcrumb">Catálogo <Icon name="arrow" size={14} /><strong>Inventario</strong></div><div className="topbar-right"><span className="today-label">{session?.user?.nombre || 'GESTIÓN DE PRODUCTOS'}</span><button className="button button-quiet logout-button" onClick={logout}>Cerrar sesión</button><div className="avatar">{session?.user?.nombre?.[0]?.toUpperCase() || 'R'}</div></div></header>
        <section className="page-content" id="inventario">
          <div className="page-heading"><div><div className="eyebrow"><span className="heading-dot" /> CATÁLOGO DE REPUESTOS</div><h1>Inventario</h1><p>Administra tus radiadores y encuentra rápidamente el repuesto correcto.</p></div><button className="button button-primary add-button" onClick={() => { saveMutation.reset(); setDialogProduct(null); }}><Icon name="plus" size={19} />Nuevo producto</button></div>

          <div className="metrics-grid">
            <MetricCard label="Productos registrados" value={numberFormat.format(pagination.total)} footnote="En todo el catálogo" tone="indigo" icon="box" />
            <MetricCard label="Unidades en esta página" value={numberFormat.format(stockTotal)} footnote={`${products.length} productos visibles`} tone="teal" icon="radiator" />
            <MetricCard label="Estado de conexión" value={apiOnline ? 'En línea' : healthQuery.isLoading ? 'Conectando' : 'Sin conexión'} footnote={apiOnline ? 'API y servicio disponibles' : 'La API debe estar activa'} tone={apiOnline ? 'green' : 'amber'} icon="check" />
          </div>

          <section className="inventory-panel" aria-labelledby="inventory-title">
            <div className="panel-heading"><div><h2 id="inventory-title">Todos los productos</h2><p>Busca, revisa y actualiza los repuestos de tu catálogo.</p></div><div className="panel-count">{numberFormat.format(pagination.total)} <span>productos</span></div></div>
            <div className="table-toolbar"><label className="search-box"><Icon name="search" size={18} /><input aria-label="Buscar productos" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código o modelo…" />{search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Limpiar búsqueda"><Icon name="close" size={16} /></button>}</label><span className="results-label">{debouncedSearch ? `Resultados para “${debouncedSearch}”` : 'Catálogo de productos'}</span></div>

            {productsQuery.isPending ? <div className="state-panel"><span className="spinner" /><strong>Cargando inventario…</strong><span>Conectando con la API.</span></div> : productsQuery.isError ? <div className="state-panel error-state"><div className="state-symbol">!</div><strong>No se pudo cargar el inventario</strong><span>{productsQuery.error.message}</span><button className="button button-quiet" onClick={() => productsQuery.refetch()}>Intentar de nuevo</button></div> : products.length === 0 ? <div className="state-panel empty-state"><div className="empty-icon"><Icon name="box" size={25} /></div><strong>{debouncedSearch ? 'No encontramos productos' : 'Tu inventario está vacío'}</strong><span>{debouncedSearch ? 'Prueba con otro código, nombre o modelo.' : 'Agrega tu primer radiador para comenzar a organizar el catálogo.'}</span>{!debouncedSearch && <button className="button button-primary" onClick={() => { saveMutation.reset(); setDialogProduct(null); }}><Icon name="plus" size={17} />Agregar producto</button>}</div> : <>
              <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>CÓDIGO</th><th>VEHÍCULO COMPATIBLE</th><th>PRECIO</th><th>STOCK</th><th className="actions-heading">ACCIONES</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}>
                <td><div className="product-cell"><div className="product-avatar"><Icon name="radiator" size={18} /></div><div><strong>{product.nombre}</strong><span>{product.marca} · {product.modelo}</span></div></div></td>
                <td><span className="code-pill">{product.codigo}</span></td>
                <td><div className="vehicle-cell"><strong>{product.vehiculo}</strong><span>{product.anioDesde} – {product.anioHasta}</span></div></td>
                <td className="price-cell">{currency.format(Number(product.precio))}</td>
                <td><span className={`stock-pill ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'in'}`}><span />{product.stock === 0 ? 'Agotado' : `${numberFormat.format(product.stock)} uds.`}</span></td>
                <td><div className="row-actions"><button className="icon-button edit-action" aria-label={`Editar ${product.nombre}`} title="Editar" onClick={() => { saveMutation.reset(); setDialogProduct(product); }}><Icon name="edit" size={17} /></button><button className="icon-button delete-action" aria-label={`Eliminar ${product.nombre}`} title="Eliminar" disabled={deleteMutation.isPending} onClick={() => removeProduct(product)}><Icon name="trash" size={17} /></button></div></td>
              </tr>)}</tbody></table></div>
              <div className="table-footer"><span>Mostrando <strong>{(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + products.length}</strong> de <strong>{numberFormat.format(pagination.total)}</strong> productos</span><div className="pagination"><button className="page-button" disabled={page <= 1 || productsQuery.isFetching} onClick={() => setPage((current) => current - 1)} aria-label="Página anterior"><span className="previous-chevron">‹</span></button><span className="page-number">{page} <span>/</span> {Math.max(pagination.totalPages, 1)}</span><button className="page-button" disabled={page >= pagination.totalPages || productsQuery.isFetching} onClick={() => setPage((current) => current + 1)} aria-label="Página siguiente"><span>›</span></button></div></div>
            </>}
          </section>
          <footer className="page-footer"><span>© {new Date().getFullYear()} Radiadores</span><span>Inventario sincronizado con la API</span></footer>
        </section>
      </main>

      {dialogProduct !== undefined && <ProductDialog key={dialogProduct?.id ?? 'new-product'} product={dialogProduct} onClose={() => { if (!saveMutation.isPending) setDialogProduct(undefined); }} onSave={saveProduct} isSaving={saveMutation.isPending} />}
      {notice && <div className={`toast ${notice.type}`} role="status"><span className="toast-mark"><Icon name={notice.type === 'success' ? 'check' : 'close'} size={16} /></span>{notice.text}<button onClick={() => setNotice(null)} aria-label="Cerrar aviso"><Icon name="close" size={16} /></button></div>}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/inventario" element={<InventoryPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/inventario" replace />} />
          <Route path="*" element={<Navigate to="/inventario" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
