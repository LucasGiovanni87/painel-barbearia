import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './App.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { data } = await supabase
      .from('barbeiros')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .single()
    if (data) {
      onLogin(data)
    } else {
      setErro('Email ou senha incorretos.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 340, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Barbearia</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Faça login para continuar</p>
        <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888' }}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }} />
          </div>
          {erro && <p style={{ color: 'red', fontSize: 13, margin: 0 }}>{erro}</p>}
          <button type="submit" disabled={loading} style={{ padding: 10, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15, marginTop: 8 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PainelDono({ usuario, onSair }) {
  const [tela, setTela] = useState('painel')
  const [barbeiros, setBarbeiros] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [barbeiroEscolhido, setBarbeiroEscolhido] = useState('')
  const [servico, setServico] = useState('Corte')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')

  const horarios = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

  useEffect(() => {
    buscarBarbeiros()
    buscarAgendamentos()
  }, [])

  async function buscarBarbeiros() {
    const { data } = await supabase.from('barbeiros').select('*').eq('ativo', true)
    if (data) setBarbeiros(data)
  }

  async function buscarAgendamentos() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('agendamentos')
      .select('*, barbeiros(nome)')
      .eq('data', hoje)
      .order('horario')
    if (data) setAgendamentos(data)
  }

  async function cadastrarBarbeiro(e) {
    e.preventDefault()
    if (!nome || !email || !senha) return alert('Preencha nome, email e senha!')
    setLoading(true)
    const { error } = await supabase.from('barbeiros').insert({ nome, telefone, email, senha, tipo: 'barbeiro' })
    if (!error) {
      setNome(''); setTelefone(''); setEmail(''); setSenha('')
      setMostrarForm(false)
      buscarBarbeiros()
    }
    setLoading(false)
  }

  async function cadastrarAgendamento(e) {
    e.preventDefault()
    if (!clienteNome || !barbeiroEscolhido || !data || !horario) return alert('Preencha todos os campos!')
    setLoading(true)
    const { error } = await supabase.from('agendamentos').insert({
      cliente_nome: clienteNome, cliente_telefone: clienteTelefone,
      barbeiro_id: barbeiroEscolhido, servico, data, horario, status: 'pendente'
    })
    if (!error) {
      alert('Agendamento realizado!')
      setClienteNome(''); setClienteTelefone(''); setBarbeiroEscolhido('')
      setServico('Corte'); setData(''); setHorario('')
      setTela('painel'); buscarAgendamentos()
    }
    setLoading(false)
  }

  async function confirmarAgendamento(id) {
    await supabase.from('agendamentos').update({ status: 'confirmado' }).eq('id', id)
    buscarAgendamentos()
  }

  async function cancelarAgendamento(id) {
    await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id)
    buscarAgendamentos()
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Barbearia</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 13 }}>Olá, {usuario.nome} 👑</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTela('painel')} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', background: tela === 'painel' ? '#1a1a1a' : '#fff', color: tela === 'painel' ? '#fff' : '#000', cursor: 'pointer' }}>Painel</button>
          <button onClick={() => setTela('agendar')} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', background: tela === 'agendar' ? '#1a1a1a' : '#fff', color: tela === 'agendar' ? '#fff' : '#000', cursor: 'pointer' }}>+ Agendamento</button>
          <button onClick={onSair} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {tela === 'painel' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 16 }}>
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Agendamentos hoje</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{agendamentos.length}</p>
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 16 }}>
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Confirmados</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: 'green' }}>{agendamentos.filter(a => a.status === 'confirmado').length}</p>
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 16 }}>
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Barbeiros ativos</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{barbeiros.length}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 16, marginBottom: 16 }}>Agendamentos de hoje</h2>
              {agendamentos.length === 0 && <p style={{ color: '#aaa' }}>Nenhum agendamento hoje.</p>}
              {agendamentos.map(a => (
                <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{a.horario.slice(0, 5)} — {a.cliente_nome}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{a.barbeiros?.nome} • {a.servico}</p>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: a.status === 'confirmado' ? '#e6f4ea' : a.status === 'cancelado' ? '#fdecea' : '#fff8e1', color: a.status === 'confirmado' ? 'green' : a.status === 'cancelado' ? 'red' : '#f57c00' }}>{a.status}</span>
                  </div>
                  {a.status === 'pendente' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => confirmarAgendamento(a.id)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}>Confirmar</button>
                      <button onClick={() => cancelarAgendamento(a.id)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 16, marginBottom: 16 }}>Barbeiros</h2>
              {barbeiros.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#3949ab' }}>
                    {b.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{b.nome}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{b.email}</p>
                  </div>
                </div>
              ))}
              {mostrarForm ? (
                <form onSubmit={cadastrarBarbeiro} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
                  <input placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
                  <input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
                  <input placeholder="Senha *" value={senha} onChange={e => setSenha(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: 8, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{loading ? 'Salvando...' : 'Salvar'}</button>
                    <button type="button" onClick={() => setMostrarForm(false)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setMostrarForm(true)} style={{ marginTop: 12, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', background: '#fff' }}>+ Cadastrar barbeiro</button>
              )}
            </div>
          </div>
        </>
      )}

      {tela === 'agendar' && (
        <div style={{ maxWidth: 500, margin: '0 auto', border: '1px solid #eee', borderRadius: 10, padding: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Novo agendamento</h2>
          <form onSubmit={cadastrarAgendamento} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#888' }}>Nome do cliente *</label>
              <input value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Ex: Lucas Mendes" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888' }}>Telefone</label>
              <input value={clienteTelefone} onChange={e => setClienteTelefone(e.target.value)} placeholder="(11) 99999-0000" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888' }}>Barbeiro *</label>
              <select value={barbeiroEscolhido} onChange={e => setBarbeiroEscolhido(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }}>
                <option value="">Escolha o barbeiro</option>
                {barbeiros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888' }}>Serviço *</label>
              <select value={servico} onChange={e => setServico(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }}>
                <option>Corte</option>
                <option>Barba</option>
                <option>Corte + Barba</option>
                <option>Pigmentação</option>
                <option>Sobrancelha</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888' }}>Data *</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888' }}>Horário *</label>
              <select value={horario} onChange={e => setHorario(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, boxSizing: 'border-box' }}>
                <option value="">Escolha o horário</option>
                {horarios.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 8, padding: 12, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>
              {loading ? 'Salvando...' : 'Confirmar agendamento'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function PainelBarbeiro({ usuario, onSair }) {
  const [agendamentos, setAgendamentos] = useState([])
  const [visualizacao, setVisualizacao] = useState('dia')

  // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
    buscarAgendamentos() // eslint-disable-line
  }, [visualizacao]) // eslint-disable-line

  async function buscarAgendamentos() {
    const hoje = new Date().toISOString().split('T')[0]
    const fimSemana = new Date()
    fimSemana.setDate(fimSemana.getDate() + 6)
    const fim = fimSemana.toISOString().split('T')[0]

    let query = supabase
      .from('agendamentos')
      .select('*')
      .eq('barbeiro_id', usuario.id)
      .order('data').order('horario')

    if (visualizacao === 'dia') {
      query = query.eq('data', hoje)
    } else {
      query = query.gte('data', hoje).lte('data', fim)
    }

    const { data } = await query
    if (data) setAgendamentos(data)
  }

  async function confirmar(id) {
    await supabase.from('agendamentos').update({ status: 'confirmado' }).eq('id', id)
    buscarAgendamentos()
  }

  async function cancelar(id) {
    await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', id)
    buscarAgendamentos()
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Olá, {usuario.nome}! ✂️</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 13 }}>Seus agendamentos</p>
        </div>
        <button onClick={onSair} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>Sair</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 16 }}>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Total</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{agendamentos.length}</p>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 16 }}>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Confirmados</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: 'green' }}>{agendamentos.filter(a => a.status === 'confirmado').length}</p>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 16 }}>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Pendentes</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: '#f57c00' }}>{agendamentos.filter(a => a.status === 'pendente').length}</p>
        </div>
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Agendamentos</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setVisualizacao('dia')} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: visualizacao === 'dia' ? '#1a1a1a' : '#fff', color: visualizacao === 'dia' ? '#fff' : '#000', cursor: 'pointer' }}>Hoje</button>
            <button onClick={() => setVisualizacao('semana')} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: visualizacao === 'semana' ? '#1a1a1a' : '#fff', color: visualizacao === 'semana' ? '#fff' : '#000', cursor: 'pointer' }}>Semana</button>
          </div>
        </div>

        {agendamentos.length === 0 && <p style={{ color: '#aaa' }}>Nenhum agendamento {visualizacao === 'dia' ? 'hoje' : 'essa semana'}.</p>}
        {agendamentos.map(a => (
          <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{a.data} às {a.horario.slice(0, 5)}</p>
                <p style={{ margin: 0, fontSize: 14, color: '#444' }}>{a.cliente_nome} • {a.servico}</p>
                {a.cliente_telefone && <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{a.cliente_telefone}</p>}
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: a.status === 'confirmado' ? '#e6f4ea' : a.status === 'cancelado' ? '#fdecea' : '#fff8e1', color: a.status === 'confirmado' ? 'green' : a.status === 'cancelado' ? 'red' : '#f57c00' }}>{a.status}</span>
            </div>
            {a.status === 'pendente' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => confirmar(a.id)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}>Confirmar</button>
                <button onClick={() => cancelar(a.id)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>Cancelar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [usuario, setUsuario] = useState(null)

  function onLogin(user) {
    setUsuario(user)
  }

  function onSair() {
    setUsuario(null)
  }

  if (!usuario) return <Login onLogin={onLogin} />
  if (usuario.tipo === 'dono') return <PainelDono usuario={usuario} onSair={onSair} />
  return <PainelBarbeiro usuario={usuario} onSair={onSair} />
}

export default App 