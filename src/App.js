import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './App.css'

const css = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .container { font-family: sans-serif; max-width: 900px; margin: 0 auto; padding: 16px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 8px; flex-wrap: wrap; }
  .header-title h1 { font-size: 22px; margin: 0; }
  .header-title p { color: #888; margin: 0; font-size: 13px; }
  .header-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
  .btn { padding: 8px 14px; border-radius: 6px; border: 1px solid #ddd; cursor: pointer; font-size: 13px; background: #fff; }
  .btn-dark { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
  .btn-red { border-color: #ffcdd2; color: #e53935; background: #fff; font-size: 12px; padding: 4px 10px; }
  .btn-confirm { background: #1a1a1a; color: #fff; border: none; font-size: 12px; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
  .btn-cancel { border: 1px solid #ddd; font-size: 12px; padding: 4px 12px; border-radius: 6px; cursor: pointer; background: #fff; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
  .card { background: #f5f5f5; border-radius: 10px; padding: 14px; }
  .card p { margin: 0; }
  .card-label { color: #888; font-size: 12px; }
  .card-value { font-size: 26px; font-weight: 600; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .box { border: 1px solid #eee; border-radius: 10px; padding: 16px; }
  .box h2 { font-size: 16px; margin: 0 0 14px; }
  .agendamento-item { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
  .agendamento-row { display: flex; justify-content: space-between; align-items: center; }
  .agendamento-actions { display: flex; gap: 8px; margin-top: 8px; }
  .status { font-size: 11px; padding: 3px 10px; border-radius: 99px; white-space: nowrap; }
  .status-confirmado { background: #e6f4ea; color: green; }
  .status-pendente { background: #fff8e1; color: #f57c00; }
  .status-cancelado { background: #fdecea; color: red; }
  .barbeiro-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .barbeiro-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e8eaf6; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; color: #3949ab; flex-shrink: 0; }
  .barbeiro-info { flex: 1; min-width: 0; }
  .barbeiro-info p { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .form-group { display: flex; flex-direction: column; gap: 4px; }
  .form-group label { font-size: 13px; color: #888; }
  .form-input { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px; }
  .form-row { display: flex; gap: 8px; }
  @media (max-width: 600px) {
    .grid { grid-template-columns: 1fr; }
    .cards { grid-template-columns: repeat(3, 1fr); }
    .header { flex-direction: column; align-items: flex-start; }
    .header-buttons { width: 100%; justify-content: flex-end; }
    .btn { font-size: 12px; padding: 6px 10px; }
  }
`

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
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Barbearia</h1>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Faça login para continuar</p>
          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input className="form-input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••" />
            </div>
            {erro && <p style={{ color: 'red', fontSize: 13, margin: 0 }}>{erro}</p>}
            <button type="submit" disabled={loading} className="btn btn-dark" style={{ marginTop: 8, padding: 10, fontSize: 15 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
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

  async function excluirBarbeiro(id, nomeBarbeiro) {
    if (!window.confirm(`Excluir o barbeiro "${nomeBarbeiro}"?`)) return
    await supabase.from('barbeiros').delete().eq('id', id)
    buscarBarbeiros()
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
    <>
      <style>{css}</style>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Barbearia</h1>
            <p>Olá, {usuario.nome} 👑</p>
          </div>
          <div className="header-buttons">
            <button onClick={() => setTela('painel')} className={`btn ${tela === 'painel' ? 'btn-dark' : ''}`}>Painel</button>
            <button onClick={() => setTela('agendar')} className={`btn ${tela === 'agendar' ? 'btn-dark' : ''}`}>+ Agendar</button>
            <button onClick={onSair} className="btn">Sair</button>
          </div>
        </div>

        {tela === 'painel' && (
          <>
            <div className="cards">
              <div className="card">
                <p className="card-label">Hoje</p>
                <p className="card-value">{agendamentos.length}</p>
              </div>
              <div className="card">
                <p className="card-label">Confirmados</p>
                <p className="card-value" style={{ color: 'green' }}>{agendamentos.filter(a => a.status === 'confirmado').length}</p>
              </div>
              <div className="card">
                <p className="card-label">Barbeiros</p>
                <p className="card-value">{barbeiros.length}</p>
              </div>
            </div>

            <div className="grid">
              <div className="box">
                <h2>Agendamentos de hoje</h2>
                {agendamentos.length === 0 && <p style={{ color: '#aaa' }}>Nenhum agendamento hoje.</p>}
                {agendamentos.map(a => (
                  <div key={a.id} className="agendamento-item">
                    <div className="agendamento-row">
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{a.horario.slice(0, 5)} — {a.cliente_nome}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{a.barbeiros?.nome} • {a.servico}</p>
                      </div>
                      <span className={`status status-${a.status}`}>{a.status}</span>
                    </div>
                    {a.status === 'pendente' && (
                      <div className="agendamento-actions">
                        <button onClick={() => confirmarAgendamento(a.id)} className="btn-confirm">Confirmar</button>
                        <button onClick={() => cancelarAgendamento(a.id)} className="btn-cancel">Cancelar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="box">
                <h2>Barbeiros</h2>
                {barbeiros.map(b => (
                  <div key={b.id} className="barbeiro-item">
                    <div className="barbeiro-avatar">{b.nome.slice(0, 2).toUpperCase()}</div>
                    <div className="barbeiro-info">
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{b.nome}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>{b.email}</p>
                    </div>
                    <button onClick={() => excluirBarbeiro(b.id, b.nome)} className="btn btn-red">Excluir</button>
                  </div>
                ))}
                {mostrarForm ? (
                  <form onSubmit={cadastrarBarbeiro} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="form-input" placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} />
                    <input className="form-input" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
                    <input className="form-input" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} />
                    <input className="form-input" placeholder="Senha *" value={senha} onChange={e => setSenha(e.target.value)} />
                    <div className="form-row">
                      <button type="submit" disabled={loading} className="btn btn-dark" style={{ flex: 1 }}>{loading ? 'Salvando...' : 'Salvar'}</button>
                      <button type="button" onClick={() => setMostrarForm(false)} className="btn">Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setMostrarForm(true)} className="btn" style={{ marginTop: 12, width: '100%' }}>+ Cadastrar barbeiro</button>
                )}
              </div>
            </div>
          </>
        )}

        {tela === 'agendar' && (
          <div style={{ maxWidth: 500, margin: '0 auto' }} className="box">
            <h2>Novo agendamento</h2>
            <form onSubmit={cadastrarAgendamento} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label>Nome do cliente *</label>
                <input className="form-input" value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Ex: Lucas Mendes" />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input className="form-input" value={clienteTelefone} onChange={e => setClienteTelefone(e.target.value)} placeholder="(11) 99999-0000" />
              </div>
              <div className="form-group">
                <label>Barbeiro *</label>
                <select className="form-input" value={barbeiroEscolhido} onChange={e => setBarbeiroEscolhido(e.target.value)}>
                  <option value="">Escolha o barbeiro</option>
                  {barbeiros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Serviço *</label>
                <select className="form-input" value={servico} onChange={e => setServico(e.target.value)}>
                  <option>Corte</option>
                  <option>Barba</option>
                  <option>Corte + Barba</option>
                  <option>Pigmentação</option>
                  <option>Sobrancelha</option>
                </select>
              </div>
              <div className="form-group">
                <label>Data *</label>
                <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Horário *</label>
                <select className="form-input" value={horario} onChange={e => setHorario(e.target.value)}>
                  <option value="">Escolha o horário</option>
                  {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn btn-dark" style={{ padding: 12, fontSize: 15, marginTop: 8 }}>
                {loading ? 'Salvando...' : 'Confirmar agendamento'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}

function PainelBarbeiro({ usuario, onSair }) {
  const [agendamentos, setAgendamentos] = useState([])
  const [visualizacao, setVisualizacao] = useState('dia')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    buscarAgendamentos()
  }, [visualizacao])

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
    <>
      <style>{css}</style>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Olá, {usuario.nome}! ✂️</h1>
            <p>Seus agendamentos</p>
          </div>
          <div className="header-buttons">
            <button onClick={onSair} className="btn">Sair</button>
          </div>
        </div>

        <div className="cards">
          <div className="card">
            <p className="card-label">Total</p>
            <p className="card-value">{agendamentos.length}</p>
          </div>
          <div className="card">
            <p className="card-label">Confirmados</p>
            <p className="card-value" style={{ color: 'green' }}>{agendamentos.filter(a => a.status === 'confirmado').length}</p>
          </div>
          <div className="card">
            <p className="card-label">Pendentes</p>
            <p className="card-value" style={{ color: '#f57c00' }}>{agendamentos.filter(a => a.status === 'pendente').length}</p>
          </div>
        </div>

        <div className="box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Agendamentos</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setVisualizacao('dia')} className={`btn ${visualizacao === 'dia' ? 'btn-dark' : ''}`}>Hoje</button>
              <button onClick={() => setVisualizacao('semana')} className={`btn ${visualizacao === 'semana' ? 'btn-dark' : ''}`}>Semana</button>
            </div>
          </div>

          {agendamentos.length === 0 && <p style={{ color: '#aaa' }}>Nenhum agendamento {visualizacao === 'dia' ? 'hoje' : 'essa semana'}.</p>}
          {agendamentos.map(a => (
            <div key={a.id} className="agendamento-item">
              <div className="agendamento-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{a.data} às {a.horario.slice(0, 5)}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#444' }}>{a.cliente_nome} • {a.servico}</p>
                  {a.cliente_telefone && <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{a.cliente_telefone}</p>}
                </div>
                <span className={`status status-${a.status}`}>{a.status}</span>
              </div>
              {a.status === 'pendente' && (
                <div className="agendamento-actions">
                  <button onClick={() => confirmar(a.id)} className="btn-confirm">Confirmar</button>
                  <button onClick={() => cancelar(a.id)} className="btn-cancel">Cancelar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function App() {
  const [usuario, setUsuario] = useState(null)

  function onLogin(user) { setUsuario(user) }
  function onSair() { setUsuario(null) }

  if (!usuario) return <Login onLogin={onLogin} />
  if (usuario.tipo === 'dono') return <PainelDono usuario={usuario} onSair={onSair} />
  return <PainelBarbeiro usuario={usuario} onSair={onSair} />
}

export default App