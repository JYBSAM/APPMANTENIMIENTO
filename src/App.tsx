import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  History, 
  Users, 
  Settings, 
  PlusCircle, 
  QrCode, 
  Menu, 
  X, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Factory,
  Building2,
  Search,
  Filter,
  Download,
  DollarSign,
  Activity,
  Zap,
  ShieldAlert,
  BarChart3,
  Camera,
  Upload,
  User,
  Calendar,
  Columns,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from './constants';
import { AppData } from './types';
import { fetchAppData, submitSolicitud, setupDatabase, updateSolicitud, deleteSolicitud } from './services/api';
import { 
  AREAS_INFRAESTRUCTURA, 
  ELEMENTOS_INFRAESTRUCTURA, 
  EQUIPOS_MAQUINARIA, 
  TIPOS_FALLA_MAQUINARIA,
  PRIORIDADES,
  ROLES
} from './constants';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3.5 mb-2 transition-all duration-300 rounded-2xl group relative overflow-hidden",
      active 
        ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={20} className={cn("shrink-0 transition-transform duration-300", active ? "text-white" : "text-slate-500 group-hover:scale-110")} />
    <span className="ml-3 font-semibold text-sm tracking-wide">
      {label}
    </span>
    {active && (
      <motion.div 
        layoutId="active-glow" 
        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" 
      />
    )}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <div className="glass-card p-5 md:p-6 rounded-3xl md:rounded-[32px] group hover:border-white/10 transition-all duration-500">
    <div className="flex items-start justify-between mb-4 md:mb-6">
      <div className={cn("p-3 md:p-4 rounded-2xl bg-opacity-10", color.replace('bg-', 'bg-opacity-10 text-'))}>
        <Icon size={20} className={cn(color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
          trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend > 0 ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowUpRight size={12} className="mr-1 rotate-90" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{value}</p>
        {subtitle && <span className="text-slate-500 text-xs font-medium">{subtitle}</span>}
      </div>
    </div>
  </div>
);

function OrderDetailsModal({ order, onClose, apiUrl, onUpdate }: { order: any, onClose: () => void, apiUrl: string, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...order });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const res = await updateSolicitud(apiUrl, formData);
    if (res.success) {
      onUpdate();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden?')) {
      setIsSubmitting(true);
      const res = await deleteSolicitud(apiUrl, order.ID);
      if (res.success) {
        onUpdate();
      }
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#16191E] w-full max-w-4xl rounded-[40px] border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Info & Image */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                {order.Tipo === 'Maquinaria' ? <Factory size={20} /> : <Building2 size={20} />}
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orden de Trabajo</span>
                <h2 className="text-2xl font-black text-white tracking-tight">#{order.ID.slice(0, 8)}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Descripción del Problema</h3>
              <p className="text-slate-200 font-medium leading-relaxed">{order.Descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ubicación / Equipo</h3>
                <p className="text-white font-bold">{order.Area_Equipo}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Elemento</h3>
                <p className="text-white font-bold">{order.Elemento_Falla}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Solicitante</h3>
                <p className="text-white font-bold">{order.Solicitante_Nombre || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rol</h3>
                <p className="text-white font-bold">{order.Rol_Solicitante || 'N/A'}</p>
              </div>
            </div>

            {order.Imagen && (
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Evidencia Adjunta</h3>
                <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/5 aspect-video flex items-center justify-center">
                  <img src={order.Imagen} alt="Evidencia" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions & Status */}
        <div className="w-full md:w-[320px] bg-white/[0.02] border-l border-white/5 p-8 md:p-10 flex flex-col">
          <div className="flex-1 space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Estado de la Orden</label>
              <div className="space-y-2">
                {['Pendiente', 'En proceso', 'Resuelto'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFormData({ ...formData, Estado: status })}
                    className={cn(
                      "w-full p-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-between",
                      formData.Estado === status 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {status}
                    {formData.Estado === status && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Prioridad</label>
              <div className="grid grid-cols-2 gap-2">
                {['Baja', 'Media', 'Alta', 'Crítica'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setFormData({ ...formData, Prioridad: p })}
                    className={cn(
                      "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      formData.Prioridad === p 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-white/5 border-white/5 text-slate-500"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Técnico Asignado</label>
              <input 
                type="text"
                value={formData.Tecnico_asignado}
                onChange={e => setFormData({ ...formData, Tecnico_asignado: e.target.value })}
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Nombre del técnico"
              />
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <button 
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Actualizar Orden'}
            </button>
            <button 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full py-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Eliminar Orden
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'form' | 'planner' | 'orders' | 'technicians' | 'history' | 'settings'>('landing');
  const [apiUrl, setApiUrl] = useState<string>(localStorage.getItem('gas_api_url') || '');
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (view !== 'landing') {
      loadData();
    }
  }, [view]);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchAppData(apiUrl);
    setData(result);
    setLoading(false);
  };

  const handleSaveSettings = (url: string) => {
    setApiUrl(url);
    localStorage.setItem('gas_api_url', url);
    setView('dashboard');
  };

  const handleNavClick = (newView: any) => {
    setView(newView);
    setMobileMenuOpen(false);
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('dashboard')} />;

  return (
    <div className="flex h-screen bg-[#0F1115] font-sans text-slate-200 overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          x: mobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed lg:relative flex flex-col bg-[#16191E] border-r border-white/5 z-40 h-full w-[280px]"
      >
        <div className="p-8 flex items-center mb-8">
          <div className="w-12 h-12 industrial-gradient rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.2)] shrink-0">
            <Zap size={24} className="text-white fill-white/20" />
          </div>
          <div className="ml-4">
            <h1 className="font-black text-xl tracking-tighter text-white leading-none">
              MANTENI<span className="text-blue-500">PRO</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Enterprise v2.0</span>
          </div>
          {mobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto p-2 text-slate-500 hover:text-white lg:hidden"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-6">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
          <SidebarItem icon={PlusCircle} label="Nueva Orden" active={view === 'form'} onClick={() => handleNavClick('form')} />
          <SidebarItem icon={Wrench} label="Gestión Órdenes" active={view === 'orders'} onClick={() => handleNavClick('orders')} />
          <SidebarItem icon={Calendar} label="Planificador" active={view === 'planner'} onClick={() => handleNavClick('planner')} />
          <SidebarItem icon={Users} label="Gestión Técnicos" active={view === 'technicians'} onClick={() => handleNavClick('technicians')} />
          <SidebarItem icon={History} label="Reportes" active={view === 'history'} onClick={() => handleNavClick('history')} />
          <div className="my-8 border-t border-white/5 mx-2" />
          <SidebarItem icon={Settings} label="Configuración" active={view === 'settings'} onClick={() => handleNavClick('settings')} />
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.05)_0%,_transparent_50%)]">
        <header className="sticky top-0 bg-[#0F1115]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 py-4 md:py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-400 hover:text-white lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight capitalize">
                {view === 'dashboard' ? 'Resumen Ejecutivo' : view}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium">Actualizado hace 2 minutos</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <div className={cn("w-2 h-2 rounded-full", apiUrl ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500 animate-pulse")} />
              <span className="text-xs font-bold text-slate-300">{apiUrl ? 'Sincronizado' : 'Desconectado'}</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs md:text-sm">
              JS
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[60vh]"
              >
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Sincronizando con Google Sheets...</p>
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {view === 'dashboard' && <Dashboard data={data} onOrderClick={setSelectedOrder} />}
                {view === 'form' && <MaintenanceForm apiUrl={apiUrl} onComplete={() => setView('dashboard')} />}
                {view === 'orders' && <OrdersModule data={data} onOrderClick={setSelectedOrder} />}
                {view === 'planner' && <PlannerModule data={data} onOrderClick={setSelectedOrder} />}
                {view === 'technicians' && <TechniciansModule data={data} />}
                {view === 'history' && <HistoryModule data={data} />}
                {view === 'settings' && <SettingsModule currentUrl={apiUrl} onSave={handleSaveSettings} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            apiUrl={apiUrl}
            onUpdate={() => {
              setSelectedOrder(null);
              loadData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Pages ---

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Decorative Lines */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-white" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-white" />
        <div className="absolute top-2/4 left-0 w-full h-px bg-white" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-white" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl w-full text-center z-10"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 md:mb-12"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Industrial Ecosystem v2.0</span>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white tracking-tighter mb-6 md:mb-10 leading-[0.85] uppercase">
          Manteni<span className="text-blue-600">Pro</span>
        </h1>
        
        <p className="text-base md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto mb-12 md:mb-16 leading-relaxed px-4">
          La plataforma definitiva para la gestión de activos industriales. <br className="hidden md:block" />
          Potencia tu mantenimiento con analítica predictiva y control total.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 px-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto group relative px-10 md:px-16 py-5 md:py-7 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm overflow-hidden shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Iniciar Operaciones
          </button>
          
          <div className="w-full sm:w-auto flex items-center justify-center gap-6 md:gap-10 px-8 py-5 md:py-7 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
            <div className="text-left">
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Uptime</p>
              <p className="text-white font-bold text-sm md:text-base">99.99%</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-left">
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Soporte</p>
              <p className="text-white font-bold text-sm md:text-base">24/7 RT</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Industrial Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Bottom Label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
        <p className="text-[10px] font-black text-white uppercase tracking-[1em]">Engineering Excellence</p>
      </div>
    </div>
  );
}

function Dashboard({ data, onOrderClick }: { data: AppData | null, onOrderClick: (order: any) => void }) {
  if (!data) return null;

  const stats = {
    pendientes: data.solicitudes.filter(s => s.Estado === 'Pendiente').length,
    proceso: data.solicitudes.filter(s => s.Estado === 'En proceso').length,
    resueltas: data.solicitudes.filter(s => s.Estado === 'Resuelto').length,
    costoTotal: data.historial.reduce((acc, h) => acc + (h.Costo_Final || 0), 0),
    downtimeTotal: data.historial.reduce((acc, h) => acc + (h.Tiempo_Parada_Minutos || 0), 0),
  };

  const chartData = [
    { name: 'Lun', solicitudes: 4, resueltas: 2, costo: 400 },
    { name: 'Mar', solicitudes: 7, resueltas: 5, costo: 1200 },
    { name: 'Mie', solicitudes: 5, resueltas: 4, costo: 800 },
    { name: 'Jue', solicitudes: 8, resueltas: 6, costo: 1500 },
    { name: 'Vie', solicitudes: 12, resueltas: 8, costo: 2200 },
    { name: 'Sab', solicitudes: 3, resueltas: 3, costo: 300 },
    { name: 'Dom', solicitudes: 1, resueltas: 1, costo: 100 },
  ];

  const pieData = [
    { name: 'Pendiente', value: stats.pendientes, color: '#f43f5e' },
    { name: 'En proceso', value: stats.proceso, color: '#3b82f6' },
    { name: 'Resuelto', value: stats.resueltas, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Órdenes Críticas" value={stats.pendientes} icon={ShieldAlert} color="bg-rose-500" trend={-5} />
        <StatCard title="Costo Operativo" value={`$${stats.costoTotal.toLocaleString()}`} icon={DollarSign} color="bg-emerald-500" trend={12} subtitle="USD" />
        <StatCard title="Downtime Total" value={Math.round(stats.downtimeTotal / 60)} icon={Activity} color="bg-amber-500" trend={-8} subtitle="Horas" />
        <StatCard title="Eficiencia" value="94.2%" icon={Zap} color="bg-blue-500" trend={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 glass-card p-5 md:p-8 rounded-3xl md:rounded-[40px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
            <div>
              <h3 className="font-black text-white text-lg md:text-xl tracking-tight">Análisis de Costos vs Actividad</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Reporte Semanal de Gerencia</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-blue-400 uppercase">Solicitudes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Costos</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#16191E', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}
                  itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="costo" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCost)" />
                <Area type="monotone" dataKey="solicitudes" stroke="#3b82f6" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 md:p-8 rounded-3xl md:rounded-[40px] flex flex-col">
          <h3 className="font-black text-white text-lg md:text-xl tracking-tight mb-2">Distribución de Carga</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 md:mb-10">Estado de Operaciones</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-4xl font-black text-white tracking-tighter">{data.solicitudes.length}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Órdenes</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {pieData.map(item => (
              <div key={item.name} className="text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase mb-1">{item.name}</div>
                <div className="text-lg font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-xl tracking-tight">Monitor de Órdenes en Tiempo Real</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Últimas 24 Horas</p>
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all border border-white/5">
            Ver Todo el Registro
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">ID</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Activo / Equipo</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Impacto</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Prioridad</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.solicitudes.slice(0, 6).map((s, i) => (
                <tr 
                  key={i} 
                  onClick={() => onOrderClick(s)}
                  className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5 font-mono text-xs text-slate-500">#{s.ID.slice(0, 8)}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                        {s.Tipo === 'Maquinaria' ? <Factory size={14} className="text-blue-500" /> : <Building2 size={14} className="text-slate-400" />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{s.Area_Equipo}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{s.Elemento_Falla}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      s.Impacto_Produccion === 'Total' ? "bg-rose-500/10 text-rose-500" : s.Impacto_Produccion === 'Parcial' ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-400"
                    )}>
                      {s.Impacto_Produccion || 'No definido'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        s.Prioridad === 'Crítica' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : s.Prioridad === 'Alta' ? "bg-amber-500" : "bg-slate-500"
                      )} />
                      <span className="text-xs font-bold text-slate-300">{s.Prioridad}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                      s.Estado === 'Pendiente' ? "bg-rose-500/10 text-rose-500" : s.Estado === 'En proceso' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {s.Estado}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MaintenanceForm({ apiUrl, onComplete }: { apiUrl: string, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'Infraestructura' | 'Maquinaria'>('Infraestructura');
  const [formData, setFormData] = useState<any>({
    prioridad: 'Media',
    descripcion: '',
    impacto: 'No',
    nombre: '',
    rol: '',
    imagen: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, imagen: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.rol) {
      alert('Por favor completa tu nombre y rol.');
      return;
    }
    setIsSubmitting(true);
    await submitSolicitud(apiUrl, { 
      tipo: type, 
      ...formData,
      Impacto_Produccion: formData.impacto,
      Imagen: formData.imagen,
      Rol_Solicitante: formData.rol,
      Solicitante_Nombre: formData.nombre
    });
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 pb-20">
      <div className="mb-8 md:mb-12">
        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Orden de Trabajo</h3>
        <p className="text-slate-500 font-medium text-sm md:text-base">Generación de reporte técnico para intervención de activos.</p>
      </div>

      <div className="glass-card p-6 md:p-12 rounded-[32px] md:rounded-[48px]">
        {step === 1 ? (
          <div className="space-y-8 md:space-y-10">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center md:text-left">Categoría del Activo</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              <button 
                onClick={() => { setType('Infraestructura'); setStep(2); }}
                className={cn(
                  "p-6 md:p-10 rounded-[24px] md:rounded-[32px] border-2 transition-all flex flex-col items-center group relative overflow-hidden",
                  type === 'Infraestructura' ? "border-blue-500 bg-blue-500/5" : "border-white/5 hover:border-white/10"
                )}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Building2 size={32} className="text-blue-500 md:hidden" />
                  <Building2 size={40} className="text-blue-500 hidden md:block" />
                </div>
                <span className="font-black text-white text-lg md:text-xl">Infraestructura</span>
                <p className="text-[10px] md:text-xs text-slate-500 mt-2 font-medium">Edificios, Instalaciones, Redes</p>
              </button>
              <button 
                onClick={() => { setType('Maquinaria'); setStep(2); }}
                className={cn(
                  "p-6 md:p-10 rounded-[24px] md:rounded-[32px] border-2 transition-all flex flex-col items-center group relative overflow-hidden",
                  type === 'Maquinaria' ? "border-blue-500 bg-blue-500/5" : "border-white/5 hover:border-white/10"
                )}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Factory size={32} className="text-blue-500 md:hidden" />
                  <Factory size={40} className="text-blue-500 hidden md:block" />
                </div>
                <span className="font-black text-white text-lg md:text-xl">Maquinaria</span>
                <p className="text-[10px] md:text-xs text-slate-500 mt-2 font-medium">Equipos, Motores, Líneas</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            {/* User Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 p-6 bg-white/5 rounded-3xl border border-white/5">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tu Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    required
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="w-full p-4 pl-12 bg-white/5 border border-white/5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tu Rol</label>
                <select 
                  required
                  className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  onChange={e => setFormData({...formData, rol: e.target.value})}
                >
                  <option value="" className="bg-[#16191E]">Seleccionar Rol...</option>
                  {ROLES.map(rol => (
                    <option key={rol} value={rol} className="bg-[#16191E]">{rol}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                    {type === 'Infraestructura' ? 'Área / Ubicación' : 'Equipo / Activo'}
                  </label>
                  <select 
                    required
                    className="w-full p-4 md:p-5 bg-white/5 border border-white/5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, area: e.target.value})}
                  >
                    <option value="" className="bg-[#16191E]">Seleccionar...</option>
                    {(type === 'Infraestructura' ? AREAS_INFRAESTRUCTURA : EQUIPOS_MAQUINARIA).map(opt => (
                      <option key={opt} value={opt} className="bg-[#16191E]">{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                    {type === 'Infraestructura' ? 'Elemento Crítico' : 'Naturaleza de la Falla'}
                  </label>
                  <select 
                    required
                    className="w-full p-4 md:p-5 bg-white/5 border border-white/5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    onChange={e => setFormData({...formData, elemento: e.target.value})}
                  >
                    <option value="" className="bg-[#16191E]">Seleccionar...</option>
                    {(type === 'Infraestructura' ? ELEMENTOS_INFRAESTRUCTURA : TIPOS_FALLA_MAQUINARIA).map(opt => (
                      <option key={opt} value={opt} className="bg-[#16191E]">{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Impacto en Producción</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {['No', 'Parcial', 'Total'].map(imp => (
                      <button
                        key={imp}
                        type="button"
                        onClick={() => setFormData({...formData, impacto: imp})}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          formData.impacto === imp 
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" 
                            : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                        )}
                      >
                        {imp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Nivel de Prioridad</label>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {PRIORIDADES.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({...formData, prioridad: p})}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          formData.prioridad === p 
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" 
                            : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Evidencia Fotográfica</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 transition-all">
                        <Camera size={24} className="text-slate-500 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subir Imagen</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </div>
                    </label>
                    {imagePreview && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Descripción Técnica</label>
              <textarea 
                required
                rows={3}
                className="w-full p-4 md:p-5 bg-white/5 border border-white/5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Detalles específicos del síntoma o falla..."
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Volver
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando Reporte...' : 'Generar Orden de Trabajo'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-12 glass-card p-6 md:p-10 rounded-[32px] md:rounded-[48px] flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shrink-0 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          <QRCodeSVG value={window.location.href} size={120} className="md:w-[140px] md:h-[140px]" />
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 tracking-tight">Reporte Móvil Industrial</h4>
          <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
            Despliega este QR en puntos estratégicos de la planta. Permite a los operarios reportar incidencias críticas en tiempo real sin necesidad de terminales fijas.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrdersModule({ data, onOrderClick }: { data: AppData | null, onOrderClick: (order: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPriority, setFilterPriority] = useState('Todos');
  const [filterTech, setFilterTech] = useState('Todos');
  const [sortBy, setSortBy] = useState<'fecha' | 'prioridad'>('fecha');

  if (!data) return null;

  const filteredOrders = data.solicitudes
    .filter(s => {
      const matchesSearch = s.Area_Equipo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.Descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Todos' || s.Estado === filterStatus;
      const matchesPriority = filterPriority === 'Todos' || s.Prioridad === filterPriority;
      const matchesTech = filterTech === 'Todos' || s.Tecnico_asignado === filterTech;
      return matchesSearch && matchesStatus && matchesPriority && matchesTech;
    })
    .sort((a, b) => {
      if (sortBy === 'fecha') {
        return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
      } else {
        const priorityMap: any = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
        return priorityMap[b.Prioridad] - priorityMap[a.Prioridad];
      }
    });

  const technicians = Array.from(new Set(data.solicitudes.map(s => s.Tecnico_asignado).filter(Boolean)));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Gestión de Órdenes</h3>
          <p className="text-slate-500 font-medium">Explora, filtra y gestiona el historial completo de solicitudes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar por ID, equipo o falla..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-[300px] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado</label>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="Todos" className="bg-[#16191E]">Todos los Estados</option>
            <option value="Pendiente" className="bg-[#16191E]">Pendiente</option>
            <option value="En proceso" className="bg-[#16191E]">En proceso</option>
            <option value="Resuelto" className="bg-[#16191E]">Resuelto</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioridad</label>
          <select 
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="Todos" className="bg-[#16191E]">Todas las Prioridades</option>
            <option value="Baja" className="bg-[#16191E]">Baja</option>
            <option value="Media" className="bg-[#16191E]">Media</option>
            <option value="Alta" className="bg-[#16191E]">Alta</option>
            <option value="Crítica" className="bg-[#16191E]">Crítica</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Técnico</label>
          <select 
            value={filterTech}
            onChange={e => setFilterTech(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="Todos" className="bg-[#16191E]">Todos los Técnicos</option>
            {technicians.map(t => <option key={t} value={t} className="bg-[#16191E]">{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ordenar por</label>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setSortBy('fecha')}
              className={cn(
                "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                sortBy === 'fecha' ? "bg-white/10 text-white" : "text-slate-500"
              )}
            >
              Fecha
            </button>
            <button 
              onClick={() => setSortBy('prioridad')}
              className={cn(
                "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                sortBy === 'prioridad' ? "bg-white/10 text-white" : "text-slate-500"
              )}
            >
              Prioridad
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">ID / Fecha</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Activo / Equipo</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Técnico</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Prioridad</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-medium italic">No se encontraron órdenes con los filtros seleccionados.</td>
                </tr>
              ) : (
                filteredOrders.map((s) => (
                  <tr key={s.ID} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-mono text-xs text-slate-500 mb-1">#{s.ID.slice(0, 8)}</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(s.Fecha).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                          {s.Tipo === 'Maquinaria' ? <Factory size={18} className="text-blue-500" /> : <Building2 size={18} className="text-slate-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{s.Area_Equipo}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{s.Elemento_Falla}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                          {s.Tecnico_asignado ? s.Tecnico_asignado.charAt(0) : '?'}
                        </div>
                        <span className="text-xs font-bold text-slate-300">{s.Tecnico_asignado || 'Sin asignar'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        s.Prioridad === 'Crítica' ? "bg-rose-500/10 text-rose-500" : 
                        s.Prioridad === 'Alta' ? "bg-amber-500/10 text-amber-500" : 
                        "bg-slate-500/10 text-slate-400"
                      )}>
                        {s.Prioridad}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", 
                          s.Estado === 'Resuelto' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                          s.Estado === 'En proceso' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : 
                          "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                        )} />
                        <span className="text-xs font-bold text-slate-300">{s.Estado}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => onOrderClick(s)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all border border-white/5"
                      >
                        Ver Detalles <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlannerModule({ data, onOrderClick }: { data: AppData | null, onOrderClick: (order: any) => void }) {
  const [activeTab, setActiveTab] = useState<'kanban' | 'annual'>('kanban');

  if (!data) return null;

  const kanbanColumns = [
    { id: 'Pendiente', title: 'Pendiente', color: 'bg-rose-500' },
    { id: 'En proceso', title: 'En Curso', color: 'bg-blue-500' },
    { id: 'Resuelto', title: 'Completado', color: 'bg-emerald-500' },
  ];

  const annualTasks = [
    { id: '1', asset: 'Robot Soldador Kuka', date: '2024-06-15', duration: '5 días', type: 'Anual', status: 'Programado' },
    { id: '2', asset: 'Compresor Central', date: '2024-08-10', duration: '2 días', type: 'Semestral', status: 'Programado' },
    { id: '3', asset: 'Línea de Ensamble 01', date: '2024-12-01', duration: '10 días', type: 'Overhaul', status: 'Programado' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Planificador Estratégico</h3>
          <p className="text-slate-500 font-medium">Gestión de flujo operativo y mantenimientos a largo plazo.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'kanban' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Kanban
          </button>
          <button 
            onClick={() => setActiveTab('annual')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'annual' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Anual
          </button>
        </div>
      </div>

      {activeTab === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {kanbanColumns.map(col => (
            <div key={col.id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <h4 className="font-black text-white uppercase tracking-widest text-xs">{col.title}</h4>
                </div>
                <span className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500">
                  {data.solicitudes.filter(s => s.Estado === col.id).length}
                </span>
              </div>
              
              <div className="space-y-4 min-h-[500px] p-2 bg-white/[0.02] rounded-[32px] border border-white/5">
                {data.solicitudes.filter(s => s.Estado === col.id).map(s => (
                  <div 
                    key={s.ID} 
                    onClick={() => onOrderClick(s)}
                    className="glass-card p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">#{s.ID.slice(0,6)}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase",
                        s.Prioridad === 'Crítica' ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {s.Prioridad}
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-sm mb-1 group-hover:text-blue-400 transition-colors">{s.Area_Equipo}</h5>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{s.Descripcion}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {s.Tecnico_asignado ? s.Tecnico_asignado.charAt(0) : '?'}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{s.Tecnico_asignado || 'Sin asignar'}</span>
                      </div>
                      <Clock size={12} className="text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[40px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-xl tracking-tight">Cronograma de Mantenimiento Mayor</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Planificación Anual de Activos Críticos</p>
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
              Programar Intervención
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Activo</th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Fecha Inicio</th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Duración</th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Tipo</th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {annualTasks.map(task => (
                  <tr key={task.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                          <Factory size={20} />
                        </div>
                        <span className="font-bold text-white">{task.asset}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400 font-medium">{task.date}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-slate-300 border border-white/5">{task.duration}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{task.type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-xs font-bold text-slate-300">{task.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TechniciansModule({ data }: { data: AppData | null }) {
  if (!data) return null;
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar por nombre o especialidad..."
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
          />
        </div>
        <button className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
          Registrar Nuevo Técnico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.tecnicos.map((t, i) => (
          <div key={i} className="glass-card p-8 rounded-[40px] group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <div className={cn(
                "w-2 h-2 rounded-full",
                t.Estado === 'Activo' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-600"
              )} />
            </div>
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                <Users size={32} />
              </div>
              <div className="ml-5">
                <h4 className="font-black text-white text-lg tracking-tight">{t.Nombre}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{t.Especialidad}</p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Disponibilidad</span>
                <span className="text-emerald-500 font-black uppercase">Inmediata</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-blue-600" />
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all border border-white/5">
              Asignar Tareas
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryModule({ data }: { data: AppData | null }) {
  if (!data) return null;
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[32px]">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MTTR Promedio</h4>
          <p className="text-3xl font-black text-white tracking-tighter">124 <span className="text-sm font-medium text-slate-500">min</span></p>
        </div>
        <div className="glass-card p-8 rounded-[32px]">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MTBF Actual</h4>
          <p className="text-3xl font-black text-white tracking-tighter">18.5 <span className="text-sm font-medium text-slate-500">días</span></p>
        </div>
        <div className="glass-card p-8 rounded-[32px]">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Repuestos Utilizados</h4>
          <p className="text-3xl font-black text-white tracking-tighter">42 <span className="text-sm font-medium text-slate-500">items</span></p>
        </div>
      </div>

      <div className="glass-card rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-xl tracking-tight">Registro Histórico de Intervenciones</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Auditoría Técnica</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
            <Download size={14} /> Exportar Reporte
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Fecha Cierre</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Activo</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Técnico Responsable</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Costo Final</th>
                <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Downtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.historial.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium italic">No se han registrado cierres de órdenes aún.</td>
                </tr>
              ) : (
                data.historial.map((h, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium">{new Date(h.Fecha_cierre).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-bold text-white">#{h.Solicitud.slice(0, 8)}</td>
                    <td className="px-8 py-5 text-sm text-slate-300 font-semibold">{h.Tecnico}</td>
                    <td className="px-8 py-5">
                      <span className="text-emerald-500 font-black text-sm">${h.Costo_Final?.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-amber-500 font-black text-sm">{h.Tiempo_Parada_Minutos} min</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsModule({ currentUrl, onSave }: { currentUrl: string, onSave: (url: string) => void }) {
  const [url, setUrl] = useState(currentUrl);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetup = async () => {
    if (!url) {
      alert('Primero guarda la URL de la Web App');
      return;
    }
    setIsSettingUp(true);
    const result = await setupDatabase(url);
    if (result.success) {
      alert('¡Tablas configuradas correctamente en tu Google Sheets!');
    } else {
      alert('Hubo un error al configurar las tablas. Revisa la consola.');
    }
    setIsSettingUp(false);
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div className="glass-card p-10 rounded-[40px]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="font-black text-white text-xl tracking-tight">Configuración del Sistema</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Infraestructura y Enlaces</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center text-sm uppercase tracking-wider">
              <Clock size={16} className="mr-2" /> Pasos para conectar:
            </h4>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal ml-4 leading-relaxed">
              <li>Crea una nueva hoja de Google Sheets.</li>
              <li>Ve a Extensiones {'>'} Apps Script.</li>
              <li>Copia el código del archivo <code className="bg-white/10 px-1 rounded text-blue-400">googleAppsScript.ts</code>.</li>
              <li>Haz clic en "Implementar" {'>'} "Nueva implementación" {'>'} "Aplicación web".</li>
              <li>Configura el acceso para "Cualquiera" y publica.</li>
              <li>Copia la URL generada y pégala aquí abajo.</li>
              <li className="font-bold text-blue-400">Haz clic en el botón "Configurar Tablas" para crear las columnas automáticamente.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Google Apps Script Web App URL</label>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => onSave(url)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all border border-white/10"
                >
                  Guardar
                </button>
                <button 
                  onClick={handleSetup}
                  disabled={isSettingUp}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSettingUp ? '...' : 'Configurar Tablas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[40px]">
        <h3 className="font-black text-white text-lg tracking-tight mb-6">Estado de la Conexión</h3>
        <div className="flex items-center gap-3 text-emerald-500">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]",
            url ? "bg-emerald-500" : "bg-rose-500"
          )} />
          <span className="text-xs font-black uppercase tracking-widest">
            {url ? 'Servidor Operativo' : 'Sin Conexión'}
          </span>
        </div>
      </div>
    </div>
  );
}

