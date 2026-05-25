import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }
  .page { font-family: 'Segoe UI', sans-serif; background: #0a0a0a; min-height: 100vh; color: #fff; }
  
  .hero { 
    background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
    padding: 50px 20px 36px;
    text-align: center;
    border-bottom: 1px solid #222;
  }
  .hero-logo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; border: 2px solid #c9a84c44; }
  .hero-badge {
    display: inline-block;
    background: #c9a84c22;
    border: 1px solid #c9a84c44;
    color: #c9a84c;
    font-size: 11px;
    padding: 4px 14px;
    border-radius: 99px;
    margin-bottom: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .hero h1 { font-size: 32px; font-weight: 700; letter-spacing: -1px; margin-bottom: 8px; }
  .hero h1 span { color: #c9a84c; }
  .hero p { color: #888; font-size: 14px; margin-bottom: 28px; }
  .hero-services { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .hero-service { 
    background: #1a1a1a; 
    border: 1px solid #333; 
    border-radius: 8px; 
    padding: 8px 14px; 
    font-size: 12px; 
    color: #ccc;
  }

  .form-section { padding: 36px 20px; max-width: 480px; margin: 0 auto; }
  .form-title { font-size: 18px; font-weight: 600; margin-bottom: 22px; text-align: center; }
  .form-title span { color: #c9a84c; }

  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 13px; color: #888; margin-bottom: 6px; }
  .form-input {
    width: 100%;
    padding: 12px 14px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    transition: border-color 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }
  .form-input:focus { outline: none; border-color: #c9a84c; }
  .form-input option { background: #1a1a1a; }

  .barbeiro-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .barbeiro-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .barbeiro-card:hover { border-color: #c9a84c44; }
  .barbeiro-card.selected { border-color: #c9a84c; background: #c9a84c11; }
  .barbeiro-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #c9a84c22; border: 1px solid #c9a84c44;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; color: #c9a84c;
    flex-shrink: 0;
  }
  .barbeiro-nome { font-size: 14px; font-weight: 500; }

  .horarios-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .horario-btn {
    padding: 10px 4px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    color: #ccc;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }
  .horario-btn:hover { border-color: #c9a84c44; color: #fff; }
  .horario-btn.selected { border-color: #c9a84c; background: #c9a84c11; color: #c9a84c; font-weight: 600; }
  .horario-btn.ocupado { opacity: 0.3; cursor: not-allowed; }

  .btn-agendar {
    width: 100%;
    padding: 14px;
    background: #c9a84c;
    color: #000;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 24px;
    transition: opacity 0.2s;
    letter-spacing: 0.5px;
  }
  .btn-agendar:hover { opacity: 0.9; }
  .btn-agendar:disabled { opacity: 0.5; cursor: not-allowed; }

  .sucesso {
    text-align: center;
    padding: 60px 20px;
  }
  .sucesso-icon { font-size: 60px; margin-bottom: 16px; }
  .sucesso h2 { font-size: 24px; margin-bottom: 8px; }
  .sucesso p { color: #888; font-size: 15px; margin-bottom: 24px; }
  .btn-novo {
    padding: 12px 24px;
    background: #c9a84c;
    color: #000;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  .footer {
    text-align: center;
    padding: 24px;
    color: #444;
    font-size: 12px;
    border-top: 1px solid #1a1a1a;
  }

  @media (max-width: 400px) {
    .hero h1 { font-size: 26px; }
    .horarios-grid { grid-template-columns: repeat(3, 1fr); }
    .barbeiro-grid { grid-template-columns: 1fr; }
  }
`

const horariosTodos = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

export default function Agendar() {
  const [barbeiros, setBarbeiros] = useState([])
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [barbeiroEscolhido, setBarbeiroEscolhido] = useState(null)
  const [servico, setServico] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => { buscarBarbeiros() }, [])

  useEffect(() => {
    if (barbeiroEscolhido && data) buscarHorariosOcupados()
  }, [barbeiroEscolhido, data])

  async function buscarBarbeiros() {
    const { data } = await supabase.from('barbeiros').select('id, nome').eq('ativo', true).neq('tipo', 'dono')
    if (data) setBarbeiros(data)
  }

  async function buscarHorariosOcupados() {
    const { data } = await supabase
      .from('agendamentos')
      .select('horario')
      .eq('barbeiro_id', barbeiroEscolhido.id)
      .eq('data', data)
      .neq('status', 'cancelado')
    if (data) setHorariosOcupados(data.map(a => a.horario.slice(0, 5)))
  }

  async function agendar() {
    if (!clienteNome || !barbeiroEscolhido || !servico || !data || !horario) {
      return alert('Preencha todos os campos!')
    }
    setLoading(true)
    const { error } = await supabase.from('agendamentos').insert({
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone,
      barbeiro_id: barbeiroEscolhido.id,
      servico, data, horario,
      status: 'pendente'
    })
    if (!error) {
      setSucesso(true)
    } else {
      alert('Erro ao agendar, tente novamente.')
    }
    setLoading(false)
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="page">
      <style>{css}</style>

      <div className="hero">
        <img src="/logo.png" alt="Tropa Barbearia" className="hero-logo" />
        <div className="hero-badge">✂ Since 2022</div>
        <h1>Tropa <span>Barbearia</span></h1>
        <p>Agende seu horário de forma rápida e fácil</p>
        <div className="hero-services">
          <div className="hero-service">✂️ Corte</div>
          <div className="hero-service">🪒 Barba</div>
          <div className="hero-service">💈 Corte + Barba</div>
          <div className="hero-service">🎨 Pigmentação</div>
        </div>
      </div>

      {sucesso ? (
        <div className="sucesso">
          <div className="sucesso-icon">✅</div>
          <h2>Agendamento realizado!</h2>
          <p>Em breve o barbeiro entrará em contato para confirmar seu horário.</p>
          <button className="btn-novo" onClick={() => {
            setSucesso(false); setClienteNome(''); setClienteTelefone('')
            setBarbeiroEscolhido(null); setServico(''); setData(''); setHorario('')
          }}>
            Fazer novo agendamento
          </button>
        </div>
      ) : (
        <div className="form-section">
          <p className="form-title">Agende seu <span>horário</span></p>

          <div className="form-group">
            <label>Seu nome *</label>
            <input className="form-input" value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Ex: João Silva" />
          </div>

          <div className="form-group">
            <label>WhatsApp</label>
            <input className="form-input" value={clienteTelefone} onChange={e => setClienteTelefone(e.target.value)} placeholder="(11) 99999-0000" />
          </div>

          <div className="form-group">
            <label>Escolha o barbeiro *</label>
            <div className="barbeiro-grid">
              {barbeiros.map(b => (
                <div key={b.id} className={`barbeiro-card ${barbeiroEscolhido?.id === b.id ? 'selected' : ''}`} onClick={() => { setBarbeiroEscolhido(b); setHorario('') }}>
                  <div className="barbeiro-avatar">{b.nome.slice(0, 2).toUpperCase()}</div>
                  <span className="barbeiro-nome">{b.nome}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Serviço *</label>
            <select className="form-input" value={servico} onChange={e => setServico(e.target.value)}>
              <option value="">Escolha o serviço</option>
              <option>Corte</option>
              <option>Barba</option>
              <option>Corte + Barba</option>
              <option>Pigmentação</option>
              <option>Sobrancelha</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data *</label>
            <input className="form-input" type="date" value={data} min={hoje} onChange={e => { setData(e.target.value); setHorario('') }} />
          </div>

          {data && barbeiroEscolhido && (
            <div className="form-group">
              <label>Horário *</label>
              <div className="horarios-grid">
                {horariosTodos.map(h => (
                  <div key={h} className={`horario-btn ${horario === h ? 'selected' : ''} ${horariosOcupados.includes(h) ? 'ocupado' : ''}`} onClick={() => !horariosOcupados.includes(h) && setHorario(h)}>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn-agendar" onClick={agendar} disabled={loading}>
            {loading ? 'Agendando...' : 'Confirmar agendamento →'}
          </button>
        </div>
      )}

      <div className="footer">© 2026 Tropa Barbearia • Todos os direitos reservados</div>
    </div>
  )
}