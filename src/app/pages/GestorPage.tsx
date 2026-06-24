import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Users, Shield, UserCheck, UserX, Search, RefreshCw, ArrowLeft,
  Plus, Edit3, CheckCircle, AlertCircle, Loader, ChevronDown,
  BookOpen, Eye, Star, BarChart3, Filter, X, Mail, Calendar,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  loadAdminUsersFromBackend,
  updateUserRoleBackend,
  createAdminUserBackend,
} from '../data/backendApi';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS, type User } from '../data/mockData';
import { ROLE_LABELS, type BackendUserRole, PROMOTABLE_ROLES } from '../data/roles';

/* ─── Role config ─── */
const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: typeof Shield }> = {
  ESCRITOR:  { color: '#7B1D2D', bg: '#FDF0F2', label: 'Escritor',  icon: BookOpen },
  REVISOR:   { color: '#1A4A3A', bg: '#F0F7F4', label: 'Revisor',   icon: Eye },
  APROVADOR: { color: '#5C3A00', bg: '#FFF8E6', label: 'Aprovador', icon: Star },
  ADMIN:     { color: '#1E3A5F', bg: '#EFF6FF', label: 'Admin',     icon: Shield },
  SUPERADMIN:{ color: '#4C1D95', bg: '#F5F3FF', label: 'SuperAdmin',icon: Shield },
  ESTUDANTE: { color: '#374151', bg: '#F3F4F6', label: 'Estudante', icon: Users },
};

const INITIAL_FORM = {
  name: '', email: '', password: '',
  role: 'ESCRITOR' as BackendUserRole,
  province: 'Luanda',
};

/** Roles que o Admin (não superadmin) pode gerir */
const MANAGED_ROLES = new Set(['ESCRITOR', 'REVISOR', 'APROVADOR', 'ESTUDANTE']);

/** Roles que o Admin pode atribuir */
const ASSIGNABLE_BY_ADMIN: BackendUserRole[] = ['ESTUDANTE', 'ESCRITOR', 'REVISOR', 'APROVADOR'];

export function GestorPage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [newRoleFor, setNewRoleFor] = useState<Record<string, BackendUserRole>>({});

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const loaded = await loadAdminUsersFromBackend();
      setUsers(loaded);
    } catch {
      setUsers([...MOCK_USERS]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F0EBE8' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
            <Shield size={32} style={{ color: '#1E3A5F' }} />
          </div>
          <h2 className="text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-gray-500 mb-6">Esta área é exclusiva para Administradores.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full text-white font-medium" style={{ backgroundColor: '#7B1D2D' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  /* ─── Derived lists ─── */
  const visibleUsers = users.filter(u => {
    // Admin vê apenas roles geridas por ele (não outros admins ou superadmin, a menos que seja superadmin)
    if (!isSuperAdmin && !MANAGED_ROLES.has(u.role as string)) return false;
    // SuperAdmin vê todos
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const stats = {
    total: visibleUsers.length,
    escritores: visibleUsers.filter(u => u.role === 'ESCRITOR').length,
    revisores: visibleUsers.filter(u => u.role === 'REVISOR').length,
    aprovadores: visibleUsers.filter(u => u.role === 'APROVADOR').length,
    estudantes: visibleUsers.filter(u => u.role === 'ESTUDANTE').length,
    ...(isSuperAdmin ? { admins: visibleUsers.filter(u => u.role === 'ADMIN').length } : {}),
  };

  /* ─── Actions ─── */
  const handlePromote = async (targetUser: User) => {
    const newRole = newRoleFor[targetUser.id];
    if (!newRole || newRole === targetUser.role) return;

    // Admin não pode promover para ADMIN ou SUPERADMIN
    if (!isSuperAdmin && (newRole === 'ADMIN' || newRole === 'SUPERADMIN')) {
      showNotif('error', 'Apenas o Super Admin pode atribuir o papel de Administrador.');
      return;
    }
    if (targetUser.role === 'SUPERADMIN') {
      showNotif('error', 'Não é possível alterar o papel de outro Super Admin.');
      return;
    }

    setProcessing(targetUser.id);
    setPromotingId(targetUser.id);
    try {
      await updateUserRoleBackend(targetUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      setNewRoleFor(prev => { const n = { ...prev }; delete n[targetUser.id]; return n; });
      showNotif('success', `${targetUser.name} é agora ${ROLE_LABELS[newRole]}.`);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao alterar papel.');
    } finally {
      setProcessing(null);
      setPromotingId(null);
    }
  };

  const handleCreateUser = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      showNotif('error', 'Preencha todos os campos. Senha mínima de 6 caracteres.');
      return;
    }
    if (users.find(u => u.email === form.email.trim())) {
      showNotif('error', 'Já existe um utilizador com esse email.');
      return;
    }
    // Admin não pode criar ADMIN ou SUPERADMIN
    if (!isSuperAdmin && (form.role === 'ADMIN' || form.role === 'SUPERADMIN')) {
      showNotif('error', 'Apenas o Super Admin pode criar Administradores.');
      return;
    }
    setProcessing('new');
    try {
      await createAdminUserBackend({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        preferredLanguage: 'pt',
      });
      await load();
      setShowModal(false);
      setForm(INITIAL_FORM);
      showNotif('success', `Utilizador "${form.name}" criado com sucesso!`);
    } catch (err) {
      showNotif('error', err instanceof Error ? err.message : 'Erro ao criar utilizador.');
    } finally {
      setProcessing(null);
    }
  };

  const assignableRoles: BackendUserRole[] = isSuperAdmin ? PROMOTABLE_ROLES : ASSIGNABLE_BY_ADMIN;
  const filterRoles = isSuperAdmin
    ? ['all', 'ESCRITOR', 'REVISOR', 'APROVADOR', 'ADMIN', 'ESTUDANTE']
    : ['all', 'ESCRITOR', 'REVISOR', 'APROVADOR', 'ESTUDANTE'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EBE8' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-md" style={{ backgroundColor: '#1E3A5F', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3B82F6' }}>
            <Users size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">
              Painel do {isSuperAdmin ? 'Super Admin' : 'Administrador'}
            </div>
            <div className="text-xs leading-tight" style={{ color: '#93C5FD' }}>Gestão de Utilizadores · Economia com História Angola</div>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#3B82F6', color: 'white' }}>
            <Plus size={14} />
            Novo Utilizador
          </button>
          <div className="flex items-center gap-2 ml-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '')}&background=3B82F6&color=fff&size=56`}
              alt="" className="w-7 h-7 rounded-full"
            />
            <span className="text-white/80 text-xs hidden sm:block">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ backgroundColor: notification.type === 'success' ? '#1E3A5F' : '#7B1D2D', color: 'white' }}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {notification.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: '#1E3A5F', icon: Users },
            { label: 'Escritores', value: stats.escritores, color: '#7B1D2D', icon: BookOpen },
            { label: 'Revisores', value: stats.revisores, color: '#1A4A3A', icon: Eye },
            { label: 'Aprovadores', value: stats.aprovadores, color: '#5C3A00', icon: Star },
            { label: 'Estudantes', value: stats.estudantes, color: '#374151', icon: Users },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}18` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou email..."
              className="w-full pl-8 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterRoles.map(role => (
              <button key={role} onClick={() => setRoleFilter(role)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={roleFilter === role
                  ? { backgroundColor: '#1E3A5F', color: 'white' }
                  : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                {role === 'all' ? 'Todos' : ROLE_CONFIG[role]?.label ?? role}
              </button>
            ))}
            <button onClick={load} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" title="Actualizar">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader size={28} className="animate-spin mx-auto mb-3 text-blue-500" />
              <p className="text-gray-500 text-sm">A carregar utilizadores...</p>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100" style={{ backgroundColor: '#F8FAFC' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilizador</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Papel Atual</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Desde</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleUsers.map(u => {
                    const rc = ROLE_CONFIG[u.role as string] ?? ROLE_CONFIG['ESTUDANTE'];
                    const Icon = rc.icon;
                    const isMe = u.id === user?.id;
                    const selected = newRoleFor[u.id] ?? u.role as BackendUserRole;
                    const changed = selected !== u.role;
                    const canEdit = !isMe && u.role !== 'SUPERADMIN' && (isSuperAdmin || MANAGED_ROLES.has(u.role as string));

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Avatar + Name */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1E3A5F&color=fff&size=56`}
                              alt="" className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                {u.name}
                                {isMe && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Eu</span>}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Mail size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{u.email}</span>
                          </div>
                        </td>
                        {/* Current Role Badge */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: rc.bg, color: rc.color }}>
                            <Icon size={10} />
                            {rc.label}
                          </span>
                        </td>
                        {/* Join Date */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar size={11} className="text-gray-400" />
                            {u.joinedAt ?? '—'}
                          </div>
                        </td>
                        {/* Action: role selector + save */}
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit ? (
                              <>
                                <div className="relative">
                                  <select
                                    value={selected}
                                    onChange={e => setNewRoleFor(prev => ({ ...prev, [u.id]: e.target.value as BackendUserRole }))}
                                    className="appearance-none text-xs pl-2.5 pr-6 py-1.5 rounded-lg border font-medium cursor-pointer outline-none transition-colors"
                                    style={changed
                                      ? { borderColor: '#3B82F6', color: '#1E3A5F', backgroundColor: '#EFF6FF' }
                                      : { borderColor: '#E5E7EB', color: '#6B7280', backgroundColor: '#F9FAFB' }}>
                                    {assignableRoles.map(r => (
                                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                {changed && (
                                  <button
                                    onClick={() => handlePromote(u)}
                                    disabled={processing === u.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: '#1E3A5F', color: 'white' }}>
                                    {promotingId === u.id
                                      ? <Loader size={11} className="animate-spin" />
                                      : <CheckCircle size={11} />}
                                    Guardar
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                {isMe ? 'Você mesmo' : 'Sem permissão'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1E3A5F, #3B82F6)' }}>
              <div>
                <h3 className="text-white font-bold text-base">Novo Utilizador</h3>
                <p className="text-blue-200 text-xs mt-0.5">Criar conta na plataforma</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(INITIAL_FORM); }}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome completo</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  type="email" placeholder="utilizador@economia.ao"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Senha</label>
                <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  type="password" placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Papel</label>
                <div className="relative">
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as BackendUserRole }))}
                    className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-gray-50 cursor-pointer">
                    {assignableRoles.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {/* Role description */}
                <div className="mt-2 p-2.5 rounded-lg text-xs leading-relaxed"
                  style={{ backgroundColor: ROLE_CONFIG[form.role]?.bg, color: ROLE_CONFIG[form.role]?.color }}>
                  {form.role === 'ESCRITOR' && '✍️ Pode criar e submeter conteúdos para revisão.'}
                  {form.role === 'REVISOR' && '🔍 Analisa e aprova conteúdos submetidos pelos escritores.'}
                  {form.role === 'APROVADOR' && '✅ Publica conteúdos aprovados pelos revisores.'}
                  {form.role === 'ESTUDANTE' && '📚 Pode ler conteúdos publicados e participar em quizzes.'}
                  {form.role === 'ADMIN' && '⚙️ Gere utilizadores, escritores, revisores e aprovadores.'}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowModal(false); setForm(INITIAL_FORM); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCreateUser} disabled={processing === 'new'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1E3A5F, #3B82F6)' }}>
                  {processing === 'new' ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  Criar Utilizador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
